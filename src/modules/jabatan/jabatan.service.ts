import { Jabatan } from "./jabatan.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_jabatan";

const defaultJabatan: Jabatan[] = [
  { id: "j1", kode: "JAB001", nama: "Sekretaris KPU" },
  { id: "j2", kode: "JAB002", nama: "Kepala Sub Bagian Keuangan" },
  { id: "j3", kode: "JAB003", nama: "Kepala Sub Bagian Teknis dan Hukum" },
  { id: "j4", kode: "JAB004", nama: "Staf Pelaksana" },
  { id: "j5", kode: "JAB005", nama: "Ketua KPU" },
  { id: "j6", kode: "JAB006", nama: "Anggota KPU" },
];

const sortJabatan = (list: Jabatan[]): Jabatan[] => {
  return [...list].sort((a, b) => {
    const codeA = a.kode || "";
    const codeB = b.kode || "";
    if (codeA !== codeB) {
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: "base" });
    }
    return (a.id || "").localeCompare(b.id || "", undefined, { numeric: true, sensitivity: "base" });
  });
};

export const jabatanService = {
  getAll: (): Jabatan[] => {
    if (typeof window === "undefined") return sortJabatan(defaultJabatan);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultJabatan));
      return sortJabatan(defaultJabatan);
    }
    return sortJabatan(JSON.parse(stored));
  },
  saveAll: (data: Jabatan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/v1/jabatan)
  apiGetAll: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<Jabatan[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Jabatan[] | { data?: Jabatan[]; items?: Jabatan[] }>("/api/v1/jabatan", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return sortJabatan(list);
      },
      () => jabatanService.getAll()
    );
  },
  apiGetById: async (id: string): Promise<Jabatan | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Jabatan | { data?: Jabatan }>(`/api/v1/jabatan/${id}`);
        return (res as { data?: Jabatan }).data || (res as Jabatan) || null;
      },
      () => jabatanService.getAll().find((j) => j.id === id) || null
    );
  },
  apiCreate: async (data: Partial<Jabatan>): Promise<Jabatan> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `j-${Date.now()}`, ...data };
        const res = await apiClient.post<Jabatan | { data?: Jabatan }>("/api/v1/jabatan", payload);
        return (res as { data?: Jabatan }).data || (res as Jabatan);
      },
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
      async () => {
        const res = await apiClient.put<Jabatan | { data?: Jabatan }>(`/api/v1/jabatan/${id}`, data);
        return (res as { data?: Jabatan }).data || (res as Jabatan);
      },
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
        await apiClient.delete(`/api/v1/jabatan/${id}`);
        return true;
      },
      async () => {
        const items = jabatanService.getAll();
        jabatanService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
    );
  },
  apiBulkCreate: async (data: Partial<Jabatan>[]): Promise<Jabatan[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<Jabatan[] | { data?: Jabatan[] }>("/api/v1/jabatan", data);
        return Array.isArray(res) ? res : res.data || [];
      },
      async () => {
        const items = jabatanService.getAll();
        jabatanService.saveAll([...items, ...(data as Jabatan[])]);
        return data as Jabatan[];
      }
    );
  },
};
