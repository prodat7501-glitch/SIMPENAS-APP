import { z } from "zod";

import { DEFAULT_INSTANSI, SPPD_STATUS_OPTIONS } from "./sppd.constants";

export const sppdPersonilSchema = z.object({
  pegawaiId: z.string().min(1, "Personil SPT tidak valid"),
});

export const sppdTandaTanganHalaman2Schema = z.object({
  tibaDi: z.string().optional().default(""),
  tanggalTiba: z.string().optional().default(""),
  berangkatDari: z.string().optional().default(""),
  ke: z.string().optional().default(""),
  tanggalBerangkat: z.string().optional().default(""),
  jabatan: z.string().optional().default(""),
  nama: z.string().optional().default(""),
  nip: z.string().optional().default(""),
});

export const sppdSchema = z
  .object({
    id: z.string().optional(),
    nomor: z
      .string()
      .min(1, "Nomor SPPD wajib diisi dari nomor SPT referensi."),
    sptId: z.string().min(1, "SPT yang telah disetujui wajib dipilih"),
    personil: z
      .array(sppdPersonilSchema)
      .min(1, "Wajib memilih satu personil dari SPT")
      .max(1, "SPPD dibuat per orang, tidak boleh lebih dari satu personil"),
    maksud: z.string().min(5, "Maksud perjalanan dinas minimal 5 karakter"),
    transportasi: z.string().min(1, "Transportasi wajib diisi"),
    tempatBerangkat: z.string().min(3, "Tempat berangkat minimal 3 karakter"),
    tempatTujuan: z.string().min(3, "Tempat tujuan minimal 3 karakter"),
    tanggalBerangkat: z.string().min(1, "Tanggal berangkat wajib diisi"),
    tanggalKembali: z.string().min(1, "Tanggal kembali wajib diisi"),
    lamaPerjalanan: z.coerce.number().min(1, "Lama perjalanan minimal 1 hari"),
    instansi: z
      .string()
      .min(3, "Instansi pembebanan anggaran wajib diisi")
      .default(DEFAULT_INSTANSI),
    dipaId: z.string().min(1, "Akun DIPA wajib dipilih"),
    penandatanganId: z.string().min(1, "Pejabat penandatangan wajib dipilih"),
    jumlahKolomHalaman2: z.coerce
      .number()
      .int()
      .min(1, "Minimal terdapat Romawi I")
      .default(6),
    tandaTanganHalaman2: z
      .array(sppdTandaTanganHalaman2Schema)
      .default([]),
    status: z.enum(SPPD_STATUS_OPTIONS).default("Draft"),
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

export type Sppd = z.infer<typeof sppdSchema>;
export type SppdFormValues = z.input<typeof sppdSchema>;
