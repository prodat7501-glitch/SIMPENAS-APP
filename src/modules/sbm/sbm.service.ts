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

export const sbmService = {
  getAll: (): SBM[] => {
    if (typeof window === "undefined") return defaultSbm;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSbm));
      return defaultSbm;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: SBM[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  // REST API Integration (/api/sbm)
  apiGetAll: async (params?: { limit?: number; offset?: number }): Promise<SBM[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<SBM[] | { data?: SBM[]; items?: SBM[] }>("/api/sbm", params);
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => sbmService.getAll()
    );
  },

  apiGetById: async (id: string): Promise<SBM | null> => {
    return withApiFallback(
      async () => apiClient.get<SBM>(`/api/sbm/${id}`),
      () => sbmService.getAll().find((s) => s.id === id) || null
    );
  },

  apiCreate: async (data: Partial<SBM>): Promise<SBM> => {
    return withApiFallback(
      async () => apiClient.post<SBM>("/api/sbm", data),
      async () => {
        const items = sbmService.getAll();
        const newItem = { ...data, id: data.id || `sbm-${Date.now()}` } as SBM;
        sbmService.saveAll([...items, newItem]);
        return newItem;
      }
    );
  },

  apiUpdate: async (id: string, data: Partial<SBM>): Promise<SBM> => {
    return withApiFallback(
      async () => apiClient.patch<SBM>(`/api/sbm/${id}`, data),
      async () => {
        const items = sbmService.getAll();
        const updated = items.map((item) => (item.id === id ? { ...item, ...data } : item));
        sbmService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      }
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/sbm/${id}`);
        return true;
      },
      async () => {
        const items = sbmService.getAll();
        sbmService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
    );
  },
};

