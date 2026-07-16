"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DIPA, dipaSchema } from "../dipa.schema";

interface DIPAFormProps {
  initialValues?: DIPA | null;
  onSubmit: (data: Omit<DIPA, "id">) => void;
  onCancel: () => void;
}

export function DIPAForm({ initialValues, onSubmit, onCancel }: DIPAFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<DIPA, "id">>({
    resolver: zodResolver(dipaSchema),
    defaultValues: {
      kodeDipa: "",
      program: "",
      pagu: 0,
      realisasi: 0,
      tahunAnggaran: new Date().getFullYear().toString(),
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("kodeDipa", initialValues.kodeDipa);
      setValue("program", initialValues.program);
      setValue("pagu", initialValues.pagu);
      setValue("realisasi", initialValues.realisasi);
      setValue("tahunAnggaran", initialValues.tahunAnggaran);
    }
  }, [initialValues, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          ...data,
          pagu: Number(data.pagu),
          realisasi: Number(data.realisasi),
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Kode DIPA
        </label>
        <Input
          placeholder="Contoh: 015.01.2.654321"
          {...register("kodeDipa")}
          error={!!errors.kodeDipa}
          disabled={!!initialValues}
        />
        {errors.kodeDipa && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.kodeDipa.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Nama Program / Kegiatan
        </label>
        <Input
          placeholder="Contoh: Penyelenggaraan Pemilu Serentak"
          {...register("program")}
          error={!!errors.program}
        />
        {errors.program && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.program.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Pagu Anggaran (Rp)
          </label>
          <Input
            type="number"
            placeholder="Pagu"
            {...register("pagu", { valueAsNumber: true })}
            error={!!errors.pagu}
          />
          {errors.pagu && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.pagu.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Realisasi (Rp)
          </label>
          <Input
            type="number"
            placeholder="Realisasi"
            {...register("realisasi", { valueAsNumber: true })}
            error={!!errors.realisasi}
          />
          {errors.realisasi && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.realisasi.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Tahun Anggaran
        </label>
        <Input
          placeholder="Contoh: 2026"
          {...register("tahunAnggaran")}
          error={!!errors.tahunAnggaran}
        />
        {errors.tahunAnggaran && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.tahunAnggaran.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {initialValues ? "Simpan Perubahan" : "Tambah Anggaran"}
        </Button>
      </div>
    </form>
  );
}
