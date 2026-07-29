"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LAPORAN_QUERY_KEY } from "./laporan.constants";
import type { Laporan } from "./laporan.schema";
import { laporanService } from "./laporan.service";
import { useLaporanStore } from "./laporan.store";
import type { LaporanPayload, LaporanStatus } from "./laporan.types";
import { useNotificationStore } from "@/stores/notification.store";
import { useActivityStore } from "@/stores/activity.store";

export function useLaporan() {
  const queryClient = useQueryClient();
  const store = useLaporanStore();
  const query = useQuery({
    queryKey: LAPORAN_QUERY_KEY,
    queryFn: laporanService.list,
  });
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: LAPORAN_QUERY_KEY });
  const createMutation = useMutation({
    mutationFn: laporanService.create,
    onSuccess: async (item) => {
      queryClient.setQueryData<Laporan[]>(LAPORAN_QUERY_KEY, (current = []) => [
        ...current,
        item,
      ]);
      await invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          "Laporan Dibuat",
          "Laporan perjalanan berhasil dibuat.",
          "success",
        );
      useActivityStore
        .getState()
        .add({
          action: "Create",
          module: "Laporan",
          description: `Membuat laporan ${item.id}`,
          user: "Pengguna aktif",
        });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: LaporanPayload }) =>
      laporanService.update(id, payload),
    onSuccess: async (item) => {
      queryClient.setQueryData<Laporan[]>(LAPORAN_QUERY_KEY, (current = []) =>
        current.map((entry) => (entry.id === item.id ? item : entry)),
      );
      await invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          item.status === "Menunggu Verifikasi"
            ? "Menunggu Verifikasi"
            : "Laporan Diperbarui",
          `Status laporan: ${item.status}`,
          "info",
        );
      useActivityStore
        .getState()
        .add({
          action: "Update",
          module: "Laporan",
          description: `Memperbarui laporan ${item.id}`,
          user: "Pengguna aktif",
        });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: laporanService.remove,
    onSuccess: async (_, id) => {
      queryClient.setQueryData<Laporan[]>(LAPORAN_QUERY_KEY, (current = []) =>
        current.filter((entry) => entry.id !== id),
      );
      await invalidate();
      useActivityStore
        .getState()
        .add({
          action: "Delete",
          module: "Laporan",
          description: `Menghapus laporan ${id}`,
          user: "Pengguna aktif",
        });
    },
  });
  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      status,
      catatan,
    }: {
      id: string;
      status: Extract<LaporanStatus, "Perlu Revisi" | "Terverifikasi">;
      catatan: string;
    }) => laporanService.verify(id, status, catatan),
    onSuccess: async (item) => {
      queryClient.setQueryData<Laporan[]>(LAPORAN_QUERY_KEY, (current = []) =>
        current.map((entry) => (entry.id === item.id ? item : entry)),
      );
      await invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          item.status,
          `Laporan perjalanan ${item.status.toLowerCase()}.`,
          item.status === "Terverifikasi" ? "success" : "warning",
        );
      useActivityStore
        .getState()
        .add({
          action: "Approval",
          module: "Laporan",
          description: `Status menjadi ${item.status}`,
          user: "Supervisor",
        });
    },
  });
  const items = query.data ?? [];
  const filteredItems = items.filter((item) => {
    const q = store.filters.search.toLowerCase().trim();
    return (
      (!q ||
        item.dasarPelaksanaan.toLowerCase().includes(q) ||
        item.tujuan.toLowerCase().includes(q)) &&
      (store.filters.status === "Semua" || item.status === store.filters.status)
    );
  });
  const save = (payload: LaporanPayload, item?: Laporan | null) =>
    item?.id
      ? updateMutation.mutateAsync({ id: item.id, payload })
      : createMutation.mutateAsync(payload);
  return {
    ...store,
    items,
    filteredItems,
    isLoading: query.isLoading,
    error: query.error,
    isBusy:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending ||
      verifyMutation.isPending,
    save,
    remove: deleteMutation.mutateAsync,
    verify: verifyMutation.mutateAsync,
  };
}
