import { Spt } from "./spt.schema";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import {
  createPenandatanganSnapshot,
  penandatanganService,
} from "@/modules/penandatangan/penandatangan.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import { apiClient, withApiFallback } from "@/services/api";

const STORAGE_KEY = "simpenas_spt";
const RESERVATION_MIGRATION_KEY = "simpenas_spt_reservation_reconciled_v2";

const findUnpersistedNumberReservation = (items: Spt[]) => {
  const storedNumbers = new Set(
    items.map((item) => item.nomor.trim()).filter(Boolean),
  );
  return penomoranService
    .history()
    .find(
      (entry) =>
        entry.documentType === "SPT" &&
        entry.status === "Terpakai" &&
        !storedNumbers.has(entry.number),
    );
};

const getHighestStoredSequence = (items: Spt[]) =>
  items.reduce((highest, item) => {
    const match = item.nomor.trim().match(/^(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

const normalizeText = (value: string) => value.toLowerCase();
const isKomisionerPegawai = (pegawaiId: string) => {
  const pegawai = pegawaiService.getAll().find((item) => item.id === pegawaiId);
  return (
    pegawai?.kategoriPegawai === "Ketua KPU" ||
    pegawai?.kategoriPegawai === "Anggota KPU"
  );
};
const getSignerText = (penandatanganId: string) => {
  const signer = penandatanganService
    .getAll()
    .find((item) => item.id === penandatanganId);
  return signer
    ? normalizeText(`${signer.jabatanPenandatangan} ${signer.peran}`)
    : "";
};
const normalizeSeparatedSptPersonil = (item: Spt): Spt => {
  const signerText = getSignerText(item.penandatanganId);
  const isKetuaKpuSpt = signerText.includes("ketua kpu");
  const filteredPersonil = (item.personil || []).filter((person) =>
    isKetuaKpuSpt
      ? isKomisionerPegawai(person.pegawaiId)
      : !isKomisionerPegawai(person.pegawaiId),
  );
  const signer = penandatanganService
    .getAll()
    .find((candidate) => candidate.id === item.penandatanganId);
  const normalized = {
    ...item,
    createdByPegawaiId:
      item.createdByPegawaiId ?? item.personil?.[0]?.pegawaiId ?? "",
    catatanRevisi: item.catatanRevisi ?? "",
    penandatanganSnapshot:
      item.penandatanganSnapshot?.penandatanganId === item.penandatanganId
        ? item.penandatanganSnapshot
        : signer
          ? createPenandatanganSnapshot(signer, "SPT", item.tanggalMulai, true)
          : null,
  };

  return filteredPersonil.length > 0
    ? { ...normalized, personil: filteredPersonil }
    : normalized;
};

const defaultSpts: Spt[] = [
  {
    id: "st1",
    createdByPegawaiId: "pg1",
    catatanRevisi: "",
    notaDinasId: "nd1",
    nomor: "001/ST.KPU-Kab.Gorontalo/VII/2026",
    tanggalMulai: "2026-07-12",
    tanggalSelesai: "2026-07-14",
    penandatanganId: "pe1",
    penandatanganSnapshot: null,
    status: "Selesai",
    menimbang: [
      {
        text: "Bahwa untuk tertib administrasi dan kelancaran pelaksanaan Rapat Koordinasi Evaluasi Pemilu, dipandang perlu menugaskan personil yang berkompeten.",
      },
    ],
    dasar: [
      { text: "Undang-Undang Nomor 7 Tahun 2017 tentang Pemilihan Umum." },
      {
        text: "Peraturan Komisi Pemilihan Umum Nomor 8 Tahun 2019 tentang Tata Kerja Komisi Pemilihan Umum.",
      },
      {
        text: "DIPA Komisi Pemilihan Umum Kabupaten Gorontalo Tahun Anggaran 2026.",
      },
    ],
    untuk: [
      {
        text: "Melaksanakan perjalanan dinas dalam rangka mengikuti Rapat Koordinasi Evaluasi Pemilu Serentak di KPU Provinsi Gorontalo pada tanggal 12 s.d 14 Juli 2026.",
      },
    ],
    personil: [{ pegawaiId: "pg1" }],
  },
];

const withoutSignerSnapshot = (item: Spt) => {
  const rest = { ...item };
  delete rest.penandatanganSnapshot;
  return rest;
};

export const isUnmodifiedSptDemoSeed = (item: Spt) =>
  defaultSpts.some(
    (seed) =>
      JSON.stringify(withoutSignerSnapshot(item)) ===
      JSON.stringify(withoutSignerSnapshot(seed)),
  );

interface RawSptApi {
  id?: string;
  nomor?: string;
  notaDinasId?: string;
  nota_dinas_id?: string;
  tanggalMulai?: string;
  tanggal_mulai?: string;
  tanggalSelesai?: string;
  tanggal_selesai?: string;
  penandatanganId?: string;
  penandatangan_id?: string;
  penandatanganSnapshot?: unknown;
  penandatangan_snapshot?: unknown;
  status?: Spt["status"];
  catatanRevisi?: string | null;
  catatan_revisi?: string | null;
  createdByPegawaiId?: string;
  created_by_pegawai_id?: string;
  menimbang?: { text: string }[];
  dasar?: { text: string }[];
  untuk?: { text: string }[];
  personil?: { pegawaiId: string }[];
}

interface RawSptPersonilApi {
  id?: string;
  sptId?: string;
  spt_id?: string;
  pegawaiId?: string;
  pegawai_id?: string;
}

const normalizeSptFromApi = (
  raw: RawSptApi,
  personilList: RawSptPersonilApi[] = [],
): Spt => {
  const sptId = raw.id;
  const matchingPersonil = personilList
    .filter((p) => (p.sptId ?? p.spt_id) === sptId)
    .map((p) => ({
      pegawaiId: p.pegawaiId ?? p.pegawai_id ?? "",
    }));

  const rawPersonil =
    Array.isArray(raw.personil) && raw.personil.length > 0
      ? raw.personil
      : matchingPersonil;

  const item: Spt = {
    id: raw.id || "",
    nomor: raw.nomor ?? "",
    notaDinasId: raw.notaDinasId ?? raw.nota_dinas_id ?? "",
    tanggalMulai: raw.tanggalMulai ?? raw.tanggal_mulai ?? "",
    tanggalSelesai: raw.tanggalSelesai ?? raw.tanggal_selesai ?? "",
    penandatanganId: raw.penandatanganId ?? raw.penandatangan_id ?? "",
    penandatanganSnapshot: (raw.penandatanganSnapshot ??
      raw.penandatangan_snapshot ??
      null) as Spt["penandatanganSnapshot"],
    status: (raw.status as Spt["status"]) ?? "Draft",
    catatanRevisi: raw.catatanRevisi ?? raw.catatan_revisi ?? "",
    createdByPegawaiId:
      raw.createdByPegawaiId ?? raw.created_by_pegawai_id ?? "",
    menimbang: Array.isArray(raw.menimbang) ? raw.menimbang : [],
    dasar: Array.isArray(raw.dasar) ? raw.dasar : [],
    untuk: Array.isArray(raw.untuk) ? raw.untuk : [],
    personil: Array.isArray(rawPersonil) ? rawPersonil : [],
  };

  return normalizeSeparatedSptPersonil(item);
};

const ensureAllNotaDinasCovered = (
  items: Array<Spt & { notaDinasId?: string }>,
): Spt[] => {
  const notas = notaDinasService.getAll();
  return items.map((item) => {
    if (item.notaDinasId) return normalizeSeparatedSptPersonil(item as Spt);
    const nota = notas.find((candidate) => {
      const ids = new Set(
        (candidate.lampiran || []).map((row) => row.pegawaiId),
      );
      return (item.personil || []).every((person) => ids.has(person.pegawaiId));
    });
    if (!nota?.id) return normalizeSeparatedSptPersonil(item as Spt);
    return normalizeSeparatedSptPersonil({
      ...item,
      notaDinasId: nota.id,
    } as Spt);
  });
};

export const sptService = {
  getAll: (): Spt[] => {
    if (typeof window === "undefined") return defaultSpts;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSpts));
      return defaultSpts;
    }
    const parsed = JSON.parse(stored);
    const synchronized = ensureAllNotaDinasCovered(parsed);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(synchronized));
    return synchronized;
  },
  saveAll: (data: Spt[]) => {
    const normalized = data.map(normalizeSeparatedSptPersonil);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  },

  // REST API Integration (/api/v1/spt)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Spt[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 500, ...params };
        const [res, personilRes] = await Promise.all([
          apiClient.get<Spt[] | { data?: Spt[]; items?: Spt[] }>(
            "/api/v1/spt",
            queryParams,
          ),
          apiClient
            .get<
              | RawSptPersonilApi[]
              | { data?: RawSptPersonilApi[]; items?: RawSptPersonilApi[] }
            >("/api/v1/spt-personil", { limit: 500 })
            .catch(() => []),
        ]);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const personilList = Array.isArray(personilRes)
          ? personilRes
          : (
              personilRes as {
                data?: RawSptPersonilApi[];
                items?: RawSptPersonilApi[];
              }
            ).data ||
            (
              personilRes as {
                data?: RawSptPersonilApi[];
                items?: RawSptPersonilApi[];
              }
            ).items ||
            [];
        return list.map((item) =>
          normalizeSptFromApi(item as RawSptApi, personilList),
        );
      },
      () => sptService.getAll(),
    );
  },

  apiGetById: async (id: string): Promise<Spt | null> => {
    return withApiFallback(
      async () => {
        const [res, personilRes] = await Promise.all([
          apiClient.get<Spt | { data?: Spt }>(`/api/v1/spt/${id}`),
          apiClient
            .get<
              | RawSptPersonilApi[]
              | { data?: RawSptPersonilApi[]; items?: RawSptPersonilApi[] }
            >("/api/v1/spt-personil", { limit: 500 })
            .catch(() => []),
        ]);
        const unwrapped = (res as { data?: Spt }).data || (res as Spt);
        const personilList = Array.isArray(personilRes)
          ? personilRes
          : (
              personilRes as {
                data?: RawSptPersonilApi[];
                items?: RawSptPersonilApi[];
              }
            ).data ||
            (
              personilRes as {
                data?: RawSptPersonilApi[];
                items?: RawSptPersonilApi[];
              }
            ).items ||
            [];
        return unwrapped
          ? normalizeSptFromApi(unwrapped as RawSptApi, personilList)
          : null;
      },
      () => sptService.getAll().find((s) => s.id === id) || null,
    );
  },

  apiCreate: async (data: Partial<Spt>): Promise<Spt> => {
    return withApiFallback(
      async () => {
        const payload = {
          id: data.id || `st-${Date.now()}`,
          nomor: data.nomor,
          nota_dinas_id: data.notaDinasId,
          tanggal_mulai: data.tanggalMulai,
          tanggal_selesai: data.tanggalSelesai,
          penandatangan_id: data.penandatanganId,
          penandatangan_snapshot: data.penandatanganSnapshot,
          status: data.status,
          catatan_revisi: data.catatanRevisi,
          created_by_pegawai_id: data.createdByPegawaiId,
          menimbang: data.menimbang,
          dasar: data.dasar,
          untuk: data.untuk,
          ...data,
        };
        const res = await apiClient.post<Spt | { data?: Spt }>(
          "/api/v1/spt",
          payload,
        );
        const unwrapped = (res as { data?: Spt }).data || (res as Spt);

        if (Array.isArray(data.personil) && data.personil.length > 0) {
          for (const p of data.personil) {
            try {
              await apiClient.post("/api/v1/spt-personil", {
                id: `sptp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                spt_id: unwrapped.id,
                pegawai_id: p.pegawaiId,
              });
            } catch {
              // ignore
            }
          }
        }

        return normalizeSptFromApi(
          { ...(unwrapped as RawSptApi), personil: data.personil },
          [],
        );
      },
      async () => {
        const items = sptService.getAll();
        const newItem = normalizeSeparatedSptPersonil({
          ...data,
          id: data.id || `st-${Date.now()}`,
        } as Spt);
        sptService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },

  apiUpdate: async (id: string, data: Partial<Spt>): Promise<Spt> => {
    return withApiFallback(
      async () => {
        const payload = {
          nomor: data.nomor,
          nota_dinas_id: data.notaDinasId,
          tanggal_mulai: data.tanggalMulai,
          tanggal_selesai: data.tanggalSelesai,
          penandatangan_id: data.penandatanganId,
          penandatangan_snapshot: data.penandatanganSnapshot,
          status: data.status,
          catatan_revisi: data.catatanRevisi,
          created_by_pegawai_id: data.createdByPegawaiId,
          menimbang: data.menimbang,
          dasar: data.dasar,
          untuk: data.untuk,
          ...data,
        };
        const res = await apiClient.put<Spt | { data?: Spt }>(
          `/api/v1/spt/${id}`,
          payload,
        );
        const unwrapped = (res as { data?: Spt }).data || (res as Spt);
        return normalizeSptFromApi(
          { ...(unwrapped as RawSptApi), personil: data.personil },
          [],
        );
      },
      async () => {
        const items = sptService.getAll();
        const updated = items.map((item) =>
          item.id === id
            ? normalizeSeparatedSptPersonil({ ...item, ...data } as Spt)
            : item,
        );
        sptService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/spt/${id}`);
        return true;
      },
      async () => {
        const items = sptService.getAll();
        sptService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },

  apiBulkCreate: async (data: Partial<Spt>[]): Promise<Spt[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<Spt[] | { data?: Spt[] }>(
          "/api/v1/spt",
          data,
        );
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map(normalizeSeparatedSptPersonil);
      },
      async () => {
        const items = sptService.getAll();
        const normalized = data.map((d) =>
          normalizeSeparatedSptPersonil(d as Spt),
        );
        sptService.saveAll([...items, ...normalized]);
        return normalized;
      },
    );
  },

  generateNomor: (dateStr: string): string => {
    const items = sptService.getAll();
    const storedNumbers = items.map((item) => item.nomor);
    const needsLegacyReservationRepair =
      typeof window !== "undefined" &&
      localStorage.getItem(RESERVATION_MIGRATION_KEY) !== "complete";
    if (items.length === 0 || needsLegacyReservationRepair) {
      penomoranService.reconcileUsedNumbers(
        "SPT",
        storedNumbers,
        "Riwayat Terpakai dibatalkan karena tidak memiliki SPT sumber.",
      );
      if (needsLegacyReservationRepair) {
        localStorage.setItem(RESERVATION_MIGRATION_KEY, "complete");
      }
    }
    const unpersistedReservation = findUnpersistedNumberReservation(items);
    if (unpersistedReservation) {
      throw new Error(
        `Nomor SPT berikutnya belum dapat diambil. Nomor ${unpersistedReservation.number} masih direservasi pada form yang belum disimpan atau dibatalkan.`,
      );
    }
    return penomoranService.requestNumber(
      "SPT",
      dateStr,
      getHighestStoredSequence(items),
    );
  },
  releaseNomor: (
    number: string,
    note = "Nomor dilepas karena form SPT baru dibatalkan sebelum disimpan.",
  ) => penomoranService.releaseNumber("SPT", number, note),
};
