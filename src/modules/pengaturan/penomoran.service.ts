import { useActivityStore } from "@/stores/activity.store";
import {
  documentTypes,
  penomoranSchema,
  type DocumentType,
  type NumberHistory,
  type NumberStatus,
  type NumberingConfig,
} from "./penomoran.schema";

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
    runningNumber: 0,
    padding: 3,
  },
  {
    documentType: "SPT",
    format: "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}{SUFFIX}",
    prefix: "ST.KPU-Kab.Gorontalo",
    suffix: "",
    year: 2026,
    runningNumber: 0,
    padding: 3,
  },
  {
    documentType: "SPPD",
    format: "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}{SUFFIX}",
    prefix: "SPPD.KPU-Kab.Gorontalo",
    suffix: "",
    year: 2026,
    runningNumber: 0,
    padding: 3,
  },
  {
    documentType: "SPBY",
    format: "{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}",
    prefix: "SPBY/KPU-KAB-GTLO",
    suffix: "",
    year: 2026,
    runningNumber: 0,
    padding: 3,
  },
];

const read = <T,>(key: string, fallback: T): T =>
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

const getHistory = () => normalizeHistory(read<NumberHistory[]>(HISTORY_KEY, []));

const saveHistory = (items: NumberHistory[]) => {
  write(HISTORY_KEY, normalizeHistory(items));
};

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

const findReusableEntry = (
  history: NumberHistory[],
  type: DocumentType,
  year: number,
  minimumSequence: number,
) =>
  history
    .filter(
      (item) =>
        item.documentType === type &&
        item.year === year &&
        item.status === "Dibatalkan" &&
        item.sequence > minimumSequence,
    )
    .sort((a, b) => a.sequence - b.sequence)
    .find(
      (candidate) =>
        !history.some(
          (item) =>
            item.documentType === type &&
            item.year === year &&
            item.sequence === candidate.sequence &&
            isActiveStatus(item.status),
        ),
    );

const findNextSequence = (
  config: NumberingConfig,
  date: Date,
  history: NumberHistory[],
  minimumSequence = 0,
) => {
  const reusable = findReusableEntry(
    history,
    config.documentType,
    date.getFullYear(),
    minimumSequence,
  );
  if (reusable) return reusable.sequence;

  let sequence = Math.max(config.runningNumber, minimumSequence) + 1;
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
  list: () => read<NumberingConfig[]>(CONFIG_KEY, defaults),
  history: () => getHistory(),
  preview: (config: NumberingConfig, date = new Date()) => {
    const history = getHistory();
    const sequence = findNextSequence(config, date, history);
    return render(config, sequence, date);
  },
  formatNumber: (type: DocumentType, sequence: number, dateStr?: string) => {
    const config = penomoranService
      .list()
      .find((x) => x.documentType === type);
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
      throw new Error(`Penomoran ${type} sedang diproses. Silakan coba kembali.`);
    write(LOCK_KEY, { ...locks, [type]: now });

    try {
      const date = new Date(dateStr || Date.now());
      if (Number.isNaN(date.getTime()))
        throw new Error("Tanggal dokumen tidak valid.");

      const { configs, config, index } = getConfigForType(type);
      if (config.year !== date.getFullYear()) {
        config.year = date.getFullYear();
        config.runningNumber = 0;
      }

      const history = getHistory();
      const sequence = findNextSequence(
        config,
        date,
        history,
        minimumSequence,
      );
      const number = render(config, sequence, date);
      config.runningNumber = Math.max(config.runningNumber, sequence);
      configs[index] = config;

      const reusable = findReusableEntry(
        history,
        type,
        date.getFullYear(),
        minimumSequence,
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
      config.runningNumber = 0;
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
    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `Nomor ${type} dikembalikan: ${number}`,
      user: "Sistem",
    });
    return updated;
  },
};
