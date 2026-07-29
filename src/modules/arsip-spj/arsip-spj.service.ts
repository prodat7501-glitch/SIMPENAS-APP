import {
  arsipSpjSchema,
  MAX_ARSIP_SPJ_SIZE_MB,
  type ArsipSpj,
  type ArsipSpjRecord,
} from "./arsip-spj.schema";
import type { UploadArsipSpjInput } from "./arsip-spj.types";

const DATABASE_NAME = "simpenas-arsip-spj";
const DATABASE_VERSION = 1;
const STORE_NAME = "arsip";

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Penyimpanan arsip tidak tersedia pada browser ini."));
      return;
    }

    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "notaDinasId" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Gagal membuka penyimpanan arsip."));
  });

const runRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Operasi arsip SPJ gagal."));
  });

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `arsip-spj-${Date.now()}`;

const validatePdf = (file: File) => {
  const isPdf =
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("Dokumen arsip wajib berupa file PDF.");
  if (file.size <= 0) throw new Error("File PDF yang dipilih kosong.");
  if (file.size > MAX_ARSIP_SPJ_SIZE_MB * 1024 * 1024) {
    throw new Error(`Ukuran PDF maksimal ${MAX_ARSIP_SPJ_SIZE_MB} MB.`);
  }
};

const toMetadata = (record: ArsipSpjRecord): ArsipSpj =>
  arsipSpjSchema.parse({
    id: record.id,
    notaDinasId: record.notaDinasId,
    namaFile: record.namaFile,
    ukuranFile: record.ukuranFile,
    tipeFile: "application/pdf",
    diunggahPada: record.diunggahPada,
    diunggahOleh: record.diunggahOleh,
  });

export const arsipSpjService = {
  list: async (): Promise<ArsipSpj[]> => {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const records = await runRequest(
        transaction.objectStore(STORE_NAME).getAll() as IDBRequest<
          ArsipSpjRecord[]
        >,
      );
      return records
        .map(toMetadata)
        .sort((a, b) => b.diunggahPada.localeCompare(a.diunggahPada));
    } finally {
      database.close();
    }
  },

  upload: async ({
    notaDinasId,
    file,
    diunggahOleh,
  }: UploadArsipSpjInput): Promise<ArsipSpj> => {
    validatePdf(file);
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const existing = (await runRequest(store.get(notaDinasId))) as
        ArsipSpjRecord | undefined;
      const record: ArsipSpjRecord = {
        id: existing?.id ?? createId(),
        notaDinasId,
        namaFile: file.name,
        ukuranFile: file.size,
        tipeFile: "application/pdf",
        diunggahPada: new Date().toISOString(),
        diunggahOleh,
        file,
      };
      await runRequest(store.put(record));
      return toMetadata(record);
    } finally {
      database.close();
    }
  },

  getFile: async (notaDinasId: string): Promise<ArsipSpjRecord> => {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const record = (await runRequest(
        transaction.objectStore(STORE_NAME).get(notaDinasId),
      )) as ArsipSpjRecord | undefined;
      if (!record?.file) throw new Error("File arsip SPJ tidak ditemukan.");
      return record;
    } finally {
      database.close();
    }
  },

  exportRecords: async (): Promise<ArsipSpjRecord[]> => {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(STORE_NAME, "readonly");
      return await runRequest(
        transaction.objectStore(STORE_NAME).getAll() as IDBRequest<
          ArsipSpjRecord[]
        >,
      );
    } finally {
      database.close();
    }
  },

  replaceAll: async (records: ArsipSpjRecord[]): Promise<void> => {
    const validatedRecords = records.map((record) => {
      const metadata = arsipSpjSchema.parse(record);
      if (!(record.file instanceof Blob) || record.file.size <= 0) {
        throw new Error(`File arsip ${record.namaFile} tidak valid.`);
      }
      if (record.file.size > MAX_ARSIP_SPJ_SIZE_MB * 1024 * 1024) {
        throw new Error(
          `Ukuran arsip ${record.namaFile} melebihi ${MAX_ARSIP_SPJ_SIZE_MB} MB.`,
        );
      }
      return { ...metadata, file: record.file } satisfies ArsipSpjRecord;
    });

    const database = await openDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(
            transaction.error ?? new Error("Gagal mengganti arsip SPJ."),
          );
        transaction.onabort = () =>
          reject(
            transaction.error ?? new Error("Penggantian arsip SPJ dibatalkan."),
          );
        store.clear();
        validatedRecords.forEach((record) => store.put(record));
      });
    } finally {
      database.close();
    }
  },
};
