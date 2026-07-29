import { z } from "zod";
import { arsipSpjSchema } from "@/modules/arsip-spj/arsip-spj.schema";
import { laporanSchema } from "@/modules/laporan/laporan.schema";

export const DEMO_DATA_FORMAT = "SIMPENAS_DEMO_DATA" as const;
export const DEMO_DATA_VERSION = 1 as const;

export const demoDataArchiveSchema = arsipSpjSchema.extend({
  fileBase64: z.string().min(1),
});

export const demoDataPackageSchema = z.object({
  format: z.literal(DEMO_DATA_FORMAT),
  version: z.literal(DEMO_DATA_VERSION),
  exportedAt: z.string().min(1),
  exportedBy: z.string().min(1),
  localStorage: z.record(z.string(), z.string()),
  arsipSpj: z.array(demoDataArchiveSchema),
  laporan: z.array(laporanSchema).optional(),
});

export type DemoDataPackage = z.infer<typeof demoDataPackageSchema>;

export interface DemoDataSummary {
  exportedAt: string;
  exportedBy: string;
  storageEntries: number;
  archiveFiles: number;
  archiveBytes: number;
  reportFiles: number;
}
