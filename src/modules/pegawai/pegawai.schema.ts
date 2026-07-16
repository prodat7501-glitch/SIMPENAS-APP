import { z } from "zod";

export const KATEGORI_PEGAWAI_OPTIONS = [
  "ASN/Sekretariat",
  "Ketua KPU",
  "Anggota KPU",
] as const;

export const ROLE_APLIKASI_OPTIONS = [
  "Administrator",
  "Supervisor",
  "Pegawai",
  "Sub Bagian Keuangan",
] as const;

export const pegawaiSchema = z
  .object({
    id: z.string().optional(),
    kategoriPegawai: z
      .enum(KATEGORI_PEGAWAI_OPTIONS)
      .default("ASN/Sekretariat"),
    nip: z.string().trim().default(""),
    nama: z.string().min(3, "Nama minimal 3 karakter"),
    jabatanId: z.string().min(1, "Wajib memilih jabatan"),
    unitKerjaId: z.string().min(1, "Wajib memilih unit kerja"),
    pangkatId: z.string().default(""),
    roleAplikasi: z.enum(ROLE_APLIKASI_OPTIONS).default("Pegawai"),
    status: z.enum(["Aktif", "Nonaktif"]).default("Aktif"),
  })
  .superRefine((data, ctx) => {
    const wajibAdministrasiAsn = data.kategoriPegawai === "ASN/Sekretariat";

    if (wajibAdministrasiAsn && !data.nip) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nip"],
        message: "NIP wajib diisi untuk ASN/Sekretariat",
      });
    }

    if (data.nip && (data.nip.length < 18 || data.nip.length > 20)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nip"],
        message: "NIP harus 18-20 karakter",
      });
    }

    if (wajibAdministrasiAsn && !data.pangkatId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["pangkatId"],
        message: "Pangkat/golongan wajib diisi untuk ASN/Sekretariat",
      });
    }
  });

export type Pegawai = z.infer<typeof pegawaiSchema>;
