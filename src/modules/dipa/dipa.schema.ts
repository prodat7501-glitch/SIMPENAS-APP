import { z } from "zod";

export const dipaSchema = z.object({
  id: z.string().optional(),
  kodeDipa: z
    .string()
    .min(5, "Kode DIPA minimal 5 karakter (contoh: 015.01.2.123456)"),
  program: z.string().min(5, "Nama program/kegiatan minimal 5 karakter"),
  pagu: z.number().min(1000, "Nilai pagu minimal Rp 1.000"),
  realisasi: z.number().min(0, "Nilai realisasi tidak boleh negatif"),
  tahunAnggaran: z.string().length(4, "Tahun anggaran harus 4 digit"),
});

export type DIPA = z.infer<typeof dipaSchema>;
