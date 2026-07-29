import { z } from "zod";

export const pangkatSchema = z.object({
  id: z.string().optional(),
  golongan: z
    .string()
    .trim()
    .min(1, "Golongan minimal 1 karakter (contoh: I atau IV/a)"),
  namaPangkat: z
    .string()
    .min(3, "Nama pangkat minimal 3 karakter (contoh: Pembina)"),
});

export type Pangkat = z.infer<typeof pangkatSchema>;
