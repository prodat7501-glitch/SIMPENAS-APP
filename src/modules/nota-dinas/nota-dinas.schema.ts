import { z } from "zod";

export const lampiranItemSchema = z.object({
  pegawaiId: z.string().min(1, "Wajib memilih pegawai"),
  uraian: z.string().default("Perjalanan dinas"),
  uangHarian: z.number().nonnegative().default(0),
  uangTransport: z.number().nonnegative().default(0),
  penginapan: z.number().nonnegative().default(0),
  tiketPesawat: z.number().nonnegative().default(0),
  transportBandaraAsal: z.number().nonnegative().default(0),
  transportBandaraTujuan: z.number().nonnegative().default(0),
  volume: z.number().min(1, "Volume/hari minimal 1").default(1),
  total: z.number().nonnegative().default(0),
});

export const notaDinasSchema = z.object({
  id: z.string().optional(),
  kepada: z.string().min(3, "Penerima wajib diisi"),
  dari: z.string().min(3, "Pengirim wajib diisi"),
  tembusan: z.string().optional().default(""),
  nomor: z.string().min(1, "Nomor wajib diisi (gunakan Ambil Nomor)"),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
  sifat: z.enum(["Biasa", "Penting", "Rahasia"]).default("Biasa"),
  perihal: z.string().min(3, "Perihal wajib diisi"),
  isi: z.string().min(10, "Isi nota dinas minimal 10 karakter"),
  penandatanganId: z.string().min(1, "Wajib memilih penandatangan"),
  jenis: z
    .enum(["Dalam Kota", "Luar Kota", "Luar Daerah"])
    .default("Luar Kota"),
  status: z
    .enum([
      "Draft",
      "Nomor Diambil",
      "Menunggu Approval",
      "Disetujui",
      "Perlu Revisi",
      "Selesai",
    ])
    .default("Draft"),
  lampiran: z
    .array(lampiranItemSchema)
    .min(1, "Lampiran minimal harus memiliki 1 personil"),
  totalBiaya: z.number().nonnegative().default(0),
});

export type LampiranItem = z.infer<typeof lampiranItemSchema>;
export type NotaDinas = z.infer<typeof notaDinasSchema>;
