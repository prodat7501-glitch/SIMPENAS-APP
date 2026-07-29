import { z } from "zod";

export const userAccountFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(
      /^[a-z0-9._-]+$/,
      "Gunakan huruf kecil, angka, titik, garis bawah, atau tanda hubung",
    ),
  email: z.string().trim().email("Format email tidak valid"),
  isActive: z.boolean(),
  newPassword: z
    .string()
    .trim()
    .refine(
      (value) => value.length === 0 || value.length >= 8,
      "Kata sandi baru minimal 8 karakter",
    ),
});

export type UserAccountFormInput = z.infer<typeof userAccountFormSchema>;

