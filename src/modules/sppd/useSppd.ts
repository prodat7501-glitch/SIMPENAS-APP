"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { Sppd } from "./sppd.schema";
import { sppdService } from "./sppd.service";
import { SPPD_QUERY_KEY } from "./sppd.constants";
import type { SppdMutationPayload } from "./sppd.types";
import { useSppdStore } from "./sppd.store";
import { useActivityStore } from "@/stores/activity.store";

export function useSppd() {
  const queryClient = useQueryClient();
  const selectedItem = useSppdStore((state) => state.selectedItem);
  const previewItem = useSppdStore((state) => state.previewItem);
  const filters = useSppdStore((state) => state.filters);
  const setSelectedItem = useSppdStore((state) => state.setSelectedItem);
  const setPreviewItem = useSppdStore((state) => state.setPreviewItem);
  const setSearch = useSppdStore((state) => state.setSearch);
  const setStatus = useSppdStore((state) => state.setStatus);
  const log = useActivityStore((state) => state.add);

  const listQuery = useQuery({
    queryKey: SPPD_QUERY_KEY,
    queryFn: sppdService.list,
  });

  const createMutation = useMutation({
    mutationFn: (payload: SppdMutationPayload) => sppdService.create(payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: SPPD_QUERY_KEY });
      log({
        action: "Create",
        module: "SPPD",
        description: `Membuat SPPD ${item.nomor}`,
        user: "Pengguna aktif",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: SppdMutationPayload;
    }) => sppdService.update(id, payload),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: SPPD_QUERY_KEY });
      log({
        action: "Update",
        module: "SPPD",
        description: `Memperbarui SPPD ${item.nomor}`,
        user: "Pengguna aktif",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sppdService.remove(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: SPPD_QUERY_KEY });
      log({
        action: "Delete",
        module: "SPPD",
        description: `Menghapus SPPD ${id}`,
        user: "Pengguna aktif",
      });
    },
  });

  const items = listQuery.data ?? [];
  const filteredItems = items.filter((item) => {
    const search = filters.search.trim().toLowerCase();
    const matchesSearch =
      !search ||
      item.nomor.toLowerCase().includes(search) ||
      item.maksud.toLowerCase().includes(search) ||
      item.tempatTujuan.toLowerCase().includes(search);
    const matchesStatus =
      filters.status === "Semua" || item.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  const save = async (
    payload: SppdMutationPayload,
    editingItem?: Sppd | null,
  ) => {
    if (editingItem?.id) {
      return updateMutation.mutateAsync({ id: editingItem.id, payload });
    }

    return createMutation.mutateAsync(payload);
  };

  return {
    items,
    filteredItems,
    selectedItem,
    previewItem,
    filters,
    isLoading: listQuery.isLoading,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    error: listQuery.error,
    setSelectedItem,
    setPreviewItem,
    setSearch,
    setStatus,
    save,
    remove: deleteMutation.mutateAsync,
  };
}
