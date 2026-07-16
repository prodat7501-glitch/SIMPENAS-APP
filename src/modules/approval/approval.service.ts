import { sptService } from "@/modules/spt/spt.service";
import type { Spt } from "@/modules/spt/spt.schema";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import { penandatanganService } from "@/modules/penandatangan/penandatangan.service";
import {
  approvalDecisionSchema,
  type ApprovalDecision,
  type ApprovalHistory,
} from "./approval.schema";

const HISTORY_KEY = "simpenas_approval_history";
export type ApprovalItem =
  | (NotaDinas & { documentType: "Nota Dinas" })
  | (Spt & { documentType: "SPT" });

type LegacyApprovalHistory = ApprovalHistory & {
  sptId?: string;
  nomorSpt?: string;
};

const normalizeHistory = (item: LegacyApprovalHistory): ApprovalHistory => ({
  id: item.id,
  documentId: item.documentId ?? item.sptId ?? "",
  documentType: item.documentType ?? "SPT",
  nomorDokumen: item.nomorDokumen ?? item.nomorSpt ?? "-",
  tanggal: item.tanggal,
  approver: item.approver,
  status: item.status,
  catatan: item.catatan,
});

const getHistory = (): ApprovalHistory[] =>
  typeof window === "undefined"
    ? []
    : (JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as
        LegacyApprovalHistory[]).map(normalizeHistory);
const saveHistory = (items: ApprovalHistory[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

const normalizeText = (value: string) => value.toLowerCase();
const getSignerText = (penandatanganId: string) => {
  const signer = penandatanganService
    .getAll()
    .find((item) => item.id === penandatanganId);
  return signer
    ? normalizeText(`${signer.jabatanPenandatangan} ${signer.peran}`)
    : "";
};
const isSekretarisSigner = (penandatanganId: string) => {
  const text = getSignerText(penandatanganId);
  return (
    text.includes("sekretaris") ||
    text.includes("plt sekretaris") ||
    text.includes("plh sekretaris")
  );
};
const isKetuaKpuSigner = (penandatanganId: string) =>
  getSignerText(penandatanganId).includes("ketua kpu");
export const approvalService = {
  listPending: async (): Promise<ApprovalItem[]> => [
    ...notaDinasService
      .getAll()
      .filter((item) => item.status === "Menunggu Approval")
      .map((item) => ({ ...item, documentType: "Nota Dinas" as const })),
    ...sptService
      .getAll()
      .filter((item) => item.status === "Menunggu Approval")
      .map((item) => ({ ...item, documentType: "SPT" as const })),
  ],
  listHistory: async (): Promise<ApprovalHistory[]> => getHistory(),
  decide: async (input: ApprovalDecision): Promise<ApprovalHistory> => {
    const data = approvalDecisionSchema.parse(input);
    const isNotaDinas = data.documentType === "Nota Dinas";
    const items = isNotaDinas ? notaDinasService.getAll() : sptService.getAll();
    const target = items.find((item) => item.id === data.documentId);
    if (!target)
      throw new Error(`${data.documentType} tidak ditemukan.`);
    if (target.status !== "Menunggu Approval")
      throw new Error(`${data.documentType} tidak lagi menunggu approval.`);
    if (
      !isNotaDinas &&
      !isSekretarisSigner(target.penandatanganId) &&
      !isKetuaKpuSigner(target.penandatanganId)
    ) {
      throw new Error(
        "Approval SPT hanya dapat diproses untuk dokumen dengan penandatangan Sekretaris/PLT/PLH Sekretaris atau Ketua KPU.",
      );
    }
    const updatedItems = items.map((item) =>
      item.id === data.documentId ? { ...item, status: data.decision } : item,
    );
    if (isNotaDinas) {
      notaDinasService.saveAll(updatedItems as NotaDinas[]);
    } else {
      sptService.saveAll(updatedItems as Spt[]);
    }
    const history: ApprovalHistory = {
      id: `approval-${Date.now()}`,
      documentId: data.documentId,
      documentType: data.documentType,
      nomorDokumen: target.nomor,
      tanggal: new Date().toISOString(),
      approver: data.approver,
      status: data.decision,
      catatan: data.catatan.trim(),
    };
    saveHistory([history, ...getHistory()]);
    return history;
  },
};
