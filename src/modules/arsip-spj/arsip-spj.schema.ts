import { z } from "zod";

export const MAX_ARSIP_SPJ_SIZE_MB = 100;

export const arsipSpjSchema = z.object({
  id: z.string(),
  notaDinasId: z.string().min(1),
  namaFile: z.string().min(1),
  ukuranFile: z.number().positive(),
  tipeFile: z.literal("application/pdf"),
  diunggahPada: z.string(),
  diunggahOleh: z.string().min(1),
});

export type ArsipSpj = z.infer<typeof arsipSpjSchema>;

export interface ArsipSpjRecord extends ArsipSpj {
  file: Blob;
}
