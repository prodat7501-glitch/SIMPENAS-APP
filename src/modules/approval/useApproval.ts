"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityStore } from "@/stores/activity.store";
import { useNotificationStore } from "@/stores/notification.store";
import { approvalService } from "./approval.service";
import type { ApprovalDecision } from "./approval.schema";
import { useApprovalStore } from "./approval.store";

const KEY = ["approval"] as const;
export function useApproval() {
  const queryClient = useQueryClient();
  const store = useApprovalStore();
  const pending = useQuery({
    queryKey: [...KEY, "pending"],
    queryFn: approvalService.listPending,
  });
  const history = useQuery({
    queryKey: [...KEY, "history"],
    queryFn: approvalService.listHistory,
  });
  const decision = useMutation({
    mutationFn: approvalService.decide,
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: KEY });
      useNotificationStore
        .getState()
        .addNotification(
          `${item.documentType} ${item.status}`,
          `${item.nomorDokumen} ${item.status.toLowerCase()}.`,
          item.status === "Disetujui" ? "success" : "warning",
        );
      useActivityStore
        .getState()
        .add({
          action: "Approval",
          module: item.documentType,
          description: `${item.nomorDokumen}: ${item.status}`,
          user: item.approver,
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
    isSaving: decision.isPending,
    error: pending.error ?? history.error,
    decide: (input: ApprovalDecision) => decision.mutateAsync(input),
  };
}
