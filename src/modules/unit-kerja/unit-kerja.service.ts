import { UnitKerja } from "./unit-kerja.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_unit_kerja";

const defaultUnitKerja: UnitKerja[] = [
  { id: "u1", kode: "UN001", nama: "Sekretariat KPU" },
  { id: "u2", kode: "UN002", nama: "Sub Bagian Teknis Penyelenggaraan" },
  { id: "u3", kode: "UN003", nama: "Sub Bagian Perencanaan, Data & Informasi" },
  { id: "u4", kode: "UN004", nama: "Sub Bagian Keuangan, Umum & Logistik" },
  { id: "u5", kode: "UN005", nama: "Sub Bagian Hukum & SDM" },
];

export const unitKerjaService = {
  getAll: (): UnitKerja[] => {
    if (typeof window === "undefined") return defaultUnitKerja;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUnitKerja));
      return defaultUnitKerja;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: UnitKerja[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/unit_kerja)
  apiGetAll: async (params?: { limit?: number; offset?: number }): Promise<UnitKerja[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<UnitKerja[] | { data?: UnitKerja[]; items?: UnitKerja[] }>("/api/unit_kerja", params);
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => unitKerjaService.getAll()
    );
  },
  apiGetById: async (id: string): Promise<UnitKerja | null> => {
    return withApiFallback(
      async () => apiClient.get<UnitKerja>(`/api/unit_kerja/${id}`),
      () => unitKerjaService.getAll().find((u) => u.id === id) || null
    );
  },
  apiCreate: async (data: Partial<UnitKerja>): Promise<UnitKerja> => {
    return withApiFallback(
      async () => apiClient.post<UnitKerja>("/api/unit_kerja", data),
      async () => {
        const items = unitKerjaService.getAll();
        const newItem = { ...data, id: data.id || `u${Date.now()}` } as UnitKerja;
        unitKerjaService.saveAll([...items, newItem]);
        return newItem;
      }
    );
  },
  apiUpdate: async (id: string, data: Partial<UnitKerja>): Promise<UnitKerja> => {
    return withApiFallback(
      async () => apiClient.patch<UnitKerja>(`/api/unit_kerja/${id}`, data),
      async () => {
        const items = unitKerjaService.getAll();
        const updated = items.map((item) => (item.id === id ? { ...item, ...data } : item));
        unitKerjaService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      }
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/unit_kerja/${id}`);
        return true;
      },
      async () => {
        const items = unitKerjaService.getAll();
        unitKerjaService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
    );
  },
};

