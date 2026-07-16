import { z } from "zod";

export const sbmSchema = z.object({
  id: z.string().optional(),
  wilayah: z
    .string()
    .min(3, "Wilayah/provinsi minimal 3 karakter (contoh: Gorontalo)"),
  jenisBiaya: z
    .string()
    .min(3, "Jenis biaya minimal 3 karakter (contoh: Uang Harian)"),
  satuan: z.string().min(1, "Satuan minimal 1 karakter (contoh: OH)"),
  tarif: z.number().min(0, "Tarif biaya tidak boleh negatif"),
});

export type SBM = z.infer<typeof sbmSchema>;
