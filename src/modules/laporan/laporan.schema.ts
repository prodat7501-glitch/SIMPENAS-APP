import { z } from "zod";
import { LAPORAN_STATUS_OPTIONS } from "./laporan.constants";

export const dokumentasiSchema = z.object({
  id: z.string(),
  nama: z.string(),
  dataUrl: z.string().min(1, "Berkas foto tidak valid"),
  caption: z.string().optional().default(""),
});

export const uploadedFileSchema = z.object({
  id: z.string().optional(),
  nama: z.string(),
  dataUrl: z.string().min(1, "Berkas dokumen tidak valid"),
  tipe: z.string().optional().default(""),
  ukuran: z.number().optional().default(0),
});

export const laporanSchema = z
  .object({
    id: z.string().optional(),
    metodeLaporan: z.enum(["form", "upload"]).default("form"),
    fileLaporan: uploadedFileSchema.nullable().optional(),
    sptId: z.string().min(1, "Nomor SPT wajib dipilih"),
    sppdId: z.string().optional().default(""),
    pelaksanaId: z.string().optional().default(""),
    judulLaporan: z.string().min(3, "Judul laporan minimal 3 karakter"),
    suratTugas: z.string().optional().default("Sekretaris KPU"),
    nomorSuratTugas: z.string().optional().default(""),
    tanggalSuratTugas: z.string().optional().default(""),
    dasarPelaksanaan: z.string().optional().default(""),
    maksud: z.string().optional().default(""),
    tujuan: z.string().optional().default(""),
    tempatPelaksanaan: z.string().optional().default(""),
    hariTanggalPelaksanaan: z.string().optional().default(""),
    tempatWaktu: z.string().optional().default(""),
    materi: z.string().optional().default(""),
    hasilPelaksanaan: z.string().optional().default(""),
    kalimatPenutup: z.string().optional().default(""),
    dokumentasi: z.array(dokumentasiSchema).optional().default([]),
    tandaTangan: z.string().optional().default("manual"),
    status: z.enum(LAPORAN_STATUS_OPTIONS).default("Draft"),
    catatanVerifikasi: z.string().default(""),
    tempatLaporan: z.string().min(3, "Tempat pembuatan laporan wajib diisi"),
    tanggalLaporan: z.string().min(1, "Tanggal laporan wajib diisi"),
  })
  .superRefine((data, ctx) => {
    if (data.metodeLaporan === "upload") {
      if (!data.fileLaporan || !data.fileLaporan.dataUrl) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fileLaporan"],
          message: "Berkas dokumen laporan (PDF atau Word) wajib diunggah",
        });
      }
    } else {
      if (!data.suratTugas || data.suratTugas.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["suratTugas"],
          message: "Surat Tugas wajib diisi",
        });
      }
      if (!data.nomorSuratTugas || data.nomorSuratTugas.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nomorSuratTugas"],
          message: "Nomor Surat Tugas wajib diisi",
        });
      }
      if (!data.tanggalSuratTugas || data.tanggalSuratTugas.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tanggalSuratTugas"],
          message: "Tanggal Surat Tugas wajib diisi",
        });
      }
      if (!data.maksud || data.maksud.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maksud"],
          message: "Maksud minimal 5 karakter",
        });
      }
      if (!data.tujuan || data.tujuan.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tujuan"],
          message: "Tujuan minimal 3 karakter",
        });
      }
      if (!data.tempatPelaksanaan || data.tempatPelaksanaan.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tempatPelaksanaan"],
          message: "Tempat pelaksanaan minimal 3 karakter",
        });
      }
      if (
        !data.hariTanggalPelaksanaan ||
        data.hariTanggalPelaksanaan.trim().length < 3
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hariTanggalPelaksanaan"],
          message: "Hari / tanggal pelaksanaan minimal 3 karakter",
        });
      }
      if (!data.materi || data.materi.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["materi"],
          message: "Materi minimal 5 karakter",
        });
      }
      if (!data.hasilPelaksanaan || data.hasilPelaksanaan.trim().length < 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasilPelaksanaan"],
          message: "Hasil pelaksanaan minimal 10 karakter",
        });
      }
      if (!data.dokumentasi || data.dokumentasi.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dokumentasi"],
          message: "Minimal satu foto dokumentasi wajib diunggah",
        });
      }
    }
  });

export type Dokumentasi = z.infer<typeof dokumentasiSchema>;
export type UploadedFile = z.infer<typeof uploadedFileSchema>;
export type Laporan = z.infer<typeof laporanSchema>;
export type LaporanFormValues = z.input<typeof laporanSchema>;
