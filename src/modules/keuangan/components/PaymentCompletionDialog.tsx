"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatRupiah } from "@/lib/formatters";
import { PAYMENT_METHOD_OPTIONS } from "../keuangan.constants";
import {
  paymentCompletionInputSchema,
  type DokumenKeuangan,
  type PaymentCompletionInput,
} from "../keuangan.schema";

interface PaymentCompletionDialogProps {
  document: DokumenKeuangan | null;
  recipientName: string;
  officerName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentCompletionInput) => Promise<void>;
}

const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function PaymentCompletionDialog({
  document,
  recipientName,
  officerName,
  isSubmitting,
  onClose,
  onSubmit,
}: PaymentCompletionDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PaymentCompletionInput>({
    resolver: zodResolver(paymentCompletionInputSchema),
    defaultValues: {
      tanggalPembayaran: getLocalDate(),
      metodePembayaran: "Transfer",
      referensiPembayaran: "",
      petugasPembayaran: officerName,
    },
  });

  useEffect(() => {
    if (!document) return;
    reset({
      tanggalPembayaran: getLocalDate(),
      metodePembayaran: "Transfer",
      referensiPembayaran: "",
      petugasPembayaran: officerName,
    });
  }, [document, officerName, reset]);

  return (
    <Dialog
      isOpen={!!document}
      onClose={onClose}
      title="Konfirmasi Penyelesaian Pembayaran"
    >
      {document && (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-xl border border-border bg-muted/40 p-3 text-foreground">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="font-semibold">Kuitansi</dt>
              <dd>{document.nomor}</dd>
              <dt className="font-semibold">Penerima</dt>
              <dd>{recipientName}</dd>
              <dt className="font-semibold">Nominal</dt>
              <dd className="font-bold">{formatRupiah(document.total)}</dd>
            </dl>
          </div>

          <label className="block space-y-1">
            <span className="font-bold text-foreground">
              Tanggal Pembayaran
            </span>
            <Input
              type="date"
              error={!!errors.tanggalPembayaran}
              {...register("tanggalPembayaran")}
            />
            {errors.tanggalPembayaran && (
              <span className="text-danger">
                {errors.tanggalPembayaran.message}
              </span>
            )}
          </label>

          <label className="block space-y-1">
            <span className="font-bold text-foreground">Metode Pembayaran</span>
            <Select
              error={!!errors.metodePembayaran}
              {...register("metodePembayaran")}
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>

          <label className="block space-y-1">
            <span className="font-bold text-foreground">
              Referensi Pembayaran (Opsional)
            </span>
            <Input
              placeholder="Nomor transaksi, bukti transfer, atau keterangan"
              error={!!errors.referensiPembayaran}
              {...register("referensiPembayaran")}
            />
            {errors.referensiPembayaran && (
              <span className="text-danger">
                {errors.referensiPembayaran.message}
              </span>
            )}
          </label>

          <label className="block space-y-1">
            <span className="font-bold text-foreground">Petugas Keuangan</span>
            <Input readOnly {...register("petugasPembayaran")} />
          </label>

          <p className="text-muted-foreground">
            Konfirmasi ini menjadi patokan final bahwa dana telah dibayarkan
            kepada penerima.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Tandai Pembayaran Selesai"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
