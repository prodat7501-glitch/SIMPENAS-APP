import type { LampiranItem, NotaDinas } from "./nota-dinas.schema";

export type LampiranCostKey =
  | "uangHarian"
  | "uangHarianFull"
  | "uangTransport"
  | "penginapan"
  | "tiketPesawat"
  | "transportBandaraAsal"
  | "transportBandaraTujuan";

export interface LampiranCostLine {
  key: LampiranCostKey;
  label: string;
  rate: number;
  quantity: number;
  unit: "hari" | "malam" | "kali";
  subtotal: number;
}

const toNonNegativeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

export const getActivityDays = (item: Pick<LampiranItem, "volume">) =>
  Math.max(1, Math.trunc(toNonNegativeNumber(item.volume)) || 1);

export const getMeetingDailyAllowanceDays = (
  item: Pick<LampiranItem, "volumeUangHarianPaketMeeting">,
) => Math.trunc(toNonNegativeNumber(item.volumeUangHarianPaketMeeting));

export const getFullDailyAllowanceDays = (
  item: Pick<LampiranItem, "volumeUangHarianFull">,
) => Math.trunc(toNonNegativeNumber(item.volumeUangHarianFull));

const getManualVolume = (value: unknown) =>
  Math.trunc(toNonNegativeNumber(value));

const costLine = (
  key: LampiranCostKey,
  label: string,
  rate: number,
  quantity: number,
  unit: LampiranCostLine["unit"],
): LampiranCostLine => ({
  key,
  label,
  rate: toNonNegativeNumber(rate),
  quantity,
  unit,
  subtotal: toNonNegativeNumber(rate) * quantity,
});

export const getLampiranCostLines = (
  item: LampiranItem,
  jenis: NotaDinas["jenis"],
): LampiranCostLine[] => {
  if (jenis === "Dalam Kota") {
    return [
      costLine(
        "uangHarian",
        "Uang Harian",
        item.uangHarian,
        getManualVolume(item.volumeUangHarian),
        "hari",
      ),
      costLine(
        "uangTransport",
        "Uang Transport",
        item.uangTransport,
        getManualVolume(item.volumeUangTransport),
        "hari",
      ),
    ];
  }

  if (jenis === "Luar Kota") {
    return [
      costLine(
        "uangHarian",
        "Uang Harian",
        item.uangHarian,
        getManualVolume(item.volumeUangHarian),
        "hari",
      ),
      costLine(
        "uangTransport",
        "Uang Transport",
        item.uangTransport,
        getManualVolume(item.volumeUangTransport),
        "hari",
      ),
      costLine(
        "penginapan",
        "Penginapan",
        item.penginapan,
        getManualVolume(item.volumePenginapan),
        "malam",
      ),
    ];
  }

  return [
    costLine(
      "uangHarian",
      "Uang Harian Paket Meeting",
      item.uangHarian,
      getMeetingDailyAllowanceDays(item),
      "hari",
    ),
    costLine(
      "uangHarianFull",
      "Uang Harian Full",
      item.uangHarianFull,
      getFullDailyAllowanceDays(item),
      "hari",
    ),
    costLine(
      "uangTransport",
      "Transport",
      item.uangTransport,
      getManualVolume(item.volumeUangTransport),
      "hari",
    ),
    costLine(
      "penginapan",
      "Penginapan",
      item.penginapan,
      getManualVolume(item.volumePenginapan),
      "malam",
    ),
    costLine(
      "tiketPesawat",
      "Tiket Pesawat",
      item.tiketPesawat,
      getManualVolume(item.volumeTiketPesawat),
      "kali",
    ),
    costLine(
      "transportBandaraAsal",
      "Transport Bandara Asal",
      item.transportBandaraAsal,
      getManualVolume(item.volumeTransportBandaraAsal),
      "kali",
    ),
    costLine(
      "transportBandaraTujuan",
      "Transport Bandara Tujuan",
      item.transportBandaraTujuan,
      getManualVolume(item.volumeTransportBandaraTujuan),
      "kali",
    ),
  ];
};

export const getLampiranCostBreakdown = (
  item: LampiranItem,
  jenis: NotaDinas["jenis"],
) => {
  const lines = getLampiranCostLines(item, jenis);
  const subtotal = (key: LampiranCostKey) =>
    lines.find((line) => line.key === key)?.subtotal ?? 0;

  return {
    uangHarianPaketMeeting: subtotal("uangHarian"),
    uangHarianFull: subtotal("uangHarianFull"),
    uangTransport: subtotal("uangTransport"),
    penginapan: subtotal("penginapan"),
    tiketPesawat: subtotal("tiketPesawat"),
    transportBandaraAsal: subtotal("transportBandaraAsal"),
    transportBandaraTujuan: subtotal("transportBandaraTujuan"),
    total: lines.reduce((sum, line) => sum + line.subtotal, 0),
  };
};

export const calculateLampiranTotal = (
  item: LampiranItem,
  jenis: NotaDinas["jenis"],
) => getLampiranCostBreakdown(item, jenis).total;
