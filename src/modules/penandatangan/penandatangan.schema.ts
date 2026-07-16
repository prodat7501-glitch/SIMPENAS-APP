import { z } from "zod";

export const DEFAULT_PERAN_DOKUMEN = [
  "Pembuat Nota Dinas",
  "Penandatangan SPT",
  "Penandatangan SPPD",
  "Verifikator Laporan",
  "Pejabat Pembuat Komitmen",
  "Bendahara Pengeluaran",
  "Kuasa Pengguna Anggaran",
  "Verifikator SPJ",
  "KPA",
  "PPK",
  "Bendahara",
  "Sekretaris KPU",
  "PLT Sekretaris KPU",
  "PLH Sekretaris KPU",
  "Ketua KPU",
  "Kepala Sub Bagian",
  "Kasubbag",
] as const;

export const penandatanganSchema = z.object({
  id: z.string().optional(),
  nip: z
    .string()
    .min(18, "NIP harus minimal 18 karakter")
    .max(20, "NIP maksimal 20 karakter"),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  jabatanPenandatangan: z
    .string()
    .min(
      5,
      "Jabatan penandatangan minimal 5 karakter (contoh: Kepala Sekretariat KPU Kabupaten Gorontalo)",
    ),
  peran: z.string().min(2, "Peran dokumen wajib diisi"),
  status: z.enum(["Aktif", "Nonaktif"]).default("Aktif"),
});

export type Penandatangan = z.infer<typeof penandatanganSchema>;
