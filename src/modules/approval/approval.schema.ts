import { z } from "zod";

export const approvalDecisionSchema = z
  .object({
    documentId: z.string().min(1),
    documentType: z.enum(["Nota Dinas", "SPT"]),
    decision: z.enum(["Disetujui", "Perlu Revisi"]),
    catatan: z.string(),
    approver: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.decision === "Perlu Revisi" && data.catatan.trim().length < 3) {
      ctx.addIssue({
        code: "custom",
        path: ["catatan"],
        message: "Catatan revisi minimal 3 karakter",
      });
    }
  });

export const approvalHistorySchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentType: z.enum(["Nota Dinas", "SPT"]),
  nomorDokumen: z.string(),
  tanggal: z.string(),
  approver: z.string(),
  status: z.enum(["Disetujui", "Perlu Revisi"]),
  catatan: z.string(),
  recipientPegawaiId: z.string().optional(),
});

export type ApprovalDecision = z.infer<typeof approvalDecisionSchema>;
export type ApprovalHistory = z.infer<typeof approvalHistorySchema>;
