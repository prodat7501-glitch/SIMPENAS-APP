import { z } from "zod";

const requiredText = (label: string) =>
  z.string().trim().min(1, `${label} wajib diisi`);

export const dipaFormSchema = z.object({
  kodeKro: requiredText("Kode KRO"),
  klasifikasiRincianOutput: requiredText("Klasifikasi Rincian Output (KRO)"),
  kodeAkun: requiredText("Kode Akun"),
  akunPerjalananDinas: requiredText("Akun Perjalanan Dinas"),
  pagu: z
    .number({ error: "Pagu Anggaran wajib berupa angka" })
    .finite("Pagu Anggaran tidak valid")
    .min(0, "Pagu Anggaran tidak boleh negatif"),
  tahunAnggaran: z
    .string()
    .trim()
    .regex(/^\d{4}$/, "Tahun Anggaran harus terdiri dari 4 digit angka"),
});

export type DipaFormData = z.infer<typeof dipaFormSchema>;

export const buildKodeDipa = (
  data: Pick<DipaFormData, "kodeKro" | "kodeAkun">,
) =>
  [data.kodeKro, data.kodeAkun]
    .map((value) => value.trim().replace(/^\.+|\.+$/g, ""))
    .filter(Boolean)
    .join(".");

export const dipaSchema = dipaFormSchema.extend({
  id: z.string().min(1),
  kodeDipa: z.string().min(1, "Kode DIPA tidak dapat dibentuk"),
  realisasi: z.number().finite().nonnegative().default(0),
  // Alias kompatibilitas bagi transaksi existing yang membaca nama anggaran
  // dari properti `program`.
  program: z.string().min(1),
});

export type DIPA = z.infer<typeof dipaSchema>;

export const createDipaRecord = (data: DipaFormData, id: string): DIPA =>
  dipaSchema.parse({
    ...data,
    id,
    kodeDipa: buildKodeDipa(data),
    program: data.akunPerjalananDinas,
    realisasi: 0,
  });
