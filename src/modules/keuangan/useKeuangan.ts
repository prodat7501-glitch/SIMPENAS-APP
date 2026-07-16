"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import { KEUANGAN_QUERY_KEY } from "./keuangan.constants";
import type { JenisDokumen, Spj } from "./keuangan.schema";
import { keuanganService } from "./keuangan.service";
import { useKeuanganStore } from "./keuangan.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useActivityStore } from "@/stores/activity.store";

export function useKeuangan(
  reports: Laporan[],
  context?: {
    sppds: Sppd[];
    spts: Spt[];
    notas: NotaDinas[];
    dipas: DIPA[];
  },
) {
  const queryClient = useQueryClient();
  const store = useKeuanganStore();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: KEUANGAN_QUERY_KEY });
  const query = useQuery({
    queryKey: [
      ...KEUANGAN_QUERY_KEY,
      reports.map((x) => `${x.id}:${x.status}`).join("|"),
    ],
    queryFn: () => keuanganService.list(reports),
  });
  const validation = useMutation({
    mutationFn: (x: {
      id: string;
      checklist: Spj["checklist"];
      catatan: string;
      action: "mulai" | "revisi" | "selesai";
    }) => keuanganService.validate(x.id, x.checklist, x.catatan, x.action),
    onSuccess: (item) => {
      invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          "Validasi SPJ",
          `Status SPJ: ${item.status}`,
          item.status === "Validasi SPJ Selesai" ? "success" : "warning",
        );
      useActivityStore
        .getState()
        .add({
          action: "Approval",
          module: "Validasi SPJ",
          description: item.status,
          user: "Sub Bagian Keuangan",
        });
    },
  });
  const generation = useMutation({
    mutationFn: (x: { id: string; jenis: JenisDokumen }) => {
      if (!context) {
        throw new Error("Referensi dokumen keuangan belum tersedia.");
      }
      return keuanganService.generate(x.id, x.jenis, {
        reports,
        ...context,
      });
    },
    onSuccess: (item) => {
      invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          "Dokumen Siap Dicetak",
          `${item.jenis} ${item.nomor} berhasil dibuat.`,
          "success",
        );
      useActivityStore
        .getState()
        .add({
          action: "Generate",
          module: item.jenis,
          description: `Generate ${item.nomor}`,
          user: "Sub Bagian Keuangan",
      });
    },
  });
  const regeneration = useMutation({
    mutationFn: (x: { id: string; jenis: JenisDokumen }) => {
      if (!context) {
        throw new Error("Referensi dokumen keuangan belum tersedia.");
      }
      return keuanganService.regenerate(x.id, x.jenis, {
        reports,
        ...context,
      });
    },
    onSuccess: (items, input) => {
      invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          "Dokumen Diperbarui",
          `${input.jenis} berhasil dibuat ulang dan menimpa dokumen lama.`,
          "success",
        );
      useActivityStore
        .getState()
        .add({
          action: "Update",
          module: input.jenis,
          description: `Buat ulang ${items.length} dokumen ${input.jenis}`,
          user: "Sub Bagian Keuangan",
        });
    },
  });
  return {
    ...store,
    items: query.data ?? [],
    isLoading: query.isLoading,
    isBusy:
      validation.isPending || generation.isPending || regeneration.isPending,
    error: query.error,
    validate: validation.mutateAsync,
    generate: generation.mutateAsync,
    regenerate: regeneration.mutateAsync,
  };
}
