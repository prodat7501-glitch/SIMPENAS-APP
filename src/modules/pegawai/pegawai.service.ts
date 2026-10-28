import { Pegawai } from "./pegawai.schema";
import { jabatanService } from "@/modules/jabatan/jabatan.service";
import { pangkatService } from "@/modules/pangkat/pangkat.service";
import { sortPegawais } from "./pegawai-order";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_pegawai";
const DEFAULT_KATEGORI_PEGAWAI = "ASN/Sekretariat";
const DEFAULT_ROLE_APLIKASI = "Pegawai";

const normalizePegawai = (item: Pegawai | Record<string, unknown>): Pegawai => {
  const raw = item as Record<string, unknown>;
  return {
    id: String(raw.id || ""),
    nama: String(raw.nama || ""),
    nip: String(raw.nip || ""),
    jabatanId: String(raw.jabatanId || raw.jabatan_id || ""),
    unitKerjaId: String(raw.unitKerjaId || raw.unit_kerja_id || ""),
    pangkatId: String(raw.pangkatId || raw.pangkat_id || ""),
    kategoriPegawai: (raw.kategoriPegawai || raw.kategori_pegawai || DEFAULT_KATEGORI_PEGAWAI) as Pegawai["kategoriPegawai"],
    roleAplikasi: (raw.roleAplikasi || raw.role_aplikasi || DEFAULT_ROLE_APLIKASI) as Pegawai["roleAplikasi"],
    status: (raw.status === "Nonaktif" || raw.status === false || raw.status === "false" ? "Nonaktif" : "Aktif") as Pegawai["status"],
  };
};

export const isDummyPegawai = (p: Pegawai | Record<string, unknown>): boolean => {
  const raw = p as Record<string, unknown>;
  const nama = String(raw.nama || "").trim().toLowerCase();
  const nip = String(raw.nip || "").replace(/\s+/g, "");
  // Jangan blokir berdasarkan id pg1/pg2/pg3 agar pengguna leluasa mengisinya dengan data pegawai riil
  if (nama === "andi saputra" || nama.includes("herman monoarfa")) return true;
  if (nama === "eriyanto" && nip === "199008152018011002") return true;
  if (nip === "198502122012011001" || nip === "197508242002121002") return true;
  return false;
};

export const deduplicatePegawais = (items: Pegawai[]): Pegawai[] => {
  const seenIds = new Set<string>();
  const seenNips = new Set<string>();
  const seenNames = new Set<string>();
  const unique: Pegawai[] = [];

  for (const item of items) {
    if (!item.id || isDummyPegawai(item)) continue;
    if (seenIds.has(item.id)) continue;

    const nipClean = (item.nip || "").replace(/\s+/g, "");
    const nameClean = (item.nama || "").trim().toLowerCase();

    if (nipClean && nipClean !== "-" && nipClean !== "0") {
      if (seenNips.has(nipClean)) continue;
      seenNips.add(nipClean);
    } else if (nameClean) {
      if (seenNames.has(nameClean)) continue;
      seenNames.add(nameClean);
    }

    seenIds.add(item.id);
    unique.push(item);
  }

  return unique;
};

const defaultPegawai: Pegawai[] = [];

export const pegawaiService = {
  getAll: (): Pegawai[] => {
    if (typeof window === "undefined") return defaultPegawai;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored) as Pegawai[];
      const normalized = (Array.isArray(parsed) ? parsed : [])
        .map(normalizePegawai);
      const unique = deduplicatePegawais(normalized);
      if (unique.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
      }
      return sortPegawais(
        unique,
        jabatanService.getAll(),
        pangkatService.getAll(),
      );
    } catch {
      return [];
    }
  },
  saveAll: (data: Pegawai[]) => {
    if (typeof window !== "undefined") {
      const unique = deduplicatePegawais(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    }
  },
  // REST API Integration (/api/v1/pegawai)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Pegawai[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 500, ...params };
        const res = await apiClient.get<
          Pegawai[] | { data?: Pegawai[]; items?: Pegawai[] }
        >("/api/v1/pegawai", queryParams);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const normalized = list.map(normalizePegawai);
        const unique = deduplicatePegawais(normalized);
        if (unique.length > 0) {
          pegawaiService.saveAll(unique);
        }
        return sortPegawais(
          unique,
          jabatanService.getAll(),
          pangkatService.getAll(),
        );
      },
      () => pegawaiService.getAll(),
    );
  },
  apiGetById: async (id: string): Promise<Pegawai | null> => {
    return withApiFallback(
      async () => {
        const item = await apiClient.get<Pegawai | { data?: Pegawai }>(
          `/api/v1/pegawai/${id}`,
        );
        const unwrapped =
          (item as { data?: Pegawai }).data || (item as Pegawai);
        return unwrapped ? normalizePegawai(unwrapped) : null;
      },
      () => pegawaiService.getAll().find((p) => p.id === id) || null,
    );
  },
  apiCreate: async (data: Partial<Pegawai>): Promise<Pegawai> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `pg-${Date.now()}`, ...data };
        const res = await apiClient.post<Pegawai | { data?: Pegawai }>(
          "/api/v1/pegawai",
          payload,
        );
        const unwrapped = (res as { data?: Pegawai }).data || (res as Pegawai);
        return normalizePegawai(unwrapped);
      },
      async () => {
        const items = pegawaiService.getAll();
        const newItem = normalizePegawai({
          ...data,
          id: data.id || `pg-${Date.now()}`,
        } as Pegawai);
        pegawaiService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },
  apiUpdate: async (id: string, data: Partial<Pegawai>): Promise<Pegawai> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<Pegawai | { data?: Pegawai }>(
          `/api/v1/pegawai/${id}`,
          data,
        );
        const unwrapped = (res as { data?: Pegawai }).data || (res as Pegawai);
        return normalizePegawai(unwrapped);
      },
      async () => {
        const items = pegawaiService.getAll();
        const updated = items.map((item) =>
          item.id === id ? normalizePegawai({ ...item, ...data }) : item,
        );
        pegawaiService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/pegawai/${id}`);
        return true;
      },
      async () => {
        const items = pegawaiService.getAll();
        pegawaiService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },
  apiBulkCreate: async (data: Partial<Pegawai>[]): Promise<Pegawai[]> => {
    return withApiFallback(
      async () => {
        const uniquePayload = deduplicatePegawais(
          data.map((d) => normalizePegawai(d as Pegawai)),
        );
        const res = await apiClient.bulkPost<
          Pegawai[] | { data?: Pegawai[] }
        >("/api/v1/pegawai", uniquePayload);
        const list = Array.isArray(res) ? res : res.data || [];
        const unique = deduplicatePegawais(list.map(normalizePegawai));
        if (unique.length > 0) {
          pegawaiService.saveAll(unique);
        }
        return unique;
      },
      async () => {
        const items = pegawaiService.getAll();
        const normalized = data.map((d) => normalizePegawai(d as Pegawai));
        const merged = deduplicatePegawais([...items, ...normalized]);
        pegawaiService.saveAll(merged);
        return merged;
      },
    );
  },
};
