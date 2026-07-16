import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username minimal terdiri dari 3 karakter." })
    .max(50, { message: "Username maksimal terdiri dari 50 karakter." }),
  role: z.enum(
    ["Administrator", "Supervisor", "Pegawai", "Sub Bagian Keuangan"],
    { message: "Pilih salah satu peran hak akses." },
  ),
  password: z
    .string()
    .min(4, { message: "Kata sandi minimal terdiri dari 4 karakter." }),
});

export type LoginInput = z.infer<typeof loginSchema>;
