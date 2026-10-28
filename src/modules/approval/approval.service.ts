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

const normalizeHistory = (raw: unknown): ApprovalHistory => {
  const item =
    (typeof raw === "object" && raw !== null
      ? raw
      : {}) as Record<string, unknown>;

  const id = String(item.id || `apprv-${Date.now()}`);
  const documentId = String(
    item.documentId || item.document_id || item.sptId || "",
  );
  const docTypeRaw = String(
    item.documentType || item.document_type || "Nota Dinas",
  );
  const documentType: "Nota Dinas" | "SPT" = docTypeRaw
    .toLowerCase()
    .includes("spt")
    ? "SPT"
    : "Nota Dinas";

  // Ambil atau pulihkan nomor dokumen
  let nomorDokumen = String(
    item.nomorDokumen || item.nomor_dokumen || item.nomorSpt || item.nomor || "",
  ).trim();

  if (!nomorDokumen || nomorDokumen === "-") {
    if (documentId) {
      if (documentType === "Nota Dinas") {
        const nd = notaDinasService.getAll().find((n) => n.id === documentId);
        if (nd && nd.nomor && nd.nomor !== "-") {
          nomorDokumen = nd.nomor;
        } else if (nd && nd.perihal) {
          nomorDokumen = `(${nd.perihal})`;
        }
      } else {
        const spt = sptService.getAll().find((s) => s.id === documentId);
        if (spt && spt.nomor && spt.nomor !== "-") {
          nomorDokumen = spt.nomor;
        }
      }
    } else {
      // Jika documentId pada baris historis kosong, cari Nota Dinas terakhir yang berstatus Disetujui
      const approvedNota = notaDinasService
        .getAll()
        .find((n) => n.status === "Disetujui");
      if (approvedNota && approvedNota.nomor && approvedNota.nomor !== "-") {
        nomorDokumen = approvedNota.nomor;
      }
    }
  }
  if (!nomorDokumen) nomorDokumen = "-";

  // Ambil atau pulihkan status keputusan
  const rawStatus = String(
    item.status || item.to_status || item.action || "Disetujui",
  ).trim();
  const status: "Disetujui" | "Perlu Revisi" =
    rawStatus.toLowerCase().includes("revisi") ||
    rawStatus.toLowerCase().includes("tolak")
      ? "Perlu Revisi"
      : "Disetujui";

  // Ambil atau pulihkan tanggal keputusan
  let tanggal = String(
    item.tanggal || item.created_at || item.createdAt || "",
  ).trim();
  if (!tanggal || isNaN(new Date(tanggal).getTime())) {
    tanggal = new Date().toISOString();
  }

  // Ambil atau pulihkan approver
  let approver = String(
    item.approver || item.user_name || item.userName || "",
  ).trim();
  if (!approver || approver === "undefined") {
    approver = "Sekretaris KPU";
  }

  const catatan = String(item.catatan || item.note || "").trim();
  const recipientPegawaiId = item.recipientPegawaiId
    ? String(item.recipientPegawaiId)
    : item.recipient_pegawai_id
    ? String(item.recipient_pegawai_id)
    : undefined;

  return {
    id,
    documentId,
    documentType,
    nomorDokumen,
    tanggal,
    approver,
    status,
    catatan,
    recipientPegawaiId,
  };
};

const getHistory = (): ApprovalHistory[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    return (Array.isArray(raw) ? raw : []).map(normalizeHistory);
  } catch {
    return [];
  }
};

const saveHistory = (items: ApprovalHistory[]) => {
  if (typeof window !== "undefined") {
    const normalized = items.map(normalizeHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(normalized));
  }
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

  listHistory: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApprovalHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<
          ApprovalHistory[] | { data?: ApprovalHistory[]; items?: ApprovalHistory[] }
        >("/api/v1/approval-history", params);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const normalized = list.map(normalizeHistory);
        if (normalized.length > 0) {
          saveHistory(normalized);
        }
        return normalized;
      },
      () => getHistory(),
    );
  },

  clearHistory: async (role: UserRole): Promise<number> => {
    if (role !== "Administrator" && role !== "Supervisor") {
      throw new Error(
        "Hanya Administrator atau Supervisor yang dapat membersihkan riwayat approval.",
      );
    }
    const current = getHistory();
    const total = current.length;
    try {
      await Promise.allSettled(
        current.map((i) =>
          apiClient.delete(`/api/v1/approval-history/${i.id}`),
        ),
      );
    } catch (e) {
      console.warn("Gagal menghapus riwayat approval di cloud:", e);
    }
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
      try {
        await notaDinasService.apiUpdate(data.documentId, {
          status: data.decision,
          catatanRevisi,
        });
      } catch (e) {
        console.warn("Gagal update status nota dinas ke cloud:", e);
      }
    } else {
      sptService.saveAll(updatedItems as Spt[]);
      try {
        await sptService.apiUpdate(data.documentId, {
          status: data.decision,
        });
      } catch (e) {
        console.warn("Gagal update status spt ke cloud:", e);
      }
    }
    const recipientPegawaiId = isNotaDinas
      ? getNotaDinasCreatorPegawaiId(target as NotaDinas)
      : (target as Spt).createdByPegawaiId ||
        (target as Spt).personil[0]?.pegawaiId;

    const history: ApprovalHistory = {
      id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      documentId: data.documentId,
      documentType: data.documentType,
      nomorDokumen: target.nomor || "-",
      tanggal: new Date().toISOString(),
      approver: data.approver,
      status: data.decision,
      catatan: data.catatan.trim(),
      recipientPegawaiId,
    };

    const payload = {
      ...history,
      document_id: history.documentId,
      document_type: history.documentType,
      nomor_dokumen: history.nomorDokumen,
      status: history.status,
      to_status: history.status,
      action: history.status,
      catatan: history.catatan,
      note: history.catatan,
      approver: history.approver,
      user_name: history.approver,
      recipient_pegawai_id: history.recipientPegawaiId,
      tanggal: history.tanggal,
      created_at: history.tanggal,
    };

    return withApiFallback(
      async () => {
        const res = await apiClient.post<
          ApprovalHistory | { data?: ApprovalHistory }
        >("/api/v1/approval-history", payload);
        const unwrapped =
          (res as { data?: ApprovalHistory }).data || (res as ApprovalHistory);
        const normalized = normalizeHistory(unwrapped);
        saveHistory([
          normalized,
          ...getHistory().filter((h) => h.id !== normalized.id),
        ]);
        return normalized;
      },
      async () => {
        saveHistory([
          history,
          ...getHistory().filter((h) => h.id !== history.id),
        ]);
        return history;
      },
    );
  },

  apiBulkCreate: async (
    data: Partial<ApprovalHistory>[],
  ): Promise<ApprovalHistory[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<
          ApprovalHistory[] | { data?: ApprovalHistory[] }
        >("/api/v1/approval-history", data);
        const list = Array.isArray(res) ? res : res.data || [];
        const normalized = list.map(normalizeHistory);
        saveHistory(normalized);
        return normalized;
      },
      async () => {
        const normalized = data.map((d) =>
          normalizeHistory(d as ApprovalHistory),
        );
        saveHistory([...normalized, ...getHistory()]);
        return normalized;
      },
    );
  },
};

