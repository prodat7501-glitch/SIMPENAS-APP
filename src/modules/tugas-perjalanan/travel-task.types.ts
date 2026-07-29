export type TravelTaskStage =
  | "NOTA_DINAS_BELUM_DIKIRIM"
  | "NOTA_DINAS_MENUNGGU_APPROVAL"
  | "NOTA_DINAS_PERLU_REVISI"
  | "SPT_BELUM_DITERBITKAN"
  | "SPT_SEDANG_DISUSUN"
  | "SPT_MENUNGGU_APPROVAL"
  | "SPT_PERLU_REVISI"
  | "SPPD_BELUM_DITERBITKAN"
  | "SPPD_SEDANG_DITERBITKAN"
  | "LAPORAN_BELUM_DIBUAT"
  | "LAPORAN_SEDANG_DISUSUN"
  | "LAPORAN_MENUNGGU_VERIFIKASI"
  | "LAPORAN_PERLU_REVISI"
  | "MENUNGGU_SPJ"
  | "SPJ_PERLU_DILENGKAPI"
  | "SPJ_DITERIMA"
  | "VALIDASI_SPJ"
  | "VALIDASI_SELESAI"
  | "PROSES_PEMBAYARAN"
  | "PEMBAYARAN_SELESAI";

export type TravelTaskTone = "info" | "warning" | "success" | "danger";

export interface TravelTask {
  id: string;
  notaDinasId: string;
  nomorNotaDinas: string;
  nomorSpt?: string;
  perihal: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  lokasiTujuan: string;
  stage: TravelTaskStage;
  statusLabel: string;
  description: string;
  tone: TravelTaskTone;
  actionLabel?: string;
  actionUrl?: string;
  notificationEventKey?: string;
  completed: boolean;
}
