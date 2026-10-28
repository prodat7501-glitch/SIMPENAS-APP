import { Pangkat } from "./pangkat.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_pangkat";

export const normalizePangkat = (raw: unknown): Pangkat => {
  if (!raw || typeof raw !== "object") {
    return { id: "", golongan: "-", namaPangkat: "-" };
  }
  const item = raw as Record<string, unknown>;
  const id = String(item.id || "");
  const namaPangkat = String(
    item.namaPangkat || item.nama_pangkat || item.nama || "",
  ).trim();

  let golongan = String(item.golongan || "").trim();
  if (!golongan && item.gol) {
    const golStr = String(item.gol).trim();
    const ruangStr = item.ruang ? String(item.ruang).trim() : "";
    if (ruangStr && ruangStr !== "-") {
      golongan = `${golStr}/${ruangStr}`;
    } else {
      golongan = golStr;
    }
  }

  return {
    id,
    golongan: golongan || "-",
    namaPangkat: namaPangkat || "-",
  };
};

const defaultPangkat: Pangkat[] = [
  { id: "p1", golongan: "IV/b", namaPangkat: "Pembina Tingkat I" },
  { id: "p2", golongan: "IV/a", namaPangkat: "Pembina" },
  { id: "p3", golongan: "III/d", namaPangkat: "Penata Tingkat I" },
  { id: "p4", golongan: "III/c", namaPangkat: "Penata" },
  { id: "p5", golongan: "III/b", namaPangkat: "Penata Muda Tingkat I" },
  { id: "p6", golongan: "III/a", namaPangkat: "Penata Muda" },
  { id: "p7", golongan: "II/d", namaPangkat: "Pengatur Tingkat I" },
  { id: "p8", golongan: "IX", namaPangkat: "Ahli Pertama" },
  { id: "p9", golongan: "V", namaPangkat: "Pemula" },
  { id: "p10", golongan: "III", namaPangkat: "Pelaksana" },
  { id: "p11", golongan: "I", namaPangkat: "Pelaksana" },
];

export const pangkatService = {
  getAll: (): Pangkat[] => {
    if (typeof window === "undefined") return defaultPangkat;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPangkat));
      return defaultPangkat;
    }
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizePangkat);
      }
      return defaultPangkat;
    } catch {
      return defaultPangkat;
    }
  },
  saveAll: (data: Pangkat[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  // REST API Integration (/api/v1/pangkat dan /api/v1/pangkat-golongan)
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
        let res: unknown;
        try {
          res = await apiClient.get<
            Pangkat[] | { data?: Pangkat[]; items?: Pangkat[] }
          >("/api/v1/pangkat", queryParams);
        } catch {
          res = await apiClient.get<
            Pangkat[] | { data?: Pangkat[]; items?: Pangkat[] }
          >("/api/v1/pangkat-golongan", queryParams);
        }
        const rawList = Array.isArray(res)
          ? res
          : (res as { data?: Pangkat[]; items?: Pangkat[] })?.data ||
            (res as { data?: Pangkat[]; items?: Pangkat[] })?.items ||
            [];
        const normalized = rawList.map(normalizePangkat);
        if (normalized.length > 0) {
          pangkatService.saveAll(normalized);
        }
        return normalized;
      },
      () => pangkatService.getAll(),
    );
  },
  apiGetById: async (id: string): Promise<Pangkat | null> => {
    return withApiFallback(
      async () => {
        let res: unknown;
        try {
          res = await apiClient.get<Pangkat | { data?: Pangkat }>(
            `/api/v1/pangkat/${id}`,
          );
        } catch {
          res = await apiClient.get<Pangkat | { data?: Pangkat }>(
            `/api/v1/pangkat-golongan/${id}`,
          );
        }
        const unwrapped =
          (res as { data?: Pangkat }).data || (res as Pangkat) || null;
        return unwrapped ? normalizePangkat(unwrapped) : null;
      },
      () => pangkatService.getAll().find((p) => p.id === id) || null,
    );
  },
  apiCreate: async (data: Partial<Pangkat>): Promise<Pangkat> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `p-${Date.now()}`, ...data };
        let res: unknown;
        try {
          res = await apiClient.post<Pangkat | { data?: Pangkat }>(
            "/api/v1/pangkat",
            payload,
          );
        } catch {
          res = await apiClient.post<Pangkat | { data?: Pangkat }>(
            "/api/v1/pangkat-golongan",
            payload,
          );
        }
        const created = (res as { data?: Pangkat }).data || (res as Pangkat);
        return normalizePangkat(created);
      },
      async () => {
        const items = pangkatService.getAll();
        const newItem = normalizePangkat({
          ...data,
          id: data.id || `p${Date.now()}`,
        });
        pangkatService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },
  apiUpdate: async (id: string, data: Partial<Pangkat>): Promise<Pangkat> => {
    return withApiFallback(
      async () => {
        let res: unknown;
        try {
          res = await apiClient.put<Pangkat | { data?: Pangkat }>(
            `/api/v1/pangkat/${id}`,
            data,
          );
        } catch {
          res = await apiClient.put<Pangkat | { data?: Pangkat }>(
            `/api/v1/pangkat-golongan/${id}`,
            data,
          );
        }
        const updated = (res as { data?: Pangkat }).data || (res as Pangkat);
        return normalizePangkat(updated);
      },
      async () => {
        const items = pangkatService.getAll();
        const updated = items.map((item) =>
          item.id === id ? normalizePangkat({ ...item, ...data }) : item,
        );
        pangkatService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },
  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        try {
          await apiClient.delete(`/api/v1/pangkat/${id}`);
        } catch {
          await apiClient.delete(`/api/v1/pangkat-golongan/${id}`);
        }
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
        let res: unknown;
        try {
          res = await apiClient.bulkPost<Pangkat[] | { data?: Pangkat[] }>(
            "/api/v1/pangkat",
            data,
          );
        } catch {
          res = await apiClient.bulkPost<Pangkat[] | { data?: Pangkat[] }>(
            "/api/v1/pangkat-golongan",
            data,
          );
        }
        const raw = Array.isArray(res) ? res : (res as { data?: Pangkat[] })?.data || [];
        return raw.map(normalizePangkat);
      },
      async () => {
        const items = pangkatService.getAll();
        const normalizedItems = (data as Pangkat[]).map(normalizePangkat);
        const map = new Map(items.map((i) => [i.id || `${i.golongan}-${i.namaPangkat}`.toLowerCase(), i]));
        normalizedItems.forEach((item) => {
          if (item) map.set(item.id || `${item.golongan}-${item.namaPangkat}`.toLowerCase(), item);
        });
        const merged = Array.from(map.values());
        pangkatService.saveAll(merged);
        return merged;
      },
    );
  },
};
