import { sptService } from "@/modules/spt/spt.service";
import type { Spt } from "@/modules/spt/spt.schema";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import {
  approvalDecisionSchema,
  type ApprovalDecision,
  type ApprovalHistory,
} from "./approval.schema";
import type { UserRole, UserSession } from "@/stores/auth.store";
import {
  canUserApproveDocument,
  getNotaDinasCreatorPegawaiId,
} from "./approval-access";
import { apiClient, withApiFallback } from "@/services/api";

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
  recipientPegawaiId: item.recipientPegawaiId,
});

const getHistory = (): ApprovalHistory[] =>
  typeof window === "undefined"
    ? []
    : (
        JSON.parse(
          localStorage.getItem(HISTORY_KEY) ?? "[]",
        ) as LegacyApprovalHistory[]
      ).map(normalizeHistory);
const saveHistory = (items: ApprovalHistory[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

export const approvalService = {
  listPending: async (user: UserSession): Promise<ApprovalItem[]> => {
    const notas = notaDinasService.getAll();
    const pending: ApprovalItem[] = [
      ...notas
        .filter((item) => item.status === "Menunggu Approval")
        .map((item) => ({ ...item, documentType: "Nota Dinas" as const })),
      ...sptService
        .getAll()
        .filter((item) => item.status === "Menunggu Approval")
        .map((item) => ({ ...item, documentType: "SPT" as const })),
    ];
    return pending.filter((item) => canUserApproveDocument(user, item, notas));
  },
  listHistory: async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }): Promise<ApprovalHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<ApprovalHistory[] | { data?: ApprovalHistory[]; items?: ApprovalHistory[] }>("/api/v1/approval-history", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return list.map(normalizeHistory);
      },
      () => getHistory()
    );
  },
  clearHistory: async (role: UserRole): Promise<number> => {
    if (role !== "Administrator") {
      throw new Error(
        "Hanya Administrator yang dapat membersihkan riwayat approval.",
      );
    }
    const total = getHistory().length;
    saveHistory([]);
    return total;
  },
  decide: async (
    input: ApprovalDecision,
    user: UserSession,
  ): Promise<ApprovalHistory> => {
    const data = approvalDecisionSchema.parse(input);
    const isNotaDinas = data.documentType === "Nota Dinas";
    const items = isNotaDinas ? notaDinasService.getAll() : sptService.getAll();
    const target = items.find((item) => item.id === data.documentId);
    if (!target) throw new Error(`${data.documentType} tidak ditemukan.`);
    if (target.status !== "Menunggu Approval")
      throw new Error(`${data.documentType} tidak lagi menunggu approval.`);
    const notas = notaDinasService.getAll();
    const approvalItem = {
      ...target,
      documentType: data.documentType,
    } as ApprovalItem;
    if (!canUserApproveDocument(user, approvalItem, notas)) {
      throw new Error(
        data.documentType === "SPT"
          ? "Anda bukan Sekretaris/Ketua yang berwenang atau Kasubbag pembuat/penandatangan Nota Dinas sumber SPT ini."
          : "Approval Nota Dinas hanya dapat dilakukan Sekretaris/PLH/PLT Sekretaris yang sedang berlaku.",
      );
    }
    const catatanRevisi =
      data.decision === "Perlu Revisi" ? data.catatan.trim() : "";
    const updatedItems = items.map((item) =>
      item.id === data.documentId
        ? { ...item, status: data.decision, catatanRevisi }
        : item,
    );
    if (isNotaDinas) {
      notaDinasService.saveAll(updatedItems as NotaDinas[]);
    } else {
      sptService.saveAll(updatedItems as Spt[]);
    }
    const recipientPegawaiId = isNotaDinas
      ? getNotaDinasCreatorPegawaiId(target as NotaDinas)
      : (target as Spt).createdByPegawaiId ||
        (target as Spt).personil[0]?.pegawaiId;
    const history: ApprovalHistory = {
      id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      documentId: data.documentId,
      documentType: data.documentType,
      nomorDokumen: target.nomor,
      tanggal: new Date().toISOString(),
      approver: data.approver,
      status: data.decision,
      catatan: data.catatan.trim(),
      recipientPegawaiId,
    };

    return withApiFallback(
      async () => {
        const res = await apiClient.post<ApprovalHistory | { data?: ApprovalHistory }>("/api/v1/approval-history", history);
        const unwrapped = (res as { data?: ApprovalHistory }).data || (res as ApprovalHistory);
        return normalizeHistory(unwrapped);
      },
      async () => {
        saveHistory([history, ...getHistory()]);
        return history;
      }
    );
  },
  apiBulkCreate: async (data: Partial<ApprovalHistory>[]): Promise<ApprovalHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<ApprovalHistory[] | { data?: ApprovalHistory[] }>("/api/v1/approval-history", data);
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map(normalizeHistory);
      },
      async () => {
        const normalized = data.map((d) => normalizeHistory(d as ApprovalHistory));
        saveHistory([...normalized, ...getHistory()]);
        return normalized;
      }
    );
  },
};

