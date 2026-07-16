import type { Laporan } from "./laporan.schema";
import type { LaporanPayload, LaporanStatus } from "./laporan.types";

const STORAGE_KEY = "simpenas_laporan_perjalanan";

const getItems = (): Laporan[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as Laporan[]) : [];
};

const saveItems = (items: Laporan[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

const normalizeLaporan = (item: Partial<Laporan>): Laporan => ({
  id: item.id,
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

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `laporan-${Date.now()}`;

export const laporanService = {
  list: async () => {
    const normalized = getItems().map(normalizeLaporan);
    saveItems(normalized);
    return normalized;
  },
  create: async (payload: LaporanPayload) => {
    const items = getItems().map(normalizeLaporan);
    if (items.some((item) => item.sptId === payload.sptId)) {
      throw new Error("Laporan untuk Nomor SPT ini sudah dibuat.");
    }
    const item: Laporan = normalizeLaporan({ ...payload, id: createId() });
    saveItems([...items, item]);
    return item;
  },
  update: async (id: string, payload: LaporanPayload) => {
    const items = getItems().map(normalizeLaporan);
    if (!items.some((item) => item.id === id))
      throw new Error("Laporan tidak ditemukan.");
    if (items.some((item) => item.id !== id && item.sptId === payload.sptId)) {
      throw new Error("Laporan untuk Nomor SPT ini sudah dibuat.");
    }
    const updated: Laporan = normalizeLaporan({ ...payload, id });
    saveItems(items.map((item) => (item.id === id ? updated : item)));
    return updated;
  },
  remove: async (id: string) =>
    saveItems(getItems().map(normalizeLaporan).filter((item) => item.id !== id)),
  verify: async (
    id: string,
    status: Extract<LaporanStatus, "Perlu Revisi" | "Terverifikasi">,
    catatan: string,
  ) => {
    const items = getItems().map(normalizeLaporan);
    const target = items.find((item) => item.id === id);
    if (!target) throw new Error("Laporan tidak ditemukan.");
    if (status === "Perlu Revisi" && catatan.trim().length < 3)
      throw new Error("Catatan revisi wajib diisi.");
    const updated = { ...target, status, catatanVerifikasi: catatan };
    saveItems(items.map((item) => (item.id === id ? updated : item)));
    return updated;
  },
};
