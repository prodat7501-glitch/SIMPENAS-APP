import { useActivityStore } from "@/stores/activity.store";
import {
  documentTypes,
  penomoranSchema,
  type DocumentType,
  type NumberHistory,
  type NumberStatus,
  type NumberingConfig,
} from "./penomoran.schema";
import { apiClient, withApiFallback } from "@/services/api";

const CONFIG_KEY = "simpenas_numbering_config";
const HISTORY_KEY = "simpenas_numbering_history";
const LOCK_KEY = "simpenas_numbering_locks";
const months = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
];
const defaults: NumberingConfig[] = [
  {
    documentType: "Nota Dinas",
    format: "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}{SUFFIX}",
    prefix: "ND-KPU",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "SPT",
    format: "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}{SUFFIX}",
    prefix: "ST.KPU-Kab.Gorontalo",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "SPPD",
    format: "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}{SUFFIX}",
    prefix: "SPPD.KPU-Kab.Gorontalo",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "SPBY",
    format: "{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}",
    prefix: "SPBY/KPU-KAB-GTLO",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "Daftar Nominatif",
    format: "{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}",
    prefix: "DAFTAR-NOMINATIF/KPU-KAB-GTLO",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "Tanda Terima",
    format: "{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}",
    prefix: "TANDA-TERIMA/KPU-KAB-GTLO",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
  {
    documentType: "Kuitansi",
    format: "{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}",
    prefix: "KUITANSI/KPU-KAB-GTLO",
    suffix: "",
    year: 2026,
    runningNumber: 1,
    padding: 3,
  },
];

const read = <T>(key: string, fallback: T): T =>
  typeof window === "undefined"
    ? fallback
    : JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));

const write = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const render = (config: NumberingConfig, sequence: number, date: Date) =>
  config.format
    .replaceAll("{RUNNING}", String(sequence).padStart(config.padding, "0"))
    .replaceAll("{PREFIX}", config.prefix)
    .replaceAll("{SUFFIX}", config.suffix)
    .replaceAll("{MONTH_ROMAN}", months[date.getMonth()])
    .replaceAll("{YEAR}", String(date.getFullYear()));

const normalizeHistory = (items: NumberHistory[]): NumberHistory[] =>
  items.map((item) => ({
    ...item,
    status: item.status ?? "Terpakai",
  }));

const getHistory = () =>
  normalizeHistory(read<NumberHistory[]>(HISTORY_KEY, []));

const saveHistory = (items: NumberHistory[]) => {
  write(HISTORY_KEY, normalizeHistory(items));
};

const getHighestSequenceFromNumbers = (numbers: string[]) =>
  numbers.reduce((highest, number) => {
    const parsed = Number(number.trim().split("/")[0]);
    return Number.isInteger(parsed) && parsed > 0
      ? Math.max(highest, parsed)
      : highest;
  }, 0);

const isActiveStatus = (status?: NumberStatus) =>
  status === "Terpakai" || status === "Booking";

const getConfigForType = (type: DocumentType) => {
  const configs = penomoranService.list();
  const index = configs.findIndex((x) => x.documentType === type);
  if (index < 0) throw new Error(`Pengaturan ${type} tidak ditemukan.`);
  return { configs, config: { ...configs[index] }, index };
};

const assertDocumentType = (type: DocumentType) => {
  if (!documentTypes.includes(type)) {
    throw new Error("Jenis dokumen tidak didukung.");
  }
};

const findNextSequence = (
  config: NumberingConfig,
  date: Date,
  history: NumberHistory[],
  minimumSequence = 0,
) => {
  let sequence = Math.max(config.runningNumber, minimumSequence + 1, 1);
  while (
    history.some(
      (item) =>
        item.documentType === config.documentType &&
        item.year === date.getFullYear() &&
        item.sequence === sequence &&
        isActiveStatus(item.status),
    )
  ) {
    sequence += 1;
  }
  return sequence;
};

const updateOrCreateHistoryEntry = (
  history: NumberHistory[],
  entry: NumberHistory,
) => {
  const index = history.findIndex((item) => item.id === entry.id);
  if (index < 0) return [entry, ...history];
  const updated = [...history];
  updated[index] = entry;
  return updated;
};

export const penomoranService = {
  list: () => {
    const stored = read<NumberingConfig[]>(CONFIG_KEY, []);
    const storedByType = new Map(
      stored.map((config) => [config.documentType, config]),
    );
    return defaults.map((fallback) => {
      const config = storedByType.get(fallback.documentType) ?? fallback;
      return {
        ...config,
        runningNumber: Math.max(1, config.runningNumber),
      };
    });
  },

  apiListConfigs: async (): Promise<NumberingConfig[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<NumberingConfig[] | { data?: NumberingConfig[]; items?: NumberingConfig[] }>("/api/pengaturan_penomoran");
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => penomoranService.list()
    );
  },

  history: () => getHistory(),

  apiListHistory: async (): Promise<NumberHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<NumberHistory[] | { data?: NumberHistory[]; items?: NumberHistory[] }>("/api/riwayat_penomoran");
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return normalizeHistory(list);
      },
      () => getHistory()
    );
  },

  preview: (
    config: NumberingConfig,
    date = new Date(),
    persistedNumbers?: string[],
  ) => {
    const persisted = persistedNumbers
      ? new Set(persistedNumbers.map((number) => number.trim()))
      : null;
    const history = getHistory().filter(
      (item) =>
        !persisted ||
        item.documentType !== config.documentType ||
        item.status !== "Terpakai" ||
        persisted.has(item.number),
    );
    const minimumSequence = persistedNumbers
      ? getHighestSequenceFromNumbers(persistedNumbers)
      : 0;
    const sequence = findNextSequence(config, date, history, minimumSequence);
    return render(config, sequence, date);
  },
  configuredNumber: (config: NumberingConfig, date = new Date()) =>
    render(config, Math.max(1, config.runningNumber), date),
  formatNumber: (type: DocumentType, sequence: number, dateStr?: string) => {
    const config = penomoranService.list().find((x) => x.documentType === type);
    if (!config) throw new Error(`Pengaturan ${type} tidak ditemukan.`);
    const date = new Date(dateStr || Date.now());
    if (Number.isNaN(date.getTime()))
      throw new Error("Tanggal dokumen tidak valid.");
    return render(config, sequence, date);
  },
  update: (input: NumberingConfig) => {
    const parsed = penomoranSchema.parse(input);
    const configs = penomoranService
      .list()
      .map((item) =>
        item.documentType === parsed.documentType ? parsed : item,
      );
    write(CONFIG_KEY, configs);
    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `Format ${parsed.documentType} diperbarui`,
      user: "Administrator",
    });
    return parsed;
  },
  reconcileUsedNumbers: (
    type: DocumentType,
    persistedNumbers: string[],
    note = "Riwayat Terpakai direkonsiliasi karena dokumen sumber tidak tersedia.",
  ) => {
    assertDocumentType(type);
    const persisted = new Set(
      persistedNumbers.map((number) => number.trim()).filter(Boolean),
    );
    const history = getHistory();
    const orphaned = history.filter(
      (item) =>
        item.documentType === type &&
        item.status === "Terpakai" &&
        !persisted.has(item.number),
    );
    if (!orphaned.length) return [];

    const orphanedIds = new Set(orphaned.map((item) => item.id));
    const updatedAt = new Date().toISOString();
    saveHistory(
      history.map((item) =>
        orphanedIds.has(item.id)
          ? { ...item, status: "Dibatalkan", note, updatedAt }
          : item,
      ),
    );

    const { configs, config, index } = getConfigForType(type);
    const firstReusable = Math.min(...orphaned.map((item) => item.sequence));
    config.runningNumber = Math.min(config.runningNumber, firstReusable);
    configs[index] = config;
    write(CONFIG_KEY, configs);

    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `${orphaned.length} riwayat Terpakai ${type} tanpa dokumen direkonsiliasi`,
      user: "Sistem",
    });
    return orphaned;
  },
  requestNumber: (
    type: DocumentType,
    dateStr?: string,
    minimumSequence = 0,
  ) => {
    if (typeof window === "undefined") {
      return render(
        defaults.find((x) => x.documentType === type)!,
        1,
        new Date(dateStr || Date.now()),
      );
    }

    assertDocumentType(type);
    const locks = read<Record<string, number>>(LOCK_KEY, {});
    const now = Date.now();
    if (locks[type] && now - locks[type] < 5000)
      throw new Error(
        `Penomoran ${type} sedang diproses. Silakan coba kembali.`,
      );
    write(LOCK_KEY, { ...locks, [type]: now });

    try {
      const date = new Date(dateStr || Date.now());
      if (Number.isNaN(date.getTime()))
        throw new Error("Tanggal dokumen tidak valid.");

      const { configs, config, index } = getConfigForType(type);
      if (config.year !== date.getFullYear()) {
        config.year = date.getFullYear();
        config.runningNumber = 1;
      }

      const history = getHistory();
      const sequence = findNextSequence(config, date, history, minimumSequence);
      const number = render(config, sequence, date);
      config.runningNumber = sequence + 1;
      configs[index] = config;

      const reusable = history.find(
        (item) =>
          item.documentType === type &&
          item.year === date.getFullYear() &&
          item.sequence === sequence &&
          item.status === "Dibatalkan",
      );
      const entry: NumberHistory = {
        id: reusable?.id ?? `nomor-${now}-${sequence}`,
        documentType: type,
        number,
        sequence,
        year: date.getFullYear(),
        createdAt: reusable?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "Terpakai",
        note: reusable?.note,
        bookedFor: reusable?.bookedFor,
      };

      write(CONFIG_KEY, configs);
      saveHistory(updateOrCreateHistoryEntry(history, entry));
      useActivityStore.getState().add({
        action: "Generate",
        module: "Pengaturan Penomoran",
        description: `${type}: ${number}`,
        user: "Pengguna Ambil Nomor",
      });
      return number;
    } finally {
      const current = read<Record<string, number>>(LOCK_KEY, {});
      delete current[type];
      write(LOCK_KEY, current);
    }
  },
  bookNumber: (input: {
    documentType: DocumentType;
    date: string;
    sequence?: number;
    bookedFor?: string;
    note?: string;
  }) => {
    assertDocumentType(input.documentType);
    const date = new Date(input.date || Date.now());
    if (Number.isNaN(date.getTime()))
      throw new Error("Tanggal booking nomor tidak valid.");

    const { config } = getConfigForType(input.documentType);
    if (config.year !== date.getFullYear()) {
      config.year = date.getFullYear();
      config.runningNumber = 1;
    }

    const history = getHistory();
    const sequence =
      input.sequence && input.sequence > 0
        ? input.sequence
        : findNextSequence(config, date, history);
    const number = render(config, sequence, date);
    const activeConflict = history.find(
      (item) =>
        item.documentType === input.documentType &&
        item.year === date.getFullYear() &&
        item.sequence === sequence &&
        isActiveStatus(item.status),
    );
    if (activeConflict)
      throw new Error(`Nomor ${number} sudah ${activeConflict.status}.`);

    const reusable = history.find(
      (item) =>
        item.documentType === input.documentType &&
        item.year === date.getFullYear() &&
        item.sequence === sequence &&
        item.status === "Dibatalkan",
    );
    const entry: NumberHistory = {
      id: reusable?.id ?? `booking-${Date.now()}-${sequence}`,
      documentType: input.documentType,
      number,
      sequence,
      year: date.getFullYear(),
      createdAt: reusable?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "Booking",
      bookedFor: input.bookedFor?.trim() || undefined,
      note: input.note?.trim() || undefined,
    };
    saveHistory(updateOrCreateHistoryEntry(history, entry));
    useActivityStore.getState().add({
      action: "Create",
      module: "Pengaturan Penomoran",
      description: `Booking ${input.documentType}: ${number}`,
      user: "Administrator",
    });
    return entry;
  },
  cancelBooking: (id: string, note?: string) => {
    const history = getHistory();
    const target = history.find((item) => item.id === id);
    if (!target) throw new Error("Data nomor tidak ditemukan.");
    if (target.status !== "Booking")
      throw new Error("Hanya nomor booking yang dapat dibatalkan.");

    const updated: NumberHistory = {
      ...target,
      status: "Dibatalkan",
      note: note?.trim() || target.note,
      updatedAt: new Date().toISOString(),
    };
    saveHistory(updateOrCreateHistoryEntry(history, updated));
    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `Booking dibatalkan: ${target.number}`,
      user: "Administrator",
    });
    return updated;
  },
  releaseNumber: (
    type: DocumentType,
    number: string,
    note = "Dokumen dibatalkan atau dihapus sebelum selesai.",
  ) => {
    const history = getHistory();
    const target = history.find(
      (item) =>
        item.documentType === type &&
        item.number === number &&
        item.status === "Terpakai",
    );
    if (!target) return null;

    const updated: NumberHistory = {
      ...target,
      status: "Dibatalkan",
      note,
      updatedAt: new Date().toISOString(),
    };
    saveHistory(updateOrCreateHistoryEntry(history, updated));
    const { configs, config, index } = getConfigForType(type);
    if (
      config.year === target.year &&
      target.sequence === config.runningNumber - 1
    ) {
      config.runningNumber = target.sequence;
      configs[index] = config;
      write(CONFIG_KEY, configs);
    }
    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `Nomor ${type} dikembalikan: ${number}`,
      user: "Sistem",
    });
    return updated;
  },

  // REST API Integration (/api/v1/pengaturan-penomoran & /api/v1/riwayat-penomoran)
  apiGetConfigs: async (): Promise<NumberingConfig[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<NumberingConfig[] | { data?: NumberingConfig[]; items?: NumberingConfig[] }>("/api/v1/pengaturan-penomoran");
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return list.length > 0 ? list : penomoranService.list();
      },
      () => penomoranService.list()
    );
  },

  apiSaveConfig: async (config: NumberingConfig): Promise<NumberingConfig> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<NumberingConfig | { data?: NumberingConfig }>(`/api/v1/pengaturan-penomoran/${config.documentType.toLowerCase().replace(/\s+/g, "-")}`, config);
        const unwrapped = (res as { data?: NumberingConfig }).data || (res as NumberingConfig);
        return unwrapped;
      },
      () => penomoranService.update(config)
    );
  },

  apiGetHistories: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<NumberHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<NumberHistory[] | { data?: NumberHistory[]; items?: NumberHistory[] }>("/api/v1/riwayat-penomoran", params);
        return Array.isArray(res) ? res : res.data || res.items || [];
      },
      () => getHistory()
    );
  },

  apiCreateHistory: async (data: Partial<NumberHistory>): Promise<NumberHistory> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `rh-${Date.now()}`, ...data };
        const res = await apiClient.post<NumberHistory | { data?: NumberHistory }>("/api/v1/riwayat-penomoran", payload);
        const unwrapped = (res as { data?: NumberHistory }).data || (res as NumberHistory);
        return unwrapped;
      },
      () => {
        const history = getHistory();
        const newItem = { ...data, id: data.id || `rh-${Date.now()}` } as NumberHistory;
        saveHistory(updateOrCreateHistoryEntry(history, newItem));
        return newItem;
      }
    );
  },

  apiUpdateHistory: async (id: string, data: Partial<NumberHistory>): Promise<NumberHistory> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<NumberHistory | { data?: NumberHistory }>(`/api/v1/riwayat-penomoran/${id}`, data);
        const unwrapped = (res as { data?: NumberHistory }).data || (res as NumberHistory);
        return unwrapped;
      },
      () => {
        const history = getHistory();
        const updated = history.map((item: NumberHistory) => (item.id === id ? { ...item, ...data } : item));
        saveHistory(updated);
        return updated.find((i: NumberHistory) => i.id === id)!;
      }
    );
  },

  apiDeleteHistory: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/riwayat-penomoran/${id}`);
        return true;
      },
      () => {
        const history = getHistory();
        saveHistory(history.filter((item: NumberHistory) => item.id !== id));
        return true;
      }
    );
  },
};

