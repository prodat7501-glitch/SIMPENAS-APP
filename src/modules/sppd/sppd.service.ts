import type { Sppd } from "./sppd.schema";
import type { SppdMutationPayload, SppdNomorRequest } from "./sppd.types";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

const STORAGE_KEY = "simpenas_sppd";

type Page2Signer = Sppd["tandaTanganHalaman2"][number];

const defaultSppds: Sppd[] = [
  {
    id: "sppd-1",
    nomor: "001/SPPD.KPU-Kab.Gorontalo/VII/2026",
    sptId: "st1",
    personil: [{ pegawaiId: "pg1" }],
    maksud:
      "Mengikuti Rapat Koordinasi Evaluasi Pemilu Serentak di KPU Provinsi Gorontalo.",
    transportasi: "Mobil",
    tempatBerangkat: "Limboto",
    tempatTujuan: "Gorontalo",
    tanggalBerangkat: "2026-07-12",
    tanggalKembali: "2026-07-14",
    lamaPerjalanan: 3,
    instansi: "Komisi Pemilihan Umum Kabupaten Gorontalo",
    dipaId: "dp1",
    penandatanganId: "pe1",
    jumlahKolomHalaman2: 6,
    tandaTanganHalaman2: [],
    status: "Disetujui",
  },
];

const normalizePage2Signer = (item?: Partial<Page2Signer>): Page2Signer => ({
  tibaDi: item?.tibaDi ?? "",
  tanggalTiba: item?.tanggalTiba ?? "",
  berangkatDari: item?.berangkatDari ?? "",
  ke: item?.ke ?? "",
  tanggalBerangkat: item?.tanggalBerangkat ?? "",
  jabatan: item?.jabatan ?? "",
  nama: item?.nama ?? "",
  nip: item?.nip ?? "",
});

const normalizeSinglePersonilSppd = (item: Sppd): Sppd => ({
  ...item,
  personil: item.personil.slice(0, 1),
  jumlahKolomHalaman2: item.jumlahKolomHalaman2 ?? 6,
  tandaTanganHalaman2: (item.tandaTanganHalaman2 ?? []).map(
    normalizePage2Signer,
  ),
});

const getSharedSppdFields = (item: SppdMutationPayload) => ({
  nomor: item.nomor,
  maksud: item.maksud,
  transportasi: item.transportasi,
  tempatBerangkat: item.tempatBerangkat,
  tempatTujuan: item.tempatTujuan,
  tanggalBerangkat: item.tanggalBerangkat,
  tanggalKembali: item.tanggalKembali,
  lamaPerjalanan: item.lamaPerjalanan,
  instansi: item.instansi,
  dipaId: item.dipaId,
  penandatanganId: item.penandatanganId,
  jumlahKolomHalaman2: item.jumlahKolomHalaman2 ?? 6,
  tandaTanganHalaman2: (item.tandaTanganHalaman2 ?? []).map(
    normalizePage2Signer,
  ),
});

const getStoredItems = (): Sppd[] => {
  if (typeof window === "undefined") return defaultSppds;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSppds));
    return defaultSppds;
  }

  const normalized = (JSON.parse(stored) as Sppd[]).map(
    normalizeSinglePersonilSppd,
  );
  saveStoredItems(normalized);
  return normalized;
};

const saveStoredItems = (items: Sppd[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `sppd-${Date.now()}`;
};

export const sppdService = {
  getAllSync: (): Sppd[] => {
    return getStoredItems();
  },

  saveAll: (data: Sppd[]) => {
    saveStoredItems(data.map(normalizeSinglePersonilSppd));
  },

  list: async (): Promise<Sppd[]> => {
    return getStoredItems();
  },

  create: async (payload: SppdMutationPayload): Promise<Sppd> => {
    const items = getStoredItems();
    const newItem: Sppd = normalizeSinglePersonilSppd({
      ...payload,
      id: createId(),
    });
    const sharedFields = getSharedSppdFields(payload);
    const synchronizedItems = items.map((item) =>
      item.sptId === payload.sptId ? { ...item, ...sharedFields } : item,
    );
    const updated = [...synchronizedItems, newItem];
    saveStoredItems(updated);
    return newItem;
  },

  update: async (id: string, payload: SppdMutationPayload): Promise<Sppd> => {
    const items = getStoredItems();
    const existing = items.find((item) => item.id === id);

    if (!existing) {
      throw new Error("Data SPPD tidak ditemukan.");
    }

    const updatedItem: Sppd = normalizeSinglePersonilSppd({ ...payload, id });
    const sharedFields = getSharedSppdFields(payload);
    const updated = items.map((item) => {
      if (item.id === id) return updatedItem;
      if (item.sptId === payload.sptId) return { ...item, ...sharedFields };
      return item;
    });
    saveStoredItems(updated);
    return updatedItem;
  },

  remove: async (id: string): Promise<void> => {
    const items = getStoredItems();
    const target = items.find((item) => item.id === id);
    if (
      target &&
      ["Draft", "Nomor Diambil"].includes(target.status) &&
      target.nomor
    ) {
      penomoranService.releaseNumber(
        "SPPD",
        target.nomor,
        "SPPD dihapus sebelum selesai.",
      );
    }
    saveStoredItems(items.filter((item) => item.id !== id));
  },

  requestNomor: async ({
    tanggalBerangkat,
  }: SppdNomorRequest): Promise<string> => {
    const items = getStoredItems();
    return penomoranService.requestNumber("SPPD", tanggalBerangkat, items.length);
  },
};
