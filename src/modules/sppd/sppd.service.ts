import type { Sppd } from "./sppd.schema";
import type { SppdMutationPayload } from "./sppd.types";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import {
  createPenandatanganSnapshot,
  penandatanganService,
} from "@/modules/penandatangan/penandatangan.service";
import { sptService } from "@/modules/spt/spt.service";
import { apiClient, withApiFallback } from "@/services/api";

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
    penandatanganSnapshot: null,
    jumlahKolomHalaman2: 6,
    tandaTanganHalaman2: [],
    status: "Selesai",
  },
];

const withoutSignerSnapshot = (item: Sppd) => {
  const rest = { ...item };
  delete rest.penandatanganSnapshot;
  return rest;
};

export const isUnmodifiedSppdDemoSeed = (item: Sppd) =>
  defaultSppds.some(
    (seed) =>
      JSON.stringify(withoutSignerSnapshot(item)) ===
      JSON.stringify(withoutSignerSnapshot(seed)),
  );

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

const normalizeStoredStatus = (status: unknown): Sppd["status"] => {
  if (status === "Diarsipkan") return "Diarsipkan";
  if (status === "Selesai" || status === "Disetujui") return "Selesai";
  return "Diproses";
};

interface RawSppdApi {
  id?: string;
  nomor?: string;
  sptId?: string;
  spt_id?: string;
  pegawaiId?: string;
  pegawai_id?: string;
  pengelolaPegawaiId?: string;
  pengelola_pegawai_id?: string;
  pengelolaNama?: string;
  pengelola_nama?: string;
  personil?: { pegawaiId: string }[];
  maksud?: string;
  transportasi?: string;
  tempatBerangkat?: string;
  tempat_berangkat?: string;
  tempatTujuan?: string;
  tempat_tujuan?: string;
  tanggalBerangkat?: string;
  tanggal_berangkat?: string;
  tanggalKembali?: string;
  tanggal_kembali?: string;
  lamaPerjalanan?: number;
  lama_perjalanan?: number;
  instansi?: string;
  dipaId?: string;
  dipa_id?: string;
  penandatanganId?: string;
  penandatangan_id?: string;
  penandatanganSnapshot?: unknown;
  penandatangan_snapshot?: unknown;
  jumlahKolomHalaman2?: number;
  jumlah_kolom_halaman2?: number;
  tandaTanganHalaman2?: unknown;
  tanda_tangan_halaman2?: unknown;
  status?: Sppd["status"];
}

const normalizeSinglePersonilSppd = (raw: RawSppdApi): Sppd => {
  const penandatanganId = raw.penandatanganId ?? raw.penandatangan_id ?? "";
  const signer = penandatanganService
    .getAll()
    .find((candidate) => candidate.id === penandatanganId);

  let personil: Sppd["personil"] = [];
  if (Array.isArray(raw.personil) && raw.personil.length > 0) {
    personil = raw.personil.slice(0, 1);
  } else if (raw.pegawaiId || raw.pegawai_id) {
    personil = [{ pegawaiId: raw.pegawaiId || raw.pegawai_id || "" }];
  }

  const rawTtd = raw.tandaTanganHalaman2 ?? raw.tanda_tangan_halaman2;
  const tandaTanganHalaman2 = Array.isArray(rawTtd)
    ? rawTtd.map((item) => normalizePage2Signer(item as Partial<Page2Signer>))
    : [];

  const tanggalBerangkat = raw.tanggalBerangkat ?? raw.tanggal_berangkat ?? "";
  const snapshot = raw.penandatanganSnapshot ?? raw.penandatangan_snapshot;

  return {
    id: raw.id || "",
    nomor: raw.nomor ?? "",
    sptId: raw.sptId ?? raw.spt_id ?? "",
    pengelolaPegawaiId: raw.pengelolaPegawaiId ?? raw.pengelola_pegawai_id,
    pengelolaNama: raw.pengelolaNama ?? raw.pengelola_nama,
    personil,
    maksud: raw.maksud ?? "",
    transportasi: raw.transportasi ?? "",
    tempatBerangkat: raw.tempatBerangkat ?? raw.tempat_berangkat ?? "",
    tempatTujuan: raw.tempatTujuan ?? raw.tempat_tujuan ?? "",
    tanggalBerangkat,
    tanggalKembali: raw.tanggalKembali ?? raw.tanggal_kembali ?? "",
    lamaPerjalanan: Number(raw.lamaPerjalanan ?? raw.lama_perjalanan ?? 1),
    instansi: raw.instansi ?? "Komisi Pemilihan Umum Kabupaten Gorontalo",
    dipaId: raw.dipaId ?? raw.dipa_id ?? "",
    penandatanganId,
    jumlahKolomHalaman2: Number(
      raw.jumlahKolomHalaman2 ?? raw.jumlah_kolom_halaman2 ?? 6,
    ),
    tandaTanganHalaman2,
    status: normalizeStoredStatus(raw.status),
    penandatanganSnapshot:
      (snapshot as Sppd["penandatanganSnapshot"])?.penandatanganId ===
      penandatanganId
        ? (snapshot as Sppd["penandatanganSnapshot"])
        : signer
          ? createPenandatanganSnapshot(signer, "SPPD", tanggalBerangkat, true)
          : null,
  };
};

const getSequenceFromNumber = (number: string) => {
  const sequence = Number(number.trim().split("/")[0]);
  return Number.isInteger(sequence) && sequence > 0 ? sequence : 0;
};

const getHighestSequenceForYear = (items: Sppd[], year: number) =>
  items
    .filter((item) => new Date(item.tanggalBerangkat).getFullYear() === year)
    .reduce(
      (highest, item) => Math.max(highest, getSequenceFromNumber(item.nomor)),
      0,
    );

const applySeriesLifecycle = (items: Sppd[]): Sppd[] => {
  const sptById = new Map(
    sptService
      .getAll()
      .filter((item) => Boolean(item.id))
      .map((item) => [item.id!, item]),
  );
  const seriesBySpt = new Map<string, Sppd[]>();

  items.forEach((item) => {
    const series = seriesBySpt.get(item.sptId) ?? [];
    series.push(item);
    seriesBySpt.set(item.sptId, series);
  });

  const statusBySpt = new Map<string, Sppd["status"]>();
  seriesBySpt.forEach((series, sptId) => {
    if (series.some((item) => item.status === "Diarsipkan")) {
      statusBySpt.set(sptId, "Diarsipkan");
      return;
    }

    const spt = sptById.get(sptId);
    if (!spt) {
      statusBySpt.set(
        sptId,
        series.every((item) => item.status === "Selesai")
          ? "Selesai"
          : "Diproses",
      );
      return;
    }

    const requiredPersonilIds = new Set(
      spt.personil.map((item) => item.pegawaiId),
    );
    const issuedPersonilIds = new Set(
      series.map((item) => item.personil[0]?.pegawaiId).filter(Boolean),
    );
    const isComplete =
      requiredPersonilIds.size > 0 &&
      Array.from(requiredPersonilIds).every((pegawaiId) =>
        issuedPersonilIds.has(pegawaiId),
      );

    statusBySpt.set(sptId, isComplete ? "Selesai" : "Diproses");
  });

  return items.map((item) => ({
    ...item,
    status: statusBySpt.get(item.sptId) ?? "Diproses",
  }));
};

const getSharedSppdFields = (item: SppdMutationPayload) => ({
  pengelolaPegawaiId: item.pengelolaPegawaiId,
  pengelolaNama: item.pengelolaNama,
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
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, "[]");
    return [];
  }

  const normalized = applySeriesLifecycle(
    (JSON.parse(stored) as Sppd[]).map(normalizeSinglePersonilSppd),
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
    saveStoredItems(
      applySeriesLifecycle(data.map(normalizeSinglePersonilSppd)),
    );
  },

  list: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Sppd[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 500, ...params };
        const res = await apiClient.get<
          Sppd[] | { data?: Sppd[]; items?: Sppd[] }
        >("/api/v1/sppd", queryParams);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return applySeriesLifecycle(
          list.map((item) => normalizeSinglePersonilSppd(item as RawSppdApi)),
        );
      },
      () => getStoredItems(),
    );
  },

  apiGetById: async (id: string): Promise<Sppd | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Sppd | { data?: Sppd }>(
          `/api/v1/sppd/${id}`,
        );
        const unwrapped = (res as { data?: Sppd }).data || (res as Sppd);
        return unwrapped
          ? normalizeSinglePersonilSppd(unwrapped as RawSppdApi)
          : null;
      },
      () => getStoredItems().find((s) => s.id === id) || null,
    );
  },

  create: async (payload: SppdMutationPayload): Promise<Sppd> => {
    return withApiFallback(
      async () => {
        const body = {
          ...payload,
          spt_id: payload.sptId,
          pegawai_id: payload.personil[0]?.pegawaiId,
          pengelola_pegawai_id: payload.pengelolaPegawaiId,
          pengelola_nama: payload.pengelolaNama,
          tempat_berangkat: payload.tempatBerangkat,
          tempat_tujuan: payload.tempatTujuan,
          tanggal_berangkat: payload.tanggalBerangkat,
          tanggal_kembali: payload.tanggalKembali,
          lama_perjalanan: payload.lamaPerjalanan,
          dipa_id: payload.dipaId,
          penandatangan_id: payload.penandatanganId,
          penandatangan_snapshot: payload.penandatanganSnapshot,
          jumlah_kolom_halaman2: payload.jumlahKolomHalaman2,
          tanda_tangan_halaman2: payload.tandaTanganHalaman2,
        };
        const res = await apiClient.post<Sppd | { data?: Sppd }>(
          "/api/v1/sppd",
          body,
        );
        const unwrapped = (res as { data?: Sppd }).data || (res as Sppd);
        return normalizeSinglePersonilSppd(unwrapped as RawSppdApi);
      },
      async () => {
        const items = getStoredItems();
        const pegawaiId = payload.personil[0]?.pegawaiId;
        if (!pegawaiId) throw new Error("Personil SPPD wajib dipilih.");
        if (
          items.some(
            (item) =>
              item.sptId === payload.sptId &&
              item.personil.some((person) => person.pegawaiId === pegawaiId),
          )
        ) {
          throw new Error(
            "Personil tersebut sudah memiliki SPPD pada SPT ini.",
          );
        }

        const documentDate = new Date(payload.tanggalBerangkat);
        if (Number.isNaN(documentDate.getTime())) {
          throw new Error("Tanggal berangkat SPPD tidak valid.");
        }
        const number = penomoranService.requestNumber(
          "SPPD",
          payload.tanggalBerangkat,
          getHighestSequenceForYear(items, documentDate.getFullYear()),
        );

        try {
          const numberedPayload: SppdMutationPayload = {
            ...payload,
            nomor: number,
          };
          const newItem: Sppd = normalizeSinglePersonilSppd({
            ...numberedPayload,
            id: createId(),
            status: "Diproses",
          });
          const sharedFields = getSharedSppdFields(numberedPayload);
          const synchronizedItems = items.map((item) =>
            item.sptId === numberedPayload.sptId
              ? { ...item, ...sharedFields }
              : item,
          );
          const updated = applySeriesLifecycle([...synchronizedItems, newItem]);
          saveStoredItems(updated);
          return updated.find((item) => item.id === newItem.id) ?? newItem;
        } catch (error) {
          penomoranService.releaseNumber(
            "SPPD",
            number,
            "Nomor dilepas karena penyimpanan SPPD gagal.",
          );
          throw error;
        }
      },
    );
  },

  update: async (id: string, payload: SppdMutationPayload): Promise<Sppd> => {
    return withApiFallback(
      async () => {
        const body = {
          ...payload,
          spt_id: payload.sptId,
          pegawai_id: payload.personil[0]?.pegawaiId,
          pengelola_pegawai_id: payload.pengelolaPegawaiId,
          pengelola_nama: payload.pengelolaNama,
          tempat_berangkat: payload.tempatBerangkat,
          tempat_tujuan: payload.tempatTujuan,
          tanggal_berangkat: payload.tanggalBerangkat,
          tanggal_kembali: payload.tanggalKembali,
          lama_perjalanan: payload.lamaPerjalanan,
          dipa_id: payload.dipaId,
          penandatangan_id: payload.penandatanganId,
          penandatangan_snapshot: payload.penandatanganSnapshot,
          jumlah_kolom_halaman2: payload.jumlahKolomHalaman2,
          tanda_tangan_halaman2: payload.tandaTanganHalaman2,
        };
        const res = await apiClient.put<Sppd | { data?: Sppd }>(
          `/api/v1/sppd/${id}`,
          body,
        );
        const unwrapped = (res as { data?: Sppd }).data || (res as Sppd);
        return normalizeSinglePersonilSppd(unwrapped as RawSppdApi);
      },
      async () => {
        const items = getStoredItems();
        const existing = items.find((item) => item.id === id);

        if (!existing) {
          throw new Error("Data SPPD tidak ditemukan.");
        }

        const updatedItem: Sppd = normalizeSinglePersonilSppd({
          ...payload,
          nomor: existing.nomor,
          id,
          status: existing.status,
        });
        const sharedFields = getSharedSppdFields(payload);
        const updated = items.map((item) => {
          if (item.id === id) return updatedItem;
          if (item.sptId === payload.sptId) return { ...item, ...sharedFields };
          return item;
        });
        const lifecycleItems = applySeriesLifecycle(updated);
        saveStoredItems(lifecycleItems);
        return lifecycleItems.find((item) => item.id === id) ?? updatedItem;
      },
    );
  },

  remove: async (id: string): Promise<void> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/sppd/${id}`);
      },
      async () => {
        const items = getStoredItems();
        const existing = items.find((item) => item.id === id);
        saveStoredItems(
          applySeriesLifecycle(items.filter((item) => item.id !== id)),
        );
        if (existing) {
          penomoranService.releaseNumber(
            "SPPD",
            existing.nomor,
            "Nomor dilepas karena SPPD dihapus oleh Administrator.",
          );
        }
      },
    );
  },

  markArchivedByNotaDinas: (notaDinasId: string): number => {
    const relatedSptIds = new Set(
      sptService
        .getAll()
        .filter((item) => item.notaDinasId === notaDinasId)
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id)),
    );
    if (!relatedSptIds.size) return 0;

    const items = getStoredItems();
    let updatedCount = 0;
    const updated = items.map((item) => {
      if (!relatedSptIds.has(item.sptId)) return item;
      updatedCount += 1;
      return { ...item, status: "Diarsipkan" as const };
    });
    saveStoredItems(updated);
    return updatedCount;
  },

  apiBulkCreate: async (data: Partial<Sppd>[]): Promise<Sppd[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<Sppd[] | { data?: Sppd[] }>(
          "/api/v1/sppd",
          data,
        );
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map(normalizeSinglePersonilSppd);
      },
      async () => {
        const items = getStoredItems();
        const normalized = data.map((d) =>
          normalizeSinglePersonilSppd(d as Sppd),
        );
        saveStoredItems(applySeriesLifecycle([...items, ...normalized]));
        return normalized;
      },
    );
  },
};
