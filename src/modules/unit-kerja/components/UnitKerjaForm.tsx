"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UnitKerja, unitKerjaSchema } from "../unit-kerja.schema";

interface UnitKerjaFormProps {
  initialValues?: UnitKerja | null;
  onSubmit: (data: Omit<UnitKerja, "id">) => void;
  onCancel: () => void;
}

export function UnitKerjaForm({
  initialValues,
  onSubmit,
  onCancel,
}: UnitKerjaFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<UnitKerja, "id">>({
    resolver: zodResolver(unitKerjaSchema),
    defaultValues: {
      kode: "",
      nama: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("kode", initialValues.kode);
      setValue("nama", initialValues.nama);
    }
  }, [initialValues, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Kode Unit Kerja
        </label>
        <Input
          placeholder="Contoh: UN006"
          {...register("kode")}
          error={!!errors.kode}
          disabled={!!initialValues}
        />
        {errors.kode && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.kode.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Nama Unit Kerja
        </label>
        <Input
          placeholder="Contoh: Sub Bagian Teknis"
          {...register("nama")}
          error={!!errors.nama}
        />
        {errors.nama && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.nama.message}
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
          {initialValues ? "Simpan Perubahan" : "Tambah Unit Kerja"}
        </Button>
      </div>
    </form>
  );
}
