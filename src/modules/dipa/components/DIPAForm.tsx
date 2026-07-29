"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dipaFormSchema, type DIPA, type DipaFormData } from "../dipa.schema";

interface DIPAFormProps {
  initialValues?: DIPA | null;
  onSubmit: (data: DipaFormData) => void;
  onCancel: () => void;
}

const createDefaultValues = (): DipaFormData => ({
  kodeKro: "",
  klasifikasiRincianOutput: "",
  kodeAkun: "",
  akunPerjalananDinas: "",
  pagu: 0,
  tahunAnggaran: new Date().getFullYear().toString(),
});

const toFormValues = (item: DIPA): DipaFormData => ({
  kodeKro: item.kodeKro,
  klasifikasiRincianOutput: item.klasifikasiRincianOutput,
  kodeAkun: item.kodeAkun,
  akunPerjalananDinas: item.akunPerjalananDinas,
  pagu: item.pagu,
  tahunAnggaran: item.tahunAnggaran,
});

export function DIPAForm({ initialValues, onSubmit, onCancel }: DIPAFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DipaFormData>({
    resolver: zodResolver(dipaFormSchema),
    defaultValues: createDefaultValues(),
  });

  useEffect(() => {
    reset(initialValues ? toFormValues(initialValues) : createDefaultValues());
  }, [initialValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Kode KRO
          </span>
          <Input
            placeholder="Masukkan Kode KRO"
            {...register("kodeKro")}
            error={Boolean(errors.kodeKro)}
          />
          {errors.kodeKro && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.kodeKro.message}
            </span>
          )}
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Klasifikasi Rincian Output (KRO)
          </span>
          <Input
            placeholder="Masukkan Klasifikasi Rincian Output (KRO)"
            {...register("klasifikasiRincianOutput")}
            error={Boolean(errors.klasifikasiRincianOutput)}
          />
          {errors.klasifikasiRincianOutput && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.klasifikasiRincianOutput.message}
            </span>
          )}
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Kode Akun
          </span>
          <Input
            placeholder="Masukkan Kode Akun"
            {...register("kodeAkun")}
            error={Boolean(errors.kodeAkun)}
          />
          {errors.kodeAkun && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.kodeAkun.message}
            </span>
          )}
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Akun Perjalanan Dinas
          </span>
          <Input
            placeholder="Masukkan Akun Perjalanan Dinas"
            {...register("akunPerjalananDinas")}
            error={Boolean(errors.akunPerjalananDinas)}
          />
          {errors.akunPerjalananDinas && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.akunPerjalananDinas.message}
            </span>
          )}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Pagu Anggaran (Rp)
          </span>
          <Input
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="0"
            {...register("pagu", { valueAsNumber: true })}
            error={Boolean(errors.pagu)}
          />
          {errors.pagu && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.pagu.message}
            </span>
          )}
        </label>

        <label className="space-y-2">
          <span className="block text-xs font-bold uppercase text-muted-foreground">
            Tahun Anggaran
          </span>
          <Input
            type="number"
            min={1000}
            max={9999}
            step={1}
            inputMode="numeric"
            placeholder="Contoh: 2026"
            {...register("tahunAnggaran")}
            error={Boolean(errors.tahunAnggaran)}
          />
          {errors.tahunAnggaran && (
            <span className="block text-[10px] font-bold text-danger">
              {errors.tahunAnggaran.message}
            </span>
          )}
        </label>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Menyimpan..."
            : initialValues
              ? "Simpan Perubahan"
              : "Tambah Anggaran"}
        </Button>
      </div>
    </form>
  );
}
