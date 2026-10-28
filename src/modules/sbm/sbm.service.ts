import { SBM } from "./sbm.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_sbm";

const defaultSbm: SBM[] = [
  {
    id: "s1",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Dalam Kota",
    satuan: "OH",
    tarif: 150000,
  },
  {
    id: "s2",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Luar Kota",
    satuan: "OH",
    tarif: 370000,
  },
  {
    id: "s3",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Luar Daerah (DKI Jakarta)",
    satuan: "OH",
    tarif: 530000,
  },
  {
    id: "s4",
    wilayah: "DKI Jakarta",
    jenisBiaya: "Akomodasi Hotel Bintang 4",
    satuan: "Malam",
    tarif: 1200000,
  },
  {
    id: "s5",
    wilayah: "Gorontalo",
    jenisBiaya: "Transport Bandara Jalur Darat",
    satuan: "Kali",
    tarif: 250000,
  },
];

export const normalizeSbm = (raw: unknown): SBM => {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      wilayah: "-",
      jenisBiaya: "-",
      satuan: "OH",
      tarif: 0,
    };
  }
  const item = raw as Record<string, unknown>;
  const id = String(item.id || "");
  const wilayah = String(
    item.wilayah || item.provinsi || item.daerah || "Gorontalo",
  ).trim();
  const jenisBiaya = String(
    item.jenisBiaya || item.jenis_biaya || item.kategori || "Uang Harian",
  ).trim();
  const satuan = String(item.satuan || "OH").trim();
  const tarif = Number(
    item.tarif ?? item.uangHarian ?? item.uang_harian ?? item.biaya ?? 0,
  );

  return {
    id,
    wilayah: wilayah || "-",
    jenisBiaya: jenisBiaya || "-",
    satuan: satuan || "OH",
    tarif: isNaN(tarif) ? 0 : tarif,
  };
};

export const expandOrNormalizeSbmList = (list: unknown[]): SBM[] => {
  if (!Array.isArray(list) || list.length === 0) return defaultSbm;

  const result: SBM[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;

    // Jika data sudah dalam format SBM standar (wilayah & jenisBiaya)
    if (item.wilayah || item.jenisBiaya || item.jenis_biaya) {
      result.push(normalizeSbm(item));
      continue;
    }

    // Jika data dalam format tabel provinsi Google Sheets (uang_harian, penginapan, dsb.)
    const prov = String(item.provinsi || item.wilayah || "Standar").trim();
    const baseId = String(item.id || `sbm-${Date.now()}`);

    if (item.uang_harian !== undefined && Number(item.uang_harian) > 0) {
      result.push({
        id: `${baseId}-uh`,
        wilayah: prov,
        jenisBiaya: `Uang Harian (${prov})`,
        satuan: "OH",
        tarif: Number(item.uang_harian),
      });
    }
    if (item.penginapan !== undefined && Number(item.penginapan) > 0) {
      result.push({
        id: `${baseId}-hotel`,
        wilayah: prov,
        jenisBiaya: `Penginapan / Hotel (${prov})`,
        satuan: "Malam",
        tarif: Number(item.penginapan),
      });
    }
    if (
      item.uang_representasi !== undefined &&
      Number(item.uang_representasi) > 0
    ) {
      result.push({
        id: `${baseId}-rep`,
        wilayah: prov,
        jenisBiaya: `Uang Representasi (${prov})`,
        satuan: "Hari",
        tarif: Number(item.uang_representasi),
      });
    }
    if (
      item.sewa_kendaraan !== undefined &&
      Number(item.sewa_kendaraan) > 0
    ) {
      result.push({
        id: `${baseId}-sewa`,
        wilayah: prov,
        jenisBiaya: `Sewa Kendaraan (${prov})`,
        satuan: "Hari",
        tarif: Number(item.sewa_kendaraan),
      });
    }
    if (item.tiket_pesawat !== undefined && Number(item.tiket_pesawat) > 0) {
      result.push({
        id: `${baseId}-tiket`,
        wilayah: prov,
        jenisBiaya: `Tiket Pesawat (${prov})`,
        satuan: "PP",
        tarif: Number(item.tiket_pesawat),
      });
    }

    // Jika row tidak memiliki nilai komponen biaya di atas
    if (
      !item.uang_harian &&
      !item.penginapan &&
      !item.uang_representasi &&
      !item.sewa_kendaraan &&
      !item.tiket_pesawat
    ) {
      result.push(normalizeSbm(item));
    }
  }

  return result.length > 0 ? result : defaultSbm;
};

export const sbmService = {
  getAll: (): SBM[] => {
    if (typeof window === "undefined") return defaultSbm;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSbm));
      return defaultSbm;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return expandOrNormalizeSbmList(parsed);
      }
      return defaultSbm;
    } catch {
      return defaultSbm;
    }
  },
  saveAll: (data: SBM[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  // REST API Integration (/api/v1/sbm)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<SBM[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 500, ...params };
        const res = await apiClient.get<
          SBM[] | { data?: SBM[]; items?: SBM[] }
        >("/api/v1/sbm", queryParams);
        const rawList = Array.isArray(res)
          ? res
          : (res as { data?: SBM[]; items?: SBM[] })?.data ||
            (res as { data?: SBM[]; items?: SBM[] })?.items ||
            [];
        const expanded = expandOrNormalizeSbmList(rawList);
        if (expanded.length > 0) {
          sbmService.saveAll(expanded);
        }
        return expanded;
      },
      () => sbmService.getAll(),
    );
  },

  apiGetById: async (id: string): Promise<SBM | null> => {
    return withApiFallback(
      async () => {
        const item = await apiClient.get<SBM | { data?: SBM }>(
          `/api/v1/sbm/${id}`,
        );
        const unwrapped = (item as { data?: SBM }).data || (item as SBM);
        return unwrapped ? normalizeSbm(unwrapped) : null;
      },
      () => sbmService.getAll().find((s) => s.id === id) || null,
    );
  },

  apiCreate: async (data: Partial<SBM>): Promise<SBM> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `sbm-${Date.now()}`, ...data };
        const res = await apiClient.post<SBM | { data?: SBM }>(
          "/api/v1/sbm",
          payload,
        );
        const unwrapped = (res as { data?: SBM }).data || (res as SBM);
        return normalizeSbm(unwrapped);
      },
      async () => {
        const items = sbmService.getAll();
        const newItem = normalizeSbm({
          ...data,
          id: data.id || `sbm-${Date.now()}`,
        });
        sbmService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },

  apiUpdate: async (id: string, data: Partial<SBM>): Promise<SBM> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<SBM | { data?: SBM }>(
          `/api/v1/sbm/${id}`,
          data,
        );
        const unwrapped = (res as { data?: SBM }).data || (res as SBM);
        return normalizeSbm(unwrapped);
      },
      async () => {
        const items = sbmService.getAll();
        const updated = items.map((item) =>
          item.id === id ? normalizeSbm({ ...item, ...data }) : item,
        );
        sbmService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/sbm/${id}`);
        return true;
      },
      async () => {
        const items = sbmService.getAll();
        sbmService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },

  apiBulkCreate: async (data: Partial<SBM>[]): Promise<SBM[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<SBM[] | { data?: SBM[] }>(
          "/api/v1/sbm",
          data,
        );
        const raw =
          Array.isArray(res) ? res : (res as { data?: SBM[] })?.data || [];
        return expandOrNormalizeSbmList(raw);
      },
      async () => {
        const items = sbmService.getAll();
        const normalized = (data as SBM[]).map(normalizeSbm);
        const map = new Map(items.map((i) => [i.id || `${i.jenisBiaya}-${i.wilayah}`.toLowerCase(), i]));
        normalized.forEach((item) => {
          if (item) map.set(item.id || `${item.jenisBiaya}-${item.wilayah}`.toLowerCase(), item);
        });
        const merged = Array.from(map.values());
        sbmService.saveAll(merged);
        return merged;
      },
    );
  },
};
