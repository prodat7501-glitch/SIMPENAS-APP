import { z } from "zod";
import { LAPORAN_STATUS_OPTIONS } from "./laporan.constants";

export const dokumentasiSchema = z.object({
  id: z.string(),
  nama: z.string(),
  dataUrl: z.string().min(1, "Berkas foto tidak valid"),
  caption: z.string().optional().default(""),
});

export const laporanSchema = z.object({
  id: z.string().optional(),
  sptId: z.string().min(1, "Nomor SPT wajib dipilih"),
  sppdId: z.string().optional().default(""),
  pelaksanaId: z.string().optional().default(""),
  judulLaporan: z.string().min(3, "Judul laporan minimal 3 karakter"),
  suratTugas: z.string().min(1, "Surat Tugas wajib diisi"),
  nomorSuratTugas: z.string().min(1, "Nomor Surat Tugas wajib diisi"),
  tanggalSuratTugas: z.string().min(1, "Tanggal Surat Tugas wajib diisi"),
  dasarPelaksanaan: z.string().optional().default(""),
  maksud: z.string().min(5, "Maksud minimal 5 karakter"),
  tujuan: z.string().min(3, "Tujuan minimal 3 karakter"),
  tempatPelaksanaan: z.string().min(3, "Tempat pelaksanaan minimal 3 karakter"),
  hariTanggalPelaksanaan: z
    .string()
    .min(3, "Hari / tanggal pelaksanaan minimal 3 karakter"),
  tempatWaktu: z.string().optional().default(""),
  materi: z.string().min(5, "Materi minimal 5 karakter"),
  hasilPelaksanaan: z.string().min(10, "Hasil pelaksanaan minimal 10 karakter"),
  dokumentasi: z
    .array(dokumentasiSchema)
    .min(1, "Minimal satu foto dokumentasi wajib diunggah"),
  tandaTangan: z.string().optional().default("manual"),
  status: z.enum(LAPORAN_STATUS_OPTIONS).default("Draft"),
  catatanVerifikasi: z.string().default(""),
  tempatLaporan: z.string().min(3, "Tempat pembuatan laporan wajib diisi"),
  tanggalLaporan: z.string().min(1, "Tanggal laporan wajib diisi"),
});

export type Dokumentasi = z.infer<typeof dokumentasiSchema>;
export type Laporan = z.infer<typeof laporanSchema>;
export type LaporanFormValues = z.input<typeof laporanSchema>;
