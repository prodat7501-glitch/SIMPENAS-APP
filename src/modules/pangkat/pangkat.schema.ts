import { z } from "zod";

export const pangkatSchema = z.object({
  id: z.string().optional(),
  golongan: z.string().min(2, "Golongan minimal 2 karakter (contoh: IV/a)"),
  namaPangkat: z
    .string()
    .min(3, "Nama pangkat minimal 3 karakter (contoh: Pembina)"),
});

export type Pangkat = z.infer<typeof pangkatSchema>;
