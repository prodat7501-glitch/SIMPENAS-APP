import type { Laporan } from "./laporan.schema";
import type { LaporanPayload, LaporanStatus } from "./laporan.types";
import { apiClient, withApiFallback } from "@/services/api";

const DATABASE_NAME = "simpenas-laporan-perjalanan";
const DATABASE_VERSION = 1;
const STORE_NAME = "laporan";
const LEGACY_STORAGE_KEY = "simpenas_laporan_perjalanan";
const MIGRATION_KEY = "simpenas_laporan_indexeddb_migrated";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(
        new Error(
          "Penyimpanan Laporan tidak tersedia pada browser ini. Gunakan browser modern dan pastikan mode privat tidak memblokir penyimpanan situs.",
        ),
      );
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        request.error ?? new Error("Gagal membuka penyimpanan Laporan."),
      );
  });

const runRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Operasi penyimpanan Laporan gagal."));
  });

const waitForTransaction = (transaction: IDBTransaction): Promise<void> =>
  new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(
        transaction.error ?? new Error("Penyimpanan Laporan gagal diproses."),
      );
    transaction.onabort = () =>
      reject(
        transaction.error ?? new Error("Penyimpanan Laporan dibatalkan."),
      );
  });

const readDatabaseItems = async (): Promise<Laporan[]> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    return await runRequest(
      transaction.objectStore(STORE_NAME).getAll() as IDBRequest<Laporan[]>,
    );
  } finally {
    database.close();
  }
};

const writeDatabaseItems = async (items: Laporan[]): Promise<void> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const completed = waitForTransaction(transaction);
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    items.forEach((item) => store.put(item));
    await completed;
  } finally {
    database.close();
  }
};

const putDatabaseItem = async (item: Laporan): Promise<void> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const completed = waitForTransaction(transaction);
    transaction.objectStore(STORE_NAME).put(item);
    await completed;
  } finally {
    database.close();
  }
};

const deleteDatabaseItem = async (id: string): Promise<void> => {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    const completed = waitForTransaction(transaction);
    transaction.objectStore(STORE_NAME).delete(id);
    await completed;
  } finally {
    database.close();
  }
};

const buildDasarPelaksanaan = (item: Partial<Laporan>) =>
  item.dasarPelaksanaan ||
  `Surat Tugas\t: ${item.suratTugas ?? "Sekretaris KPU"}\nNomor\t: ${
    item.nomorSuratTugas ?? ""
  }\nTanggal\t: ${item.tanggalSuratTugas ?? ""}`;

const buildTempatWaktu = (item: Partial<Laporan>) =>
  item.tempatWaktu ||
  `Tempat Pelaksanaan\t: ${item.tempatPelaksanaan ?? ""}\nHari / Tanggal\t: ${
    item.hariTanggalPelaksanaan ?? ""
  }`;

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `laporan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeLaporan = (item: Partial<Laporan>): Laporan => ({
  id: item.id ?? createId(),
  sptId: item.sptId ?? "",
  sppdId: item.sppdId ?? "",
  pelaksanaId: item.pelaksanaId ?? "",
  judulLaporan: item.judulLaporan ?? "Laporan Perjalanan Dinas",
  suratTugas: item.suratTugas ?? "Sekretaris KPU",
  nomorSuratTugas: item.nomorSuratTugas ?? "",
  tanggalSuratTugas: item.tanggalSuratTugas ?? "",
  dasarPelaksanaan: buildDasarPelaksanaan(item),
  maksud: item.maksud ?? "",
  tujuan: item.tujuan ?? "",
  tempatPelaksanaan: item.tempatPelaksanaan ?? "",
  hariTanggalPelaksanaan: item.hariTanggalPelaksanaan ?? "",
  tempatWaktu: buildTempatWaktu(item),
  materi: item.materi ?? "",
  hasilPelaksanaan: item.hasilPelaksanaan ?? "",
  kalimatPenutup: item.kalimatPenutup ?? "",
  dokumentasi: (item.dokumentasi ?? []).map((foto) => ({
    ...foto,
    caption: foto.caption ?? "",
  })),
  tandaTangan: item.tandaTangan || "manual",
  status: item.status ?? "Draft",
  catatanVerifikasi: item.catatanVerifikasi ?? "",
  tempatLaporan: item.tempatLaporan ?? "Limboto",
  tanggalLaporan: item.tanggalLaporan ?? new Date().toISOString().slice(0, 10),
});

const readLegacyItems = (): Laporan[] => {
  if (typeof localStorage === "undefined") return [];
  const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as Partial<Laporan>[];
    return Array.isArray(parsed) ? parsed.map(normalizeLaporan) : [];
  } catch {
    throw new Error(
      "Data Laporan lama tidak dapat dibaca. Ekspor Data Demo sebelum membersihkan penyimpanan browser.",
    );
  }
};

const markMigrationComplete = () => {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  localStorage.setItem(MIGRATION_KEY, "complete");
};

const ensureLegacyMigration = async () => {
  if (
    typeof localStorage === "undefined" ||
    localStorage.getItem(MIGRATION_KEY) === "complete"
  ) {
    return;
  }

  const databaseItems = await readDatabaseItems();
  const legacyItems = readLegacyItems();
  if (legacyItems.length) {
    const merged = new Map<string, Laporan>();
    legacyItems.forEach((item) => merged.set(item.id!, item));
    databaseItems.forEach((item) => merged.set(item.id!, item));
    await writeDatabaseItems(Array.from(merged.values()));
  }
  markMigrationComplete();
};

const getItems = async (): Promise<Laporan[]> => {
  return withApiFallback(
    async () => {
      const res = await apiClient.get<Laporan[] | { data?: Laporan[]; items?: Laporan[] }>("/api/laporan_perjalanan");
      const list = Array.isArray(res) ? res : res.data || res.items || [];
      return list.map(normalizeLaporan);
    },
    async () => {
      await ensureLegacyMigration();
      return (await readDatabaseItems()).map(normalizeLaporan);
    }
  );
};

const replaceAll = async (items: Laporan[]): Promise<void> => {
  const normalized = items.map(normalizeLaporan);
  await writeDatabaseItems(normalized);
  markMigrationComplete();
};

export const laporanService = {
  list: getItems,
  apiGetById: async (id: string): Promise<Laporan | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Laporan | null>(`/api/laporan_perjalanan/${id}`);
        return res ? normalizeLaporan(res) : null;
      },
      async () => {
        const items = await getItems();
        return items.find((l) => l.id === id) || null;
      }
    );
  },
  create: async (payload: LaporanPayload) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<Laporan>("/api/laporan_perjalanan", payload);
        return normalizeLaporan(res);
      },
      async () => {
        const items = await getItems();
        if (items.some((item) => item.sptId === payload.sptId)) {
          throw new Error("Laporan untuk Nomor SPT ini sudah dibuat.");
        }
        const item: Laporan = normalizeLaporan({ ...payload, id: createId() });
        await putDatabaseItem(item);
        return item;
      }
    );
  },
  update: async (id: string, payload: LaporanPayload) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.patch<Laporan>(`/api/laporan_perjalanan/${id}`, payload);
        return normalizeLaporan(res);
      },
      async () => {
        const items = await getItems();
        if (!items.some((item) => item.id === id)) {
          throw new Error("Laporan tidak ditemukan.");
        }
        if (items.some((item) => item.id !== id && item.sptId === payload.sptId)) {
          throw new Error("Laporan untuk Nomor SPT ini sudah dibuat.");
        }
        const updated: Laporan = normalizeLaporan({ ...payload, id });
        await putDatabaseItem(updated);
        return updated;
      }
    );
  },
  remove: async (id: string) => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/laporan_perjalanan/${id}`);
      },
      async () => {
        await ensureLegacyMigration();
        await deleteDatabaseItem(id);
      }
    );
  },
  verify: async (
    id: string,
    status: Extract<LaporanStatus, "Perlu Revisi" | "Terverifikasi">,
    catatan: string,
  ) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.patch<Laporan>(`/api/laporan_perjalanan/${id}`, { status, catatanVerifikasi: catatan });
        return normalizeLaporan(res);
      },
      async () => {
        const items = await getItems();
        const target = items.find((item) => item.id === id);
        if (!target) throw new Error("Laporan tidak ditemukan.");
        if (status === "Perlu Revisi" && catatan.trim().length < 3) {
          throw new Error("Catatan revisi wajib diisi.");
        }
        const updated = normalizeLaporan({
          ...target,
          status,
          catatanVerifikasi: catatan,
        });
        await putDatabaseItem(updated);
        return updated;
      }
    );
  },
  exportRecords: getItems,
  replaceAll,
};

