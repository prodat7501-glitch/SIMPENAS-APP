import { Jabatan } from "./jabatan.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_jabatan";

const defaultJabatan: Jabatan[] = [
  { id: "j1", kode: "JAB001", nama: "Kepala Sekretariat" },
  { id: "j2", kode: "JAB002", nama: "Kasubag Keuangan" },
  { id: "j3", kode: "JAB003", nama: "Kasubag Umum & Logistik" },
  { id: "j4", kode: "JAB004", nama: "Staf Pelaksana" },
];

export const jabatanService = {
  getAll: (): Jabatan[] => {
    if (typeof window === "undefined") return defaultJabatan;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultJabatan));
      return defaultJabatan;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: Jabatan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/jabatan)
  apiGetAll: async (params?: { limit?: number; offset?: number }): Promise<Jabatan[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Jabatan[] | { data?: Jabatan[]; items?: Jabatan[] }>("/api/jabatan", params);
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => jabatanService.getAll()
    );
  },
  apiGetById: async (id: string): Promise<Jabatan | null> => {
    return withApiFallback(
      async () => apiClient.get<Jabatan>(`/api/jabatan/${id}`),
      () => jabatanService.getAll().find((j) => j.id === id) || null
    );
  },
  apiCreate: async (data: Partial<Jabatan>): Promise<Jabatan> => {
    return withApiFallback(
      async () => apiClient.post<Jabatan>("/api/jabatan", data),
      async () => {
        const items = jabatanService.getAll();
        const newItem = { ...data, id: data.id || `j${Date.now()}` } as Jabatan;
        jabatanService.saveAll([...items, newItem]);
        return newItem;
      }
    );
  },
  apiUpdate: async (id: string, data: Partial<Jabatan>): Promise<Jabatan> => {
    return withApiFallback(
      async () => apiClient.patch<Jabatan>(`/api/jabatan/${id}`, data),
      async () => {
        const items = jabatanService.getAll();
        const updated = items.map((item) => (item.id === id ? { ...item, ...data } : item));
        jabatanService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      }
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/jabatan/${id}`);
        return true;
      },
      async () => {
        const items = jabatanService.getAll();
        jabatanService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
    );
  },
};

