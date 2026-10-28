import {
  createDipaRecord,
  dipaFormSchema,
  type DIPA,
  type DipaFormData,
} from "./dipa.schema";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_dipa";
const LEGACY_PLACEHOLDER = "Belum diisi";

const readText = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const readFirstMeaningfulText = (
  item: Record<string, unknown>,
  keys: string[],
  fallback: string,
) => {
  for (const key of keys) {
    const value = readText(item[key], "");
    if (value && value !== "-" && value !== LEGACY_PLACEHOLDER) {
      return value;
    }
  }

  return fallback;
};

const readAmount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

export const normalizeDipa = (value: unknown, index: number): DIPA => {
  const item =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const currentYear = new Date().getFullYear().toString();
  const legacyCode = readText(
    item.kodeDipa || item.nomor_dipa || item.nomorDipa,
    `DIPA-${index + 1}`,
  );
  const legacyCodeParts = legacyCode.split(".").filter(Boolean);
  const fallbackKodeAkun = legacyCodeParts.pop() ?? legacyCode;
  const fallbackKodeKro = legacyCodeParts.join(".") || legacyCode;
  const rawYear = readText(
    item.tahunAnggaran || item.tahun || item.tahun_anggaran,
    currentYear,
  );
  const formData: DipaFormData = {
    kodeKro: readFirstMeaningfulText(
      item,
      ["kodeKro", "kode_kro", "kodeKlasifikasiRincianOutput"],
      fallbackKodeKro,
    ),
    klasifikasiRincianOutput: readFirstMeaningfulText(
      item,
      ["klasifikasiRincianOutput", "kro", "KlasifikasiRincianOutput", "uraian"],
      legacyCode,
    ),
    kodeAkun: readFirstMeaningfulText(
      item,
      ["kodeAkun", "kode_akun"],
      fallbackKodeAkun,
    ),
    akunPerjalananDinas: readFirstMeaningfulText(
      item,
      ["akunPerjalananDinas", "akun", "Akun", "detil", "program", "uraian"],
      legacyCode,
    ),
    pagu: readAmount(item.pagu ?? item.pagu_awal ?? item.paguAwal),
    tahunAnggaran: /^\d{4}$/.test(rawYear) ? rawYear : currentYear,
  };

  const record = createDipaRecord(
    dipaFormSchema.parse(formData),
    readText(item.id, `dipa-migrated-${index + 1}`),
  );

  if (typeof item.realisasi === "number" && item.realisasi >= 0) {
    record.realisasi = item.realisasi;
  }

  return record;
};

/**
 * Deduplikasi daftar DIPA berdasarkan ID unik, kode DIPA, atau kombinasi Tahun + KRO + Akun
 */
export const deduplicateDipa = (items: DIPA[]): DIPA[] => {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const unique: DIPA[] = [];

  for (const item of items) {
    if (!item) continue;
    const cleanId = (item.id || "").trim();
    if (cleanId && seenIds.has(cleanId)) continue;

    const tahun = (item.tahunAnggaran || "").trim();
    const kode = (item.kodeDipa || "").trim().toLowerCase();
    const kro = (item.kodeKro || "").trim().toLowerCase();
    const akun = (item.kodeAkun || "").trim().toLowerCase();
    const program = (item.program || item.akunPerjalananDinas || "").trim().toLowerCase();

    // Kunci unik: tahun + kode, atau tahun + KRO + akun, atau tahun + program
    const key = kode
      ? `${tahun}::${kode}`
      : kro && akun
      ? `${tahun}::${kro}.${akun}`
      : `${tahun}::${program}`;

    if (key && seenKeys.has(key)) continue;
    if (key) seenKeys.add(key);
    if (cleanId) seenIds.add(cleanId);

    unique.push(item);
  }

  return unique;
};

const defaultDipa: DIPA[] = [];

export const dipaService = {
  getAll: (): DIPA[] => {
    if (typeof window === "undefined") return defaultDipa;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultDipa;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) return defaultDipa;
      const normalized = parsed.map(normalizeDipa);
      const unique = deduplicateDipa(normalized);
      if (unique.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
      }
      return unique;
    } catch {
      return defaultDipa;
    }
  },

  saveAll: (data: DIPA[]) => {
    if (typeof window !== "undefined") {
      const unique = deduplicateDipa(data.map(normalizeDipa));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
    }
  },

  // REST API Integration (/api/v1/anggaran-dipa)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<DIPA[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 100, ...params };
        const res = await apiClient.get<
          DIPA[] | { data?: DIPA[]; items?: DIPA[] }
        >("/api/v1/anggaran-dipa", queryParams);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const normalized = list.map((item: unknown, idx: number) =>
          normalizeDipa(item as Partial<DIPA>, idx),
        );
        const unique = deduplicateDipa(normalized);
        if (unique.length > 0) {
          dipaService.saveAll(unique);
        }
        return unique;
      },
      () => dipaService.getAll(),
    );
  },

  apiGetById: async (id: string): Promise<DIPA | null> => {
    return withApiFallback(
      async () => {
        const item = await apiClient.get<DIPA | { data?: DIPA }>(
          `/api/v1/anggaran-dipa/${id}`,
        );
        const unwrapped = (item as { data?: DIPA }).data || (item as DIPA);
        return unwrapped ? normalizeDipa(unwrapped, 0) : null;
      },
      () => dipaService.getAll().find((d) => d.id === id) || null,
    );
  },

  apiCreate: async (data: Partial<DIPA>): Promise<DIPA> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `dipa-${Date.now()}`, ...data };
        const res = await apiClient.post<DIPA | { data?: DIPA }>(
          "/api/v1/anggaran-dipa",
          payload,
        );
        const unwrapped = (res as { data?: DIPA }).data || (res as DIPA);
        const record = normalizeDipa(unwrapped, 0);
        const current = dipaService.getAll();
        dipaService.saveAll([...current, record]);
        return record;
      },
      async () => {
        const items = dipaService.getAll();
        const newItem = normalizeDipa(
          { ...data, id: data.id || `dipa-${Date.now()}` },
          items.length,
        );
        dipaService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },

  apiUpdate: async (id: string, data: Partial<DIPA>): Promise<DIPA> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<DIPA | { data?: DIPA }>(
          `/api/v1/anggaran-dipa/${id}`,
          data,
        );
        const unwrapped = (res as { data?: DIPA }).data || (res as DIPA);
        const record = normalizeDipa(unwrapped, 0);
        const items = dipaService.getAll();
        const updated = items.map((item) => (item.id === id ? record : item));
        dipaService.saveAll(updated);
        return record;
      },
      async () => {
        const items = dipaService.getAll();
        const updated = items.map((item, idx) =>
          item.id === id ? normalizeDipa({ ...item, ...data }, idx) : item,
        );
        dipaService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/anggaran-dipa/${id}`);
        const items = dipaService.getAll();
        dipaService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
      async () => {
        const items = dipaService.getAll();
        dipaService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },

  apiBulkCreate: async (data: Partial<DIPA>[]): Promise<DIPA[]> => {
    return withApiFallback(
      async () => {
        const uniquePayload = deduplicateDipa(
          data.map((d, idx) => normalizeDipa(d, idx)),
        );
        const res = await apiClient.bulkPost<DIPA[] | { data?: DIPA[] }>(
          "/api/v1/anggaran-dipa",
          uniquePayload,
        );
        const list = Array.isArray(res) ? res : res.data || [];
        const normalized = list.map((item: unknown, idx: number) =>
          normalizeDipa(item as Partial<DIPA>, idx),
        );
        const unique = deduplicateDipa(normalized);
        if (unique.length > 0) {
          dipaService.saveAll(unique);
        }
        return unique;
      },
      async () => {
        const items = dipaService.getAll();
        const normalized = data.map((d, idx) =>
          normalizeDipa(d, items.length + idx),
        );
        const merged = deduplicateDipa([...items, ...normalized]);
        dipaService.saveAll(merged);
        return merged;
      },
    );
  },
};
