import { z } from "zod";

export const documentTypes = [
  "Nota Dinas",
  "SPT",
  "SPPD",
  "SPBY",
  "Daftar Nominatif",
  "Tanda Terima",
  "Kuitansi",
] as const;
export type DocumentType = (typeof documentTypes)[number];
export const numberStatuses = ["Terpakai", "Booking", "Dibatalkan"] as const;
export type NumberStatus = (typeof numberStatuses)[number];

export const penomoranSchema = z.object({
  documentType: z.enum(documentTypes),
  format: z
    .string()
    .min(5, "Format wajib diisi")
    .refine((v) => v.includes("{RUNNING}"), "Format wajib memiliki {RUNNING}")
    .refine((v) => v.includes("{YEAR}"), "Format wajib memiliki {YEAR}"),
  prefix: z.string().max(60),
  suffix: z.string().max(60),
  year: z.number().int().min(2020).max(2100),
  runningNumber: z
    .number()
    .int()
    .min(1, "Nomor berikutnya minimal 1")
    .max(999999),
  padding: z.number().int().min(1).max(8),
});

export type NumberingConfig = z.infer<typeof penomoranSchema>;
export interface NumberHistory {
  id: string;
  documentType: DocumentType;
  number: string;
  sequence: number;
  year: number;
  createdAt: string;
  status?: NumberStatus;
  note?: string;
  bookedFor?: string;
  updatedAt?: string;
}
