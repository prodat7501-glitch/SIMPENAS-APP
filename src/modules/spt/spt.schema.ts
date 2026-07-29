import { z } from "zod";
import { penandatanganSnapshotSchema } from "@/modules/penandatangan/penandatangan.schema";

export const textItemSchema = z.object({
  text: z.string().min(3, "Isi butir teks minimal 3 karakter"),
});

export const personilItemSchema = z.object({
  pegawaiId: z.string().min(1, "Wajib memilih pegawai"),
});

export const sptSchema = z.object({
  id: z.string().optional(),
  createdByPegawaiId: z.string().optional(),
  catatanRevisi: z.string().optional(),
  notaDinasId: z.string().min(1, "Nota Dinas yang valid wajib dipilih"),
  nomor: z.string().min(1, "Nomor wajib diisi (gunakan Ambil Nomor)"),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  penandatanganId: z.string().min(1, "Wajib memilih penandatangan"),
  penandatanganSnapshot: penandatanganSnapshotSchema.nullable().optional(),
  status: z
    .enum([
      "Draft",
      "Nomor Diambil",
      "Menunggu Approval",
      "Disetujui",
      "Perlu Revisi",
      "Selesai",
    ])
    .default("Draft"),
  menimbang: z
    .array(textItemSchema)
    .min(1, "Wajib memiliki minimal 1 butir menimbang"),
  dasar: z
    .array(textItemSchema)
    .min(1, "Wajib memiliki minimal 1 butir dasar hukum"),
  untuk: z.array(textItemSchema).min(1, "Wajib memiliki minimal 1 butir tugas"),
  personil: z
    .array(personilItemSchema)
    .min(1, "Wajib menugaskan minimal 1 personil"),
});

export type Spt = z.infer<typeof sptSchema>;
