"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityStore } from "@/stores/activity.store";
import { useNotificationStore } from "@/stores/notification.store";
import { approvalService } from "./approval.service";
import type { ApprovalDecision } from "./approval.schema";
import { useApprovalStore } from "./approval.store";
import type { UserRole } from "@/stores/auth.store";
import { useAuth } from "@/hooks/useAuth";

const KEY = ["approval"] as const;
export function useApproval() {
  const queryClient = useQueryClient();
  const store = useApprovalStore();
  const { user } = useAuth();
  const pending = useQuery({
    queryKey: [...KEY, "pending", user?.pegawaiId, user?.role],
    queryFn: () => approvalService.listPending(user!),
    enabled: Boolean(user),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const history = useQuery({
    queryKey: [...KEY, "history"],
    queryFn: () => approvalService.listHistory(),
  });
  const decision = useMutation({
    mutationFn: (input: ApprovalDecision) => {
      if (!user) throw new Error("Sesi pengguna tidak ditemukan.");
      return approvalService.decide(input, user);
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      useNotificationStore
        .getState()
        .addNotification(
          `${item.documentType} ${item.status}`,
          item.status === "Perlu Revisi"
            ? `${item.nomorDokumen} perlu direvisi. Catatan: ${item.catatan}`
            : `${item.nomorDokumen} telah disetujui.`,
          item.status === "Disetujui" ? "success" : "warning",
          {
            recipientPegawaiId: item.recipientPegawaiId,
            eventKey: `approval:${item.documentType}:${item.documentId}:${item.status}`,
            actionUrl: item.documentType === "SPT" ? "/spt" : "/nota-dinas",
          },
        );
      useActivityStore.getState().add({
        action: "Approval",
        module: item.documentType,
        description: `${item.nomorDokumen}: ${item.status}`,
        user: item.approver,
      });
    },
  });
  const historyDeletion = useMutation({
    mutationFn: (input: { role: UserRole; user: string }) =>
      approvalService.clearHistory(input.role),
    onSuccess: (total, input) => {
      queryClient.invalidateQueries({ queryKey: [...KEY, "history"] });
      useActivityStore.getState().add({
        action: "Delete",
        module: "Approval",
        description: `Membersihkan ${total} riwayat keputusan approval`,
        user: input.user,
      });
    },
  });
  const search = store.search.toLowerCase().trim();
  const pendingItems = (pending.data ?? []).filter(
    (item) =>
      !search ||
      item.nomor.toLowerCase().includes(search) ||
      item.documentType.toLowerCase().includes(search) ||
      (item.documentType === "SPT"
        ? item.untuk.some((x) => x.text.toLowerCase().includes(search))
        : item.perihal.toLowerCase().includes(search)),
  );
  return {
    ...store,
    pendingItems,
    history: history.data ?? [],
    isLoading: pending.isLoading || history.isLoading,
    isSaving: decision.isPending || historyDeletion.isPending,
    error: pending.error ?? history.error,
    decide: (input: ApprovalDecision) => decision.mutateAsync(input),
    clearHistory: (input: { role: UserRole; user: string }) =>
      historyDeletion.mutateAsync(input),
  };
}
