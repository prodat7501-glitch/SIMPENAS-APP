import { Pegawai } from "./pegawai.schema";
import { jabatanService } from "@/modules/jabatan/jabatan.service";
import { pangkatService } from "@/modules/pangkat/pangkat.service";
import { sortPegawais } from "./pegawai-order";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_pegawai";
const DEFAULT_KATEGORI_PEGAWAI = "ASN/Sekretariat";
const DEFAULT_ROLE_APLIKASI = "Pegawai";

const normalizePegawai = (item: Pegawai): Pegawai => ({
  ...item,
  kategoriPegawai: item.kategoriPegawai ?? DEFAULT_KATEGORI_PEGAWAI,
  nip: item.nip ?? "",
  pangkatId: item.pangkatId ?? "",
  roleAplikasi: item.roleAplikasi ?? DEFAULT_ROLE_APLIKASI,
  status: item.status ?? "Aktif",
});

const defaultPegawai: Pegawai[] = [
  {
    id: "pg1",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19900815 201801 1 002",
    nama: "Eriyanto",
    jabatanId: "j4",
    unitKerjaId: "u4",
    pangkatId: "p6",
    roleAplikasi: "Pegawai",
    status: "Aktif",
  },
  {
    id: "pg2",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19850212 201201 1 001",
    nama: "Andi Saputra",
    jabatanId: "j3",
    unitKerjaId: "u4",
    pangkatId: "p4",
    roleAplikasi: "Supervisor",
    status: "Aktif",
  },
  {
    id: "pg3",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19750824 200212 1 002",
    nama: "Herman Monoarfa, M.Si",
    jabatanId: "j1",
    unitKerjaId: "u1",
    pangkatId: "p1",
    roleAplikasi: "Supervisor",
    status: "Aktif",
  },
];

export const pegawaiService = {
  getAll: (): Pegawai[] => {
    if (typeof window === "undefined") return defaultPegawai;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPegawai));
      return sortPegawais(
        defaultPegawai,
        jabatanService.getAll(),
        pangkatService.getAll(),
      );
    }
    const parsed = JSON.parse(stored) as Pegawai[];
    const normalized = parsed.map(normalizePegawai);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return sortPegawais(
      normalized,
      jabatanService.getAll(),
      pangkatService.getAll(),
    );
  },
  saveAll: (data: Pegawai[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/pegawai)
  apiGetAll: async (params?: { limit?: number; offset?: number }): Promise<Pegawai[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Pegawai[] | { data?: Pegawai[]; items?: Pegawai[] }>("/api/pegawai", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return sortPegawais(
          list.map(normalizePegawai),
          jabatanService.getAll(),
          pangkatService.getAll()
        );
      },
      () => pegawaiService.getAll()
    );
  },
  apiGetById: async (id: string): Promise<Pegawai | null> => {
    return withApiFallback(
      async () => {
        const item = await apiClient.get<Pegawai | { data?: Pegawai }>(`/api/pegawai/${id}`);
        const unwrapped = (item as { data?: Pegawai }).data || (item as Pegawai);
        return unwrapped ? normalizePegawai(unwrapped) : null;
      },
      () => pegawaiService.getAll().find((p) => p.id === id) || null
    );
  },
  apiCreate: async (data: Partial<Pegawai>): Promise<Pegawai> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<Pegawai | { data?: Pegawai }>("/api/pegawai", data);
        const unwrapped = (res as { data?: Pegawai }).data || (res as Pegawai);
        return normalizePegawai(unwrapped);
      },
      async () => {
        const items = pegawaiService.getAll();
        const newItem = normalizePegawai({ ...data, id: data.id || `pg-${Date.now()}` } as Pegawai);
        pegawaiService.saveAll([...items, newItem]);
        return newItem;
      }
    );
  },
  apiUpdate: async (id: string, data: Partial<Pegawai>): Promise<Pegawai> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.patch<Pegawai | { data?: Pegawai }>(`/api/pegawai/${id}`, data);
        const unwrapped = (res as { data?: Pegawai }).data || (res as Pegawai);
        return normalizePegawai(unwrapped);
      },
      async () => {
        const items = pegawaiService.getAll();
        const updated = items.map((item) => (item.id === id ? normalizePegawai({ ...item, ...data }) : item));
        pegawaiService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      }
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/pegawai/${id}`);
        return true;
      },
      async () => {
        const items = pegawaiService.getAll();
        pegawaiService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
    );
  },
};

