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

export const sptService = {
  getAll: (): Spt[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, "[]");
      return [];
    }
    const storedItems = JSON.parse(stored) as Array<
      Spt & { notaDinasId?: string }
    >;
    const notas = notaDinasService.getAll();
    const synchronized = storedItems.map((item) => {
      if (item.notaDinasId) return normalizeSeparatedSptPersonil(item as Spt);
      const nota = notas.find((candidate) => {
        const ids = new Set(candidate.lampiran.map((row) => row.pegawaiId));
        return (item.personil || []).every((person) => ids.has(person.pegawaiId));
      });
      if (!nota?.id) return item as Spt;
      return normalizeSeparatedSptPersonil({
        ...item,
        notaDinasId: nota.id,
      } as Spt);
    });
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

  // REST API Integration (/api/spt)
  apiGetAll: async (params?: { limit?: number; offset?: number }): Promise<Spt[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Spt[] | { data?: Spt[]; items?: Spt[] }>("/api/spt", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return list.map(normalizeSeparatedSptPersonil);
      },
      () => sptService.getAll()
    );
  },

  apiGetById: async (id: string): Promise<Spt | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Spt | null>(`/api/spt/${id}`);
        return res ? normalizeSeparatedSptPersonil(res) : null;
      },
      () => sptService.getAll().find((s) => s.id === id) || null
    );
  },

  apiCreate: async (data: Partial<Spt>): Promise<Spt> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<Spt>("/api/spt", data);
        return normalizeSeparatedSptPersonil(res);
      },
      async () => {
        const items = sptService.getAll();
        const newItem = normalizeSeparatedSptPersonil({ ...data, id: data.id || `st-${Date.now()}` } as Spt);
        sptService.saveAll([...items, newItem]);
        return newItem;
      }
    );
  },

  apiUpdate: async (id: string, data: Partial<Spt>): Promise<Spt> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.patch<Spt>(`/api/spt/${id}`, data);
        return normalizeSeparatedSptPersonil(res);
      },
      async () => {
        const items = sptService.getAll();
        const updated = items.map((item) => (item.id === id ? normalizeSeparatedSptPersonil({ ...item, ...data } as Spt) : item));
        sptService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      }
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/spt/${id}`);
        return true;
      },
      async () => {
        const items = sptService.getAll();
        sptService.saveAll(items.filter((item) => item.id !== id));
        return true;
      }
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
  ) =>
    penomoranService.releaseNumber("SPT", number, note),
};

