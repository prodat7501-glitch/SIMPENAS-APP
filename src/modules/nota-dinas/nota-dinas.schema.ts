import { z } from "zod";
import { penandatanganSnapshotSchema } from "@/modules/penandatangan/penandatangan.schema";

export const lampiranItemSchema = z.object({
  pegawaiId: z.string().min(1, "Wajib memilih pegawai"),
  uraian: z.string().default("Perjalanan dinas"),
  uangHarian: z.number().nonnegative().default(0),
  volumeUangHarian: z
    .number()
    .int()
    .min(0, "Volume uang harian minimal 0")
    .default(0),
  volumeUangHarianPaketMeeting: z
    .number()
    .int()
    .min(0, "Uang harian meeting minimal 0 hari")
    .default(0),
  uangHarianFull: z.number().nonnegative().default(0),
  volumeUangHarianFull: z
    .number()
    .int()
    .min(0, "Uang harian full minimal 0 hari")
    .default(0),
  uangTransport: z.number().nonnegative().default(0),
  volumeUangTransport: z
    .number()
    .int()
    .min(0, "Volume transport minimal 0")
    .default(0),
  penginapan: z.number().nonnegative().default(0),
  volumePenginapan: z
    .number()
    .int()
    .min(0, "Volume penginapan minimal 0")
    .default(0),
  tiketPesawat: z.number().nonnegative().default(0),
  volumeTiketPesawat: z
    .number()
    .int()
    .min(0, "Volume tiket pesawat minimal 0")
    .default(0),
  transportBandaraAsal: z.number().nonnegative().default(0),
  volumeTransportBandaraAsal: z
    .number()
    .int()
    .min(0, "Volume transport bandara asal minimal 0")
    .default(0),
  transportBandaraTujuan: z.number().nonnegative().default(0),
  volumeTransportBandaraTujuan: z
    .number()
    .int()
    .min(0, "Volume transport bandara tujuan minimal 0")
    .default(0),
  volume: z.number().min(1, "Volume/hari minimal 1").default(1),
  total: z.number().nonnegative().default(0),
});

export const notaDinasTravelConflictSchema = z.object({
  pegawaiId: z.string(),
  notaDinasId: z.string().optional(),
  nomorNotaDinas: z.string(),
  tanggalBerangkat: z.string(),
  tanggalKembali: z.string(),
  lokasiTujuan: z.string(),
});

export const notaDinasSchema = z
  .object({
    id: z.string().optional(),
    createdByPegawaiId: z.string().optional(),
    catatanRevisi: z.string().optional(),
    kepada: z.string().min(3, "Penerima wajib diisi"),
    dari: z.string().min(3, "Pengirim wajib diisi"),
    tembusan: z.string().optional().default(""),
    nomor: z.string().min(1, "Nomor wajib diisi (gunakan Ambil Nomor)"),
    tanggal: z.string().min(1, "Tanggal wajib diisi"),
    tanggalBerangkat: z.string().min(1, "Tanggal berangkat wajib diisi"),
    tanggalKembali: z.string().min(1, "Tanggal kembali wajib diisi"),
    lokasiTujuan: z.string().min(3, "Lokasi tujuan minimal 3 karakter"),
    sifat: z.enum(["Biasa", "Penting", "Rahasia"]).default("Biasa"),
    perihal: z.string().min(3, "Perihal wajib diisi"),
    isi: z.string().min(10, "Isi nota dinas minimal 10 karakter"),
    dipaId: z.string().min(1, "Sumber Anggaran DIPA wajib dipilih"),
    penandatanganId: z.string().min(1, "Wajib memilih penandatangan"),
    penandatanganSnapshot: penandatanganSnapshotSchema.nullable().optional(),
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
    travelConflicts: z.array(notaDinasTravelConflictSchema).default([]),
  })
  .superRefine((data, ctx) => {
    if (!data.tanggalBerangkat || !data.tanggalKembali) return;

    const start = new Date(data.tanggalBerangkat);
    const end = new Date(data.tanggalKembali);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        code: "custom",
        path: ["tanggalBerangkat"],
        message: "Format tanggal perjalanan tidak valid",
      });
      return;
    }

    if (end < start) {
      ctx.addIssue({
        code: "custom",
        path: ["tanggalKembali"],
        message: "Tanggal kembali tidak boleh sebelum tanggal berangkat",
      });
    }
  });

export type LampiranItem = z.infer<typeof lampiranItemSchema>;
export type NotaDinasTravelConflictSnapshot = z.infer<
  typeof notaDinasTravelConflictSchema
>;
export type NotaDinas = z.infer<typeof notaDinasSchema>;
