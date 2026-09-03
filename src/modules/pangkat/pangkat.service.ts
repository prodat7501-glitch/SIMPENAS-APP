import { Pangkat } from "./pangkat.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_pangkat";

const defaultPangkat: Pangkat[] = [
  { id: "p1", golongan: "IV/b", namaPangkat: "Pembina Tingkat I" },
  { id: "p2", golongan: "IV/a", namaPangkat: "Pembina" },
  { id: "p3", golongan: "III/d", namaPangkat: "Penata Tingkat I" },
  { id: "p4", golongan: "III/c", namaPangkat: "Penata" },
  { id: "p5", golongan: "III/b", namaPangkat: "Penata Muda Tingkat I" },
  { id: "p6", golongan: "III/a", namaPangkat: "Penata Muda" },
];

export const pangkatService = {
  getAll: (): Pangkat[] => {
    if (typeof window === "undefined") return defaultPangkat;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPangkat));
      return defaultPangkat;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: Pangkat[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/v1/pangkat-golongan)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Pangkat[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 100, ...params };
        const res = await apiClient.get<
          Pangkat[] | { data?: Pangkat[]; items?: Pangkat[] }
        >("/api/v1/pangkat-golongan", queryParams);
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => pangkatService.getAll(),
    );
  },
  apiGetById: async (id: string): Promise<Pangkat | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Pangkat | { data?: Pangkat }>(
          `/api/v1/pangkat-golongan/${id}`,
        );
        return (res as { data?: Pangkat }).data || (res as Pangkat) || null;
      },
      () => pangkatService.getAll().find((p) => p.id === id) || null,
    );
  },
  apiCreate: async (data: Partial<Pangkat>): Promise<Pangkat> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `p-${Date.now()}`, ...data };
        const res = await apiClient.post<Pangkat | { data?: Pangkat }>(
          "/api/v1/pangkat-golongan",
          payload,
        );
        return (res as { data?: Pangkat }).data || (res as Pangkat);
      },
      async () => {
        const items = pangkatService.getAll();
        const newItem = { ...data, id: data.id || `p${Date.now()}` } as Pangkat;
        pangkatService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },
  apiUpdate: async (id: string, data: Partial<Pangkat>): Promise<Pangkat> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<Pangkat | { data?: Pangkat }>(
          `/api/v1/pangkat-golongan/${id}`,
          data,
        );
        return (res as { data?: Pangkat }).data || (res as Pangkat);
      },
      async () => {
        const items = pangkatService.getAll();
        const updated = items.map((item) =>
          item.id === id ? { ...item, ...data } : item,
        );
        pangkatService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/pangkat-golongan/${id}`);
        return true;
      },
      async () => {
        const items = pangkatService.getAll();
        pangkatService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },
  apiBulkCreate: async (data: Partial<Pangkat>[]): Promise<Pangkat[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<Pangkat[] | { data?: Pangkat[] }>(
          "/api/v1/pangkat-golongan",
          data,
        );
        return Array.isArray(res) ? res : res.data || [];
      },
      async () => {
        const items = pangkatService.getAll();
        pangkatService.saveAll([...items, ...(data as Pangkat[])]);
        return data as Pangkat[];
      },
    );
  },
};
