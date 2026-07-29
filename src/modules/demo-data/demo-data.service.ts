import {
  MAX_ARSIP_SPJ_SIZE_MB,
  type ArsipSpjRecord,
} from "@/modules/arsip-spj/arsip-spj.schema";
import { arsipSpjService } from "@/modules/arsip-spj/arsip-spj.service";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import { laporanService } from "@/modules/laporan/laporan.service";
import {
  DEMO_DATA_FORMAT,
  DEMO_DATA_VERSION,
  demoDataPackageSchema,
  type DemoDataPackage,
  type DemoDataSummary,
} from "./demo-data.schema";
import { DEMO_DATA_IMPORTED_KEY } from "./demo-data.constants";

const SIMPENAS_STORAGE_PREFIX = "simpenas";
const AUTH_STORAGE_KEY = "simpenas-auth-storage";
const LEGACY_LAPORAN_STORAGE_KEY = "simpenas_laporan_perjalanan";
const MAX_ARCHIVE_BYTES = MAX_ARSIP_SPJ_SIZE_MB * 1024 * 1024;

const assertBrowserStorage = () => {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    throw new Error("Transfer data demo hanya tersedia di browser.");
  }
};

const isManagedKey = (key: string) =>
  key.startsWith(SIMPENAS_STORAGE_PREFIX) && key !== AUTH_STORAGE_KEY;

const collectManagedStorage = (): Record<string, string> => {
  assertBrowserStorage();
  const result: Record<string, string> = {};
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !isManagedKey(key)) continue;
    const value = localStorage.getItem(key);
    if (value !== null) result[key] = value;
  }
  return result;
};

const replaceManagedStorage = (entries: Record<string, string>) => {
  assertBrowserStorage();
  const currentKeys = Array.from(
    { length: localStorage.length },
    (_, index) => localStorage.key(index),
  ).filter((key): key is string => Boolean(key && isManagedKey(key)));

  currentKeys.forEach((key) => localStorage.removeItem(key));
  Object.entries(entries).forEach(([key, value]) => {
    if (!isManagedKey(key)) {
      throw new Error(`Kunci penyimpanan ${key} tidak diizinkan.`);
    }
    localStorage.setItem(key, value);
  });
};

const blobToBase64 = async (blob: Blob): Promise<string> => {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const chunks: string[] = [];
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    chunks.push(
      String.fromCharCode(...bytes.subarray(offset, offset + chunkSize)),
    );
  }
  return btoa(chunks.join(""));
};

const getDecodedSize = (value: string, fileName: string) => {
  if (value.length % 4 !== 0) {
    throw new Error(`Isi file arsip ${fileName} tidak valid.`);
  }
  const padding = value.endsWith("==") ? 2 : value.endsWith("=") ? 1 : 0;
  const estimatedSize = Math.floor((value.length * 3) / 4) - padding;
  if (estimatedSize <= 0 || estimatedSize > MAX_ARCHIVE_BYTES) {
    throw new Error(
      `Ukuran arsip ${fileName} tidak valid atau melebihi ${MAX_ARSIP_SPJ_SIZE_MB} MB.`,
    );
  }
  return estimatedSize;
};

const base64ToBlob = (value: string, fileName: string): Blob => {
  getDecodedSize(value, fileName);

  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return new Blob([bytes], { type: "application/pdf" });
  } catch {
    throw new Error(`Isi file arsip ${fileName} tidak valid.`);
  }
};

const serializeArchive = async (record: ArsipSpjRecord) => ({
  id: record.id,
  notaDinasId: record.notaDinasId,
  namaFile: record.namaFile,
  ukuranFile: record.ukuranFile,
  tipeFile: "application/pdf" as const,
  diunggahPada: record.diunggahPada,
  diunggahOleh: record.diunggahOleh,
  fileBase64: await blobToBase64(record.file),
});

const deserializeArchives = (data: DemoDataPackage): ArsipSpjRecord[] =>
  data.arsipSpj.map((archive) => {
    const file = base64ToBlob(archive.fileBase64, archive.namaFile);
    if (file.size !== archive.ukuranFile) {
      throw new Error(`Ukuran arsip ${archive.namaFile} tidak konsisten.`);
    }
    return {
      id: archive.id,
      notaDinasId: archive.notaDinasId,
      namaFile: archive.namaFile,
      ukuranFile: archive.ukuranFile,
      tipeFile: "application/pdf",
      diunggahPada: archive.diunggahPada,
      diunggahOleh: archive.diunggahOleh,
      file,
    };
  });

const validateArchiveDescriptors = (data: DemoDataPackage) => {
  data.arsipSpj.forEach((archive) => {
    const decodedSize = getDecodedSize(archive.fileBase64, archive.namaFile);
    if (decodedSize !== archive.ukuranFile) {
      throw new Error(`Ukuran arsip ${archive.namaFile} tidak konsisten.`);
    }
  });
};

const getImportedReports = (data: DemoDataPackage): Laporan[] => {
  if (data.laporan) return data.laporan;

  const legacy = data.localStorage[LEGACY_LAPORAN_STORAGE_KEY];
  if (!legacy) return [];
  try {
    const parsed = JSON.parse(legacy) as unknown;
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as Laporan[];
  } catch {
    throw new Error("Data Laporan pada paket demo lama tidak valid.");
  }
};

const summarize = (data: DemoDataPackage): DemoDataSummary => ({
  exportedAt: data.exportedAt,
  exportedBy: data.exportedBy,
  storageEntries: Object.keys(data.localStorage).length,
  archiveFiles: data.arsipSpj.length,
  archiveBytes: data.arsipSpj.reduce(
    (total, archive) => total + archive.ukuranFile,
    0,
  ),
  reportFiles: data.laporan?.length ?? getImportedReports(data).length,
});

const validatePackageKeys = (data: DemoDataPackage) => {
  Object.keys(data.localStorage).forEach((key) => {
    if (!isManagedKey(key)) {
      throw new Error(
        key === AUTH_STORAGE_KEY
          ? "Paket tidak boleh memuat sesi login aktif."
          : `Paket memuat kunci penyimpanan yang tidak diizinkan: ${key}.`,
      );
    }
  });
};

const clearActiveSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie =
    "simpenas_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
};

const getDownloadFileName = () => {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `simpenas-data-demo-${stamp}.json`;
};

export const demoDataService = {
  createPackage: async (exportedBy: string): Promise<DemoDataPackage> => {
    assertBrowserStorage();
    const archiveRecords = await arsipSpjService.exportRecords();
    const reportRecords = await laporanService.exportRecords();
    const data = {
      format: DEMO_DATA_FORMAT,
      version: DEMO_DATA_VERSION,
      exportedAt: new Date().toISOString(),
      exportedBy,
      localStorage: collectManagedStorage(),
      arsipSpj: await Promise.all(archiveRecords.map(serializeArchive)),
      laporan: reportRecords,
    };
    return demoDataPackageSchema.parse(data);
  },

  downloadPackage: (data: DemoDataPackage) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getDownloadFileName();
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  },

  inspectFile: async (
    file: File,
  ): Promise<{ data: DemoDataPackage; summary: DemoDataSummary }> => {
    if (!file.name.toLowerCase().endsWith(".json")) {
      throw new Error("Paket data demo wajib berupa file JSON.");
    }

    let raw: unknown;
    try {
      raw = JSON.parse(await file.text());
    } catch {
      throw new Error("File JSON tidak dapat dibaca atau rusak.");
    }

    const result = demoDataPackageSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(
        "Format atau versi paket data demo tidak sesuai dengan SIMPENAS ini.",
      );
    }
    validatePackageKeys(result.data);
    validateArchiveDescriptors(result.data);
    return { data: result.data, summary: summarize(result.data) };
  },

  restorePackage: async (data: DemoDataPackage): Promise<DemoDataSummary> => {
    assertBrowserStorage();
    const validatedData = demoDataPackageSchema.parse(data);
    validatePackageKeys(validatedData);
    const importedArchives = deserializeArchives(validatedData);
    const importedReports = getImportedReports(validatedData);
    const previousStorage = collectManagedStorage();
    const previousArchives = await arsipSpjService.exportRecords();
    const previousReports = await laporanService.exportRecords();

    try {
      replaceManagedStorage(validatedData.localStorage);
      await arsipSpjService.replaceAll(importedArchives);
      await laporanService.replaceAll(importedReports);
      localStorage.setItem(DEMO_DATA_IMPORTED_KEY, new Date().toISOString());
      clearActiveSession();
      return summarize(validatedData);
    } catch (error) {
      try {
        replaceManagedStorage(previousStorage);
        await arsipSpjService.replaceAll(previousArchives);
        await laporanService.replaceAll(previousReports);
      } catch {
        throw new Error(
          "Impor gagal dan pemulihan data lama tidak dapat diselesaikan. Jangan tutup browser dan hubungi Administrator.",
        );
      }
      throw error instanceof Error
        ? error
        : new Error("Impor paket data demo gagal.");
    }
  },

  summarize,
};
