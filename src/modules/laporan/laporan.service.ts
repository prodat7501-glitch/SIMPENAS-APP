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

const buildLaporanApiBody = (payload: LaporanPayload, id?: string) => ({
  ...payload,
  ...(id ? { id } : {}),
  metode_laporan: payload.metodeLaporan || "form",
  metodeLaporan: payload.metodeLaporan || "form",
  file_laporan: payload.fileLaporan,
  file_laporan_json: payload.fileLaporan,
  fileLaporan: payload.fileLaporan,
  spt_id: payload.sptId,
  sppd_id: payload.sppdId,
  pelaksana_id: payload.pelaksanaId,
  judul_laporan: payload.judulLaporan,
  surat_tugas: payload.suratTugas,
  nomor_surat_tugas: payload.nomorSuratTugas,
  tanggal_surat_tugas: payload.tanggalSuratTugas,
  dasar_pelaksanaan: payload.dasarPelaksanaan,
  maksud: payload.maksud,
  maksud_perjalanan: payload.maksud,
  tujuan: payload.tujuan,
  tempat_tujuan: payload.tujuan,
  tempat_pelaksanaan: payload.tempatPelaksanaan,
  hari_tanggal_pelaksanaan: payload.hariTanggalPelaksanaan,
  tempat_waktu: payload.tempatWaktu,
  materi: payload.materi,
  hasil_pelaksanaan: payload.hasilPelaksanaan,
  hasil_perjalanan: payload.hasilPelaksanaan,
  hasilPelaksanaan: payload.hasilPelaksanaan,
  kalimat_penutup: payload.kalimatPenutup,
  kesimpulan: payload.kalimatPenutup,
  kalimatPenutup: payload.kalimatPenutup,
  dokumentasi: payload.dokumentasi,
  dokumentasi_json: payload.dokumentasi,
  tanda_tangan: payload.tandaTangan,
  status: payload.status,
  catatan_verifikasi: payload.catatanVerifikasi,
  tempat_laporan: payload.tempatLaporan,
  tanggal_laporan: payload.tanggalLaporan,
});

const normalizeLaporan = (item: Partial<Laporan>): Laporan => {
  const metodeLaporan =
    item.metodeLaporan ??
    ((item as Record<string, unknown>).metode_laporan as "form" | "upload") ??
    "form";

  let rawFile =
    item.fileLaporan ??
    (item as Record<string, unknown>).file_laporan ??
    (item as Record<string, unknown>).file_laporan_json;
  if (typeof rawFile === "string") {
    try {
      rawFile = JSON.parse(rawFile);
    } catch {
      rawFile = null;
    }
  }

  const rawDataUrl =
    rawFile && typeof rawFile === "object"
      ? (rawFile as Record<string, unknown>).dataUrl ||
        (rawFile as Record<string, unknown>).data_url ||
        (rawFile as Record<string, unknown>).url ||
        (rawFile as Record<string, unknown>).viewUrl ||
        (rawFile as Record<string, unknown>).downloadUrl ||
        ""
      : "";

  const fileLaporan =
    rawFile && typeof rawFile === "object" && rawDataUrl
      ? {
          id: String((rawFile as Record<string, unknown>).id || `file-${Date.now()}`),
          nama: String((rawFile as Record<string, unknown>).nama || "Dokumen Laporan"),
          dataUrl: String(rawDataUrl),
          tipe: String((rawFile as Record<string, unknown>).tipe || (rawFile as Record<string, unknown>).type || ""),
          ukuran: Number((rawFile as Record<string, unknown>).ukuran || (rawFile as Record<string, unknown>).size || 0),
        }
      : null;

  return {
    id: item.id ?? createId(),
    metodeLaporan,
    fileLaporan,
    sptId: item.sptId ?? (item as Record<string, unknown>).spt_id as string ?? "",
    sppdId: item.sppdId ?? (item as Record<string, unknown>).sppd_id as string ?? "",
    pelaksanaId: item.pelaksanaId ?? (item as Record<string, unknown>).pelaksana_id as string ?? "",
    judulLaporan: item.judulLaporan ?? "Laporan Perjalanan Dinas",
    suratTugas: item.suratTugas ?? "Sekretaris KPU",
    nomorSuratTugas: item.nomorSuratTugas ?? (item as Record<string, unknown>).nomor_surat_tugas as string ?? "",
    tanggalSuratTugas: item.tanggalSuratTugas ?? (item as Record<string, unknown>).tanggal_surat_tugas as string ?? "",
    dasarPelaksanaan: buildDasarPelaksanaan(item),
    maksud: item.maksud ?? (item as Record<string, unknown>).maksud_perjalanan as string ?? "",
    tujuan: item.tujuan ?? (item as Record<string, unknown>).tempat_tujuan as string ?? "",
    tempatPelaksanaan: item.tempatPelaksanaan ?? (item as Record<string, unknown>).tempat_pelaksanaan as string ?? "",
    hariTanggalPelaksanaan: item.hariTanggalPelaksanaan ?? (item as Record<string, unknown>).hari_tanggal_pelaksanaan as string ?? "",
    tempatWaktu: buildTempatWaktu(item),
    materi: item.materi ?? "",
    hasilPelaksanaan: item.hasilPelaksanaan ?? (item as Record<string, unknown>).hasil_perjalanan as string ?? "",
    kalimatPenutup: item.kalimatPenutup ?? (item as Record<string, unknown>).kesimpulan as string ?? "",
    dokumentasi: (() => {
      let raw = item.dokumentasi ?? (item as Record<string, unknown>).dokumentasi_json;
      if (typeof raw === "string") {
        try { raw = JSON.parse(raw); } catch { raw = []; }
      }
      return (Array.isArray(raw) ? raw : []).map((foto: unknown, idx: number) => {
        const f = (foto && typeof foto === "object" ? foto : {}) as Record<string, unknown>;
        return {
          id: String(f.id || `dok-${Date.now()}-${idx}`),
          nama: String(f.nama || `Dokumentasi ${idx + 1}`),
          dataUrl: String(f.dataUrl || f.url || ""),
          caption: (f.caption as string) ?? "",
        };
      });
    })(),
    tandaTangan: item.tandaTangan || "manual",
    status: item.status ?? "Draft",
    catatanVerifikasi: item.catatanVerifikasi ?? (item as Record<string, unknown>).catatan_verifikasi as string ?? (item as Record<string, unknown>).catatan as string ?? "",
    tempatLaporan: item.tempatLaporan ?? "Limboto",
    tanggalLaporan: item.tanggalLaporan ?? (item as Record<string, unknown>).tanggal_laporan as string ?? new Date().toISOString().slice(0, 10),
  };
};

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

const getItems = async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<Laporan[]> => {
  return withApiFallback(
    async () => {
      const res = await apiClient.get<Laporan[] | { data?: Laporan[]; items?: Laporan[] }>("/api/v1/laporan-perjalanan", params);
      const list = Array.isArray(res) ? res : res.data || res.items || [];
      const remoteItems = list.map(normalizeLaporan);

      // Sinkronkan dengan IndexedDB: Jika data lokal memiliki fileLaporan base64, pertahankan agar preview instan tidak hilang
      const localItems = await readDatabaseItems();
      const localMap = new Map(localItems.map((item) => [item.id!, item]));

      const merged = remoteItems.map((remote) => {
        const local = localMap.get(remote.id!);
        if (local?.fileLaporan?.dataUrl) {
          if (!remote.fileLaporan?.dataUrl || !remote.fileLaporan.dataUrl.startsWith("data:")) {
            return {
              ...remote,
              fileLaporan: {
                ...remote.fileLaporan,
                ...local.fileLaporan,
              },
            };
          }
        }
        return remote;
      });

      await writeDatabaseItems(merged);
      return merged;
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
        const res = await apiClient.get<Laporan | { data?: Laporan }>(`/api/v1/laporan-perjalanan/${id}`);
        const unwrapped = (res as { data?: Laporan }).data || (res as Laporan);
        return unwrapped ? normalizeLaporan(unwrapped) : null;
      },
      async () => {
        const items = await readDatabaseItems();
        return items.find((l) => l.id === id) || null;
      }
    );
  },
  create: async (payload: LaporanPayload) => {
    return withApiFallback(
      async () => {
        const body = buildLaporanApiBody(payload);
        const res = await apiClient.post<Laporan | { data?: Laporan }>("/api/v1/laporan-perjalanan", body);
        const unwrapped = (res as { data?: Laporan }).data || (res as Laporan);
        const fileLaporan = payload.fileLaporan || (unwrapped as Laporan)?.fileLaporan;
        const normalized = normalizeLaporan({ ...unwrapped, ...payload, fileLaporan });
        await putDatabaseItem(normalized);
        return normalized;
      },
      async () => {
        const items = await readDatabaseItems();
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
        const body = buildLaporanApiBody(payload, id);
        const res = await apiClient.put<Laporan | { data?: Laporan }>(`/api/v1/laporan-perjalanan/${id}`, body);
        const unwrapped = (res as { data?: Laporan }).data || (res as Laporan);
        const fileLaporan = payload.fileLaporan || (unwrapped as Laporan)?.fileLaporan;
        const normalized = normalizeLaporan({ ...unwrapped, ...payload, fileLaporan, id });
        await putDatabaseItem(normalized);
        return normalized;
      },
      async () => {
        const items = await readDatabaseItems();
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
        await apiClient.delete(`/api/v1/laporan-perjalanan/${id}`);
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
        const res = await apiClient.put<Laporan | { data?: Laporan }>(`/api/v1/laporan-perjalanan/${id}`, {
          status,
          catatanVerifikasi: catatan,
          catatan_verifikasi: catatan,
        });
        const unwrapped = (res as { data?: Laporan }).data || (res as Laporan);
        const normalized = normalizeLaporan({
          ...unwrapped,
          id,
          status,
          catatanVerifikasi: catatan,
        });
        await putDatabaseItem(normalized);
        return normalized;
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
  apiBulkCreate: async (data: Partial<Laporan>[]): Promise<Laporan[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<Laporan[] | { data?: Laporan[] }>("/api/v1/laporan-perjalanan", data);
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map(normalizeLaporan);
      },
      async () => {
        const normalized = data.map((d) => normalizeLaporan(d as Laporan));
        await writeDatabaseItems(normalized);
        return normalized;
      }
    );
  },
  exportRecords: getItems,
  replaceAll,
};

