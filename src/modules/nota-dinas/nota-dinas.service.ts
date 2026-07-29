import type { LampiranItem, NotaDinas } from "./nota-dinas.schema";
import { calculateLampiranTotal } from "./nota-dinas-calculation";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import type { Spt } from "@/modules/spt/spt.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import {
  createPenandatanganSnapshot,
  penandatanganService,
} from "@/modules/penandatangan/penandatangan.service";

const STORAGE_KEY = "simpenas_nota_dinas";

type LegacyLampiranItem = Omit<
  LampiranItem,
  | "volumeUangHarian"
  | "uangHarianFull"
  | "volumeUangHarianPaketMeeting"
  | "volumeUangHarianFull"
  | "volumeUangTransport"
  | "volumePenginapan"
  | "volumeTiketPesawat"
  | "volumeTransportBandaraAsal"
  | "volumeTransportBandaraTujuan"
> &
  Partial<
    Pick<
      LampiranItem,
      | "volumeUangHarian"
      | "uangHarianFull"
      | "volumeUangHarianPaketMeeting"
      | "volumeUangHarianFull"
      | "volumeUangTransport"
      | "volumePenginapan"
      | "volumeTiketPesawat"
      | "volumeTransportBandaraAsal"
      | "volumeTransportBandaraTujuan"
    >
  >;

type LegacyNotaDinas = Omit<
  NotaDinas,
  | "tanggalBerangkat"
  | "tanggalKembali"
  | "lokasiTujuan"
  | "createdByPegawaiId"
  | "catatanRevisi"
  | "dipaId"
  | "penandatanganSnapshot"
  | "travelConflicts"
  | "lampiran"
> &
  Partial<
    Pick<
      NotaDinas,
      | "tanggalBerangkat"
      | "tanggalKembali"
      | "lokasiTujuan"
      | "createdByPegawaiId"
      | "catatanRevisi"
      | "dipaId"
      | "penandatanganSnapshot"
      | "travelConflicts"
    >
  > & {
    lampiran: LegacyLampiranItem[];
  };

export interface NotaDinasTravelConflict {
  pegawaiId: string;
  notaDinasId?: string;
  nomorNotaDinas: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  lokasiTujuan: string;
}

export interface FindNotaDinasTravelConflictsInput {
  pegawaiId: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  excludeNotaDinasId?: string;
  notas: NotaDinas[];
  spts: Spt[];
  sppds: Sppd[];
}

interface TravelPeriod {
  tanggalBerangkat: string;
  tanggalKembali: string;
  lokasiTujuan: string;
}

const APPROVED_NOTA_STATUSES = new Set<NotaDinas["status"]>([
  "Disetujui",
  "Selesai",
]);

const findUnpersistedNumberReservation = (items: NotaDinas[]) => {
  const storedNumbers = new Set(
    items.map((item) => item.nomor.trim()).filter(Boolean),
  );
  return penomoranService
    .history()
    .find(
      (entry) =>
        entry.documentType === "Nota Dinas" &&
        entry.status === "Terpakai" &&
        !storedNumbers.has(entry.number),
    );
};

const getHighestStoredSequence = (items: NotaDinas[]) =>
  items.reduce((highest, item) => {
    const match = item.nomor.trim().match(/^(\d+)/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

const toNonNegativeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

const normalizeLampiranItem = (
  item: LegacyLampiranItem,
  jenis: NotaDinas["jenis"],
): LampiranItem => {
  const volume = Math.max(1, Math.trunc(toNonNegativeNumber(item.volume)) || 1);
  const normalized: LampiranItem = {
    ...item,
    uangHarian: toNonNegativeNumber(item.uangHarian),
    volumeUangHarian:
      item.volumeUangHarian === undefined
        ? volume
        : Math.trunc(toNonNegativeNumber(item.volumeUangHarian)),
    volumeUangHarianPaketMeeting:
      item.volumeUangHarianPaketMeeting === undefined
        ? volume
        : Math.trunc(toNonNegativeNumber(item.volumeUangHarianPaketMeeting)),
    uangHarianFull: toNonNegativeNumber(item.uangHarianFull),
    volumeUangHarianFull: Math.trunc(
      toNonNegativeNumber(item.volumeUangHarianFull),
    ),
    uangTransport: toNonNegativeNumber(item.uangTransport),
    volumeUangTransport:
      item.volumeUangTransport === undefined
        ? volume
        : Math.trunc(toNonNegativeNumber(item.volumeUangTransport)),
    penginapan: toNonNegativeNumber(item.penginapan),
    volumePenginapan:
      item.volumePenginapan === undefined
        ? jenis === "Luar Daerah"
          ? Math.max(0, volume - 1)
          : jenis === "Luar Kota"
            ? volume
            : 0
        : Math.trunc(toNonNegativeNumber(item.volumePenginapan)),
    tiketPesawat: toNonNegativeNumber(item.tiketPesawat),
    volumeTiketPesawat:
      item.volumeTiketPesawat === undefined
        ? jenis === "Luar Daerah"
          ? 2
          : 0
        : Math.trunc(toNonNegativeNumber(item.volumeTiketPesawat)),
    transportBandaraAsal: toNonNegativeNumber(item.transportBandaraAsal),
    volumeTransportBandaraAsal:
      item.volumeTransportBandaraAsal === undefined
        ? jenis === "Luar Daerah"
          ? 2
          : 0
        : Math.trunc(toNonNegativeNumber(item.volumeTransportBandaraAsal)),
    transportBandaraTujuan: toNonNegativeNumber(item.transportBandaraTujuan),
    volumeTransportBandaraTujuan:
      item.volumeTransportBandaraTujuan === undefined
        ? jenis === "Luar Daerah"
          ? 2
          : 0
        : Math.trunc(toNonNegativeNumber(item.volumeTransportBandaraTujuan)),
    volume,
    total: 0,
  };

  return {
    ...normalized,
    total: calculateLampiranTotal(normalized, jenis),
  };
};

const normalizeNotaDinas = (item: LegacyNotaDinas): NotaDinas => {
  const signer = penandatanganService
    .getAll()
    .find((candidate) => candidate.id === item.penandatanganId);
  const lampiran = item.lampiran.map((row) =>
    normalizeLampiranItem(row, item.jenis),
  );

  return {
    ...item,
    createdByPegawaiId: item.createdByPegawaiId ?? "",
    catatanRevisi: item.catatanRevisi ?? "",
    dipaId: item.dipaId ?? "",
    tanggalBerangkat: item.tanggalBerangkat || "",
    tanggalKembali: item.tanggalKembali || "",
    lokasiTujuan: item.lokasiTujuan || "",
    travelConflicts: item.travelConflicts ?? [],
    lampiran,
    totalBiaya: lampiran.reduce((sum, row) => sum + row.total, 0),
    penandatanganSnapshot:
      item.penandatanganSnapshot?.penandatanganId === item.penandatanganId
        ? item.penandatanganSnapshot
        : signer
          ? createPenandatanganSnapshot(
              signer,
              "Nota Dinas",
              item.tanggal,
              true,
            )
          : null,
  };
};

const isValidDate = (value: string) => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const rangesOverlap = (
  startA: string,
  endA: string,
  startB: string,
  endB: string,
) =>
  new Date(startA).getTime() <= new Date(endB).getTime() &&
  new Date(endA).getTime() >= new Date(startB).getTime();

const getTravelPeriods = (
  nota: NotaDinas,
  pegawaiId: string,
  spts: Spt[],
  sppds: Sppd[],
): TravelPeriod[] => {
  if (
    isValidDate(nota.tanggalBerangkat) &&
    isValidDate(nota.tanggalKembali) &&
    nota.lokasiTujuan.trim()
  ) {
    return [
      {
        tanggalBerangkat: nota.tanggalBerangkat,
        tanggalKembali: nota.tanggalKembali,
        lokasiTujuan: nota.lokasiTujuan,
      },
    ];
  }

  const relatedSpts = spts.filter((spt) => spt.notaDinasId === nota.id);
  const relatedSptIds = new Set(
    relatedSpts.map((spt) => spt.id).filter((id): id is string => Boolean(id)),
  );
  const relatedSppds = sppds.filter(
    (sppd) =>
      relatedSptIds.has(sppd.sptId) &&
      sppd.personil.some((personil) => personil.pegawaiId === pegawaiId) &&
      isValidDate(sppd.tanggalBerangkat) &&
      isValidDate(sppd.tanggalKembali),
  );

  if (relatedSppds.length > 0) {
    return relatedSppds.map((sppd) => ({
      tanggalBerangkat: sppd.tanggalBerangkat,
      tanggalKembali: sppd.tanggalKembali,
      lokasiTujuan: sppd.tempatTujuan || "Lokasi belum tersedia",
    }));
  }

  return relatedSpts
    .filter(
      (spt) =>
        spt.personil.some((personil) => personil.pegawaiId === pegawaiId) &&
        isValidDate(spt.tanggalMulai) &&
        isValidDate(spt.tanggalSelesai),
    )
    .map((spt) => ({
      tanggalBerangkat: spt.tanggalMulai,
      tanggalKembali: spt.tanggalSelesai,
      lokasiTujuan: nota.lokasiTujuan || "Lokasi belum tersedia",
    }));
};

const defaultNotaDinas: NotaDinas[] = [
  {
    id: "nd1",
    createdByPegawaiId: "pg2",
    catatanRevisi: "",
    kepada: "Ketua KPU Kabupaten Gorontalo",
    dari: "Kasubag Keuangan, Umum & Logistik",
    tembusan: "Sekretaris KPU Kabupaten Gorontalo",
    nomor: "001/ND-KPU/VII/2026",
    tanggal: "2026-07-10",
    tanggalBerangkat: "2026-07-12",
    tanggalKembali: "2026-07-14",
    lokasiTujuan: "KPU Provinsi Gorontalo",
    sifat: "Penting",
    perihal: "Permohonan Perjalanan Dinas Rapat Koordinasi Evaluasi Pemilu",
    isi: "Sehubungan dengan pelaksanaan Rapat Koordinasi Evaluasi Pemilu Serentak 2026, bersama ini diajukan permohonan pelaksanaan perjalanan dinas bagi staf pelaksana sub bagian keuangan.",
    dipaId: "d1",
    penandatanganId: "pe1",
    penandatanganSnapshot: null,
    jenis: "Luar Kota",
    status: "Disetujui",
    totalBiaya: 1420000,
    travelConflicts: [],
    lampiran: [
      {
        pegawaiId: "pg1",
        uraian: "Mengikuti rakor evaluasi di KPU Provinsi Gorontalo",
        uangHarian: 370000,
        volumeUangHarian: 2,
        volumeUangHarianPaketMeeting: 2,
        uangHarianFull: 0,
        volumeUangHarianFull: 0,
        uangTransport: 250000,
        volumeUangTransport: 2,
        penginapan: 450000,
        volumePenginapan: 2,
        tiketPesawat: 0,
        volumeTiketPesawat: 0,
        transportBandaraAsal: 0,
        volumeTransportBandaraAsal: 0,
        transportBandaraTujuan: 0,
        volumeTransportBandaraTujuan: 0,
        volume: 2,
        total: 1420000,
      },
    ],
  },
];

const withoutSignerSnapshot = (item: NotaDinas) => {
  const rest = { ...item };
  delete rest.penandatanganSnapshot;
  return rest;
};

export const isUnmodifiedNotaDinasDemoSeed = (item: NotaDinas) =>
  defaultNotaDinas.some(
    (seed) =>
      JSON.stringify(withoutSignerSnapshot(item)) ===
      JSON.stringify(withoutSignerSnapshot(seed)),
  );

export const notaDinasService = {
  getAll: (): NotaDinas[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, "[]");
      return [];
    }
    return (JSON.parse(stored) as LegacyNotaDinas[]).map(normalizeNotaDinas);
  },
  saveAll: (data: NotaDinas[]) => {
    const normalized = data.map((item) => normalizeNotaDinas(item));
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  },
  generateNomor: (dateStr: string): string => {
    const items = notaDinasService.getAll();
    const storedNumbers = items.map((item) => item.nomor);
    if (items.length === 0) {
      penomoranService.reconcileUsedNumbers(
        "Nota Dinas",
        storedNumbers,
        "Riwayat Terpakai dibatalkan karena tidak memiliki Nota Dinas sumber.",
      );
    }
    const unpersistedReservation = findUnpersistedNumberReservation(items);
    if (unpersistedReservation) {
      throw new Error(
        `Nomor Nota Dinas berikutnya belum dapat diambil. Nomor ${unpersistedReservation.number} masih direservasi pada form yang belum disimpan atau dibatalkan.`,
      );
    }
    return penomoranService.requestNumber(
      "Nota Dinas",
      dateStr,
      getHighestStoredSequence(items),
    );
  },
  releaseNomor: (number: string) =>
    penomoranService.releaseNumber(
      "Nota Dinas",
      number,
      "Nomor dilepas karena form Nota Dinas baru dibatalkan sebelum disimpan.",
    ),
  findTravelConflicts: ({
    pegawaiId,
    tanggalBerangkat,
    tanggalKembali,
    excludeNotaDinasId,
    notas,
    spts,
    sppds,
  }: FindNotaDinasTravelConflictsInput): NotaDinasTravelConflict[] => {
    if (
      !pegawaiId ||
      !isValidDate(tanggalBerangkat) ||
      !isValidDate(tanggalKembali) ||
      new Date(tanggalKembali) < new Date(tanggalBerangkat)
    ) {
      return [];
    }

    const conflicts = notas.flatMap((nota) => {
      if (
        nota.id === excludeNotaDinasId ||
        !APPROVED_NOTA_STATUSES.has(nota.status) ||
        !nota.lampiran.some((item) => item.pegawaiId === pegawaiId)
      ) {
        return [];
      }

      return getTravelPeriods(nota, pegawaiId, spts, sppds)
        .filter((period) =>
          rangesOverlap(
            tanggalBerangkat,
            tanggalKembali,
            period.tanggalBerangkat,
            period.tanggalKembali,
          ),
        )
        .map((period) => ({
          pegawaiId,
          notaDinasId: nota.id,
          nomorNotaDinas: nota.nomor,
          ...period,
        }));
    });

    return Array.from(
      new Map(
        conflicts.map((conflict) => [
          [
            conflict.pegawaiId,
            conflict.notaDinasId,
            conflict.tanggalBerangkat,
            conflict.tanggalKembali,
            conflict.lokasiTujuan,
          ].join("|"),
          conflict,
        ]),
      ).values(),
    );
  },
};
