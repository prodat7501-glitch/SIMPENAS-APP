import { z } from "zod";

export const jabatanSchema = z.object({
  id: z.string().optional(),
  kode: z.string().min(2, "Kode minimal 2 karakter"),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
});

export type Jabatan = z.infer<typeof jabatanSchema>;
