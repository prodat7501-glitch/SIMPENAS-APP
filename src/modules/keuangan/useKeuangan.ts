"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import { KEUANGAN_QUERY_KEY } from "./keuangan.constants";
import type {
  JenisDokumen,
  PaymentCompletionInput,
  Spj,
} from "./keuangan.schema";
import { keuanganService } from "./keuangan.service";
import { useKeuanganStore } from "./keuangan.store";
import { useNotificationStore } from "@/stores/notification.store";
import { useActivityStore } from "@/stores/activity.store";
import { getSpjRevisionEventKey } from "@/modules/tugas-perjalanan/travel-task.service";

export function useKeuangan(
  reports: Laporan[],
  context?: {
    sppds: Sppd[];
    spts: Spt[];
    notas: NotaDinas[];
    dipas: DIPA[];
  },
  sourcesReady = true,
) {
  const queryClient = useQueryClient();
  const store = useKeuanganStore();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: KEUANGAN_QUERY_KEY });
  const query = useQuery({
    queryKey: [
      ...KEUANGAN_QUERY_KEY,
      reports.map((x) => `${x.id}:${x.status}`).join("|"),
      context?.sppds.map((x) => x.id).join("|") ?? "",
      context?.spts.map((x) => x.id).join("|") ?? "",
      context?.notas
        .map(
          (x) =>
            `${x.id}:${x.totalBiaya}:${x.lampiran
              .map((row) => `${row.pegawaiId}:${row.total}`)
              .join(",")}`,
        )
        .join("|") ?? "",
    ],
    queryFn: () => keuanganService.list(reports, context),
    enabled: sourcesReady,
  });
  const validation = useMutation({
    mutationFn: (x: {
      id: string;
      checklist: Spj["checklist"];
      realisasiBiaya: Spj["realisasiBiaya"];
      catatan: string;
      action: "mulai" | "revisi" | "selesai";
    }) =>
      keuanganService.validate(
        x.id,
        x.checklist,
        x.realisasiBiaya,
        x.catatan,
        x.action,
      ),
    onSuccess: (item, input) => {
      invalidate();
      const notificationStore = useNotificationStore.getState();

      if (input.action === "revisi" && context) {
        const report = reports.find((entry) => entry.id === item.laporanId);
        const spt = context.spts.find((entry) => entry.id === report?.sptId);
        const nota = context.notas.find(
          (entry) => entry.id === spt?.notaDinasId,
        );
        const revisionNote = item.catatan.trim();

        new Set(spt?.personil.map((person) => person.pegawaiId) ?? []).forEach(
          (recipientPegawaiId) =>
            notificationStore.upsertNotification({
              eventKey: getSpjRevisionEventKey(item.id, revisionNote),
              recipientPegawaiId,
              title: "SPJ Perlu Dilengkapi",
              message: `${nota?.nomor ?? "Nota Dinas"} · SPT ${spt?.nomor ?? "-"}. Catatan Unit Keuangan: ${revisionNote}`,
              type: "error",
              actionUrl: "/spj",
            }),
        );
      } else {
        notificationStore.addNotification(
          "Validasi SPJ dan Pembayaran",
          `Status SPJ: ${item.status}`,
          item.status === "Validasi Selesai" ? "success" : "warning",
        );
      }
      useActivityStore.getState().add({
        action: "Approval",
        module: "Validasi SPJ dan Pembayaran",
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
      useActivityStore.getState().add({
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
      useActivityStore.getState().add({
        action: "Update",
        module: input.jenis,
        description: `Buat ulang ${items.length} dokumen ${input.jenis}`,
        user: "Sub Bagian Keuangan",
      });
    },
  });
  const paymentCompletion = useMutation({
    mutationFn: (input: {
      documentId: string;
      payment: PaymentCompletionInput;
    }) => keuanganService.completePayment(input.documentId, input.payment),
    onSuccess: (item) => {
      invalidate();
      useNotificationStore
        .getState()
        .addNotification(
          "Pembayaran Selesai",
          `Pembayaran Kuitansi ${item.nomor} sebesar ${new Intl.NumberFormat(
            "id-ID",
            { style: "currency", currency: "IDR", maximumFractionDigits: 0 },
          ).format(item.total)} telah diselesaikan.`,
          "success",
        );
      useActivityStore.getState().add({
        action: "Update",
        module: "Kuitansi",
        description: `Pembayaran ${item.nomor} ditandai selesai`,
        user: item.pembayaran?.petugasPembayaran ?? "Sub Bagian Keuangan",
      });
    },
  });
  const documentDeletion = useMutation({
    mutationFn: (documentId: string) =>
      keuanganService.removeDocument(documentId),
    onSuccess: (item) => {
      invalidate();
      if (store.preview?.id === item.id) store.setPreview(null);
      useActivityStore.getState().add({
        action: "Delete",
        module: item.jenis,
        description: `Menghapus ${item.jenis} ${item.nomor}`,
        user: "Administrator",
      });
    },
  });
  return {
    ...store,
    items: query.data ?? [],
    isLoading: query.isLoading,
    isBusy:
      validation.isPending ||
      generation.isPending ||
      regeneration.isPending ||
      paymentCompletion.isPending ||
      documentDeletion.isPending,
    error: query.error,
    validate: validation.mutateAsync,
    generate: generation.mutateAsync,
    regenerate: regeneration.mutateAsync,
    completePayment: paymentCompletion.mutateAsync,
    removeDocument: documentDeletion.mutateAsync,
  };
}
