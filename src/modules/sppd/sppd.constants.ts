export const SPPD_QUERY_KEY = ["sppd"] as const;

export const SPPD_STATUS_OPTIONS = [
  "Draft",
  "Diproses",
  "Selesai",
  "Diarsipkan",
] as const;

export const SPPD_REPORT_READY_STATUSES: readonly string[] = [
  "Selesai",
  "Diarsipkan",
];

export const TRANSPORTASI_OPTIONS = [
  "Mobil",
  "Pesawat",
  "Kapal Laut",
  "Kereta Api",
] as const;

export const DEFAULT_INSTANSI = "Komisi Pemilihan Umum Kabupaten Gorontalo";
