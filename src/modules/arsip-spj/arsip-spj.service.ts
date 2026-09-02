import {
  arsipSpjSchema,
  MAX_ARSIP_SPJ_SIZE_MB,
  type ArsipSpj,
  type ArsipSpjRecord,
} from "./arsip-spj.schema";
import type { UploadArsipSpjInput } from "./arsip-spj.types";
import { apiClient, withApiFallback } from "@/services/api";

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

const localList = async (): Promise<ArsipSpj[]> => {
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
};

export const arsipSpjService = {
  list: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<ArsipSpj[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<ArsipSpj[] | { data?: ArsipSpj[]; items?: ArsipSpj[] }>("/api/v1/arsip-spj", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return list.map((item: unknown) => arsipSpjSchema.parse(item));
      },
      () => localList()
    );
  },

  apiGetById: async (id: string): Promise<ArsipSpj | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<ArsipSpj | { data?: ArsipSpj }>(`/api/v1/arsip-spj/${id}`);
        const unwrapped = (res as { data?: ArsipSpj }).data || (res as ArsipSpj);
        return unwrapped ? arsipSpjSchema.parse(unwrapped) : null;
      },
      async () => {
        const list = await localList();
        return list.find((item) => item.id === id || item.notaDinasId === id) || null;
      }
    );
  },

  upload: async ({
    notaDinasId,
    file,
    diunggahOleh,
  }: UploadArsipSpjInput): Promise<ArsipSpj> => {
    validatePdf(file);
    return withApiFallback(
      async () => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("nota_dinas_id", notaDinasId);
        formData.append("diunggah_oleh", diunggahOleh);
        const res = await apiClient.post<unknown>("/api/v1/arsip-spj", formData, { skipTransform: true });
        return arsipSpjSchema.parse(res);
      },
      async () => {
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
      }
    );
  },

  delete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/arsip-spj/${id}`);
        return true;
      },
      async () => true
    );
  },

  apiBulkCreate: async (data: Partial<ArsipSpj>[]): Promise<ArsipSpj[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<ArsipSpj[] | { data?: ArsipSpj[] }>("/api/v1/arsip-spj", data);
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map((item) => arsipSpjSchema.parse(item));
      },
      async () => data.map((item) => arsipSpjSchema.parse(item))
    );
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

