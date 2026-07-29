import { z } from "zod";
import {
  DOCUMENT_TYPES,
  PAYMENT_METHOD_OPTIONS,
  SPJ_STATUS_OPTIONS,
} from "./keuangan.constants";
import { penandatanganSnapshotSchema } from "@/modules/penandatangan/penandatangan.schema";

export const checklistSchema = z.object({
  laporan: z.boolean(),
  sppd: z.boolean(),
  dokumentasi: z.boolean(),
  tandaTangan: z.boolean(),
});
export const realisasiBiayaSchema = z.object({
  pegawaiId: z.string(),
  notaDinasId: z.string(),
  lampiranIndex: z.number(),
  uangTransportHarian: z.number().nonnegative(),
  penginapan: z.number().nonnegative(),
  tiketPesawat: z.number().nonnegative(),
  transportBandaraAsal: z.number().nonnegative(),
  transportBandaraTujuan: z.number().nonnegative(),
  diverifikasi: z.boolean(),
});
export const rincianSchema = z.object({
  pegawaiId: z.string(),
  notaDinasId: z.string(),
  lampiranIndex: z.number(),
  uangTransport: z.number(),
  uangHarian: z.number(),
  penginapan: z.number(),
  uangHarianPaketMeeting: z.number().nonnegative().default(0),
  uangHarianFull: z.number().nonnegative().default(0),
  uangTransportHarian: z.number().nonnegative().default(0),
  tiketPesawat: z.number().nonnegative().default(0),
  transportBandaraAsal: z.number().nonnegative().default(0),
  transportBandaraTujuan: z.number().nonnegative().default(0),
  jumlah: z.number(),
});
export const paymentCompletionInputSchema = z.object({
  tanggalPembayaran: z.string().min(1, "Tanggal pembayaran wajib diisi."),
  metodePembayaran: z.enum(PAYMENT_METHOD_OPTIONS),
  referensiPembayaran: z
    .string()
    .trim()
    .max(100, "Referensi pembayaran maksimal 100 karakter."),
  petugasPembayaran: z.string().trim().min(1, "Petugas pembayaran wajib ada."),
});
export const paymentCompletionSchema = paymentCompletionInputSchema.extend({
  dikonfirmasiPada: z.string(),
});
export const dokumenKeuanganSchema = z.object({
  id: z.string(),
  spjId: z.string(),
  laporanId: z.string(),
  sppdId: z.string(),
  sptId: z.string(),
  notaDinasId: z.string(),
  parentDocumentId: z.string().nullable().default(null),
  jenis: z.enum(DOCUMENT_TYPES),
  nomor: z.string(),
  tanggal: z.string(),
  tahun: z.string(),
  dipaId: z.string().default(""),
  anggaran: z.string(),
  mak: z.string(),
  rincian: z.array(rincianSchema),
  total: z.number(),
  status: z.enum(["Dibuat", "Selesai"]).default("Dibuat"),
  pembayaran: paymentCompletionSchema.nullable().default(null),
  penandatanganSnapshots: z.array(penandatanganSnapshotSchema).default([]),
});
export const spjSchema = z.object({
  id: z.string(),
  laporanId: z.string(),
  sppdId: z.string(),
  status: z.enum(SPJ_STATUS_OPTIONS),
  checklist: checklistSchema,
  realisasiBiaya: z.array(realisasiBiayaSchema).default([]),
  catatan: z.string(),
  tanggalDiterima: z.string(),
  dokumen: z.array(dokumenKeuanganSchema),
});

export type Spj = z.infer<typeof spjSchema>;
export type DokumenKeuangan = z.infer<typeof dokumenKeuanganSchema>;
export type JenisDokumen = DokumenKeuangan["jenis"];
export type RincianKeuangan = z.infer<typeof rincianSchema>;
export type RealisasiBiaya = z.infer<typeof realisasiBiayaSchema>;
export type PaymentCompletionInput = z.infer<
  typeof paymentCompletionInputSchema
>;
