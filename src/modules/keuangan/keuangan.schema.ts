import { z } from "zod";
import { DOCUMENT_TYPES, SPJ_STATUS_OPTIONS } from "./keuangan.constants";

export const checklistSchema = z.object({
  laporan: z.boolean(),
  sppd: z.boolean(),
  dokumentasi: z.boolean(),
  tandaTangan: z.boolean(),
});
export const rincianSchema = z.object({
  pegawaiId: z.string(),
  notaDinasId: z.string(),
  lampiranIndex: z.number(),
  uangTransport: z.number(),
  uangHarian: z.number(),
  penginapan: z.number(),
  jumlah: z.number(),
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
  anggaran: z.string(),
  mak: z.string(),
  rincian: z.array(rincianSchema),
  total: z.number(),
  status: z.enum(["Dibuat", "Selesai"]).default("Dibuat"),
});
export const spjSchema = z.object({
  id: z.string(),
  laporanId: z.string(),
  sppdId: z.string(),
  status: z.enum(SPJ_STATUS_OPTIONS),
  checklist: checklistSchema,
  catatan: z.string(),
  tanggalDiterima: z.string(),
  dokumen: z.array(dokumenKeuanganSchema),
});

export type Spj = z.infer<typeof spjSchema>;
export type DokumenKeuangan = z.infer<typeof dokumenKeuanganSchema>;
export type JenisDokumen = DokumenKeuangan["jenis"];
export type RincianKeuangan = z.infer<typeof rincianSchema>;
