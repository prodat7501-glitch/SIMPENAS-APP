"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pangkat, pangkatSchema } from "../pangkat.schema";

interface PangkatFormProps {
  initialValues?: Pangkat | null;
  onSubmit: (data: Omit<Pangkat, "id">) => void;
  onCancel: () => void;
}

export function PangkatForm({
  initialValues,
  onSubmit,
  onCancel,
}: PangkatFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<Pangkat, "id">>({
    resolver: zodResolver(pangkatSchema),
    defaultValues: {
      golongan: "",
      namaPangkat: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("golongan", initialValues.golongan);
      setValue("namaPangkat", initialValues.namaPangkat);
    }
  }, [initialValues, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Golongan
        </label>
        <Input
          placeholder="Contoh: IV/a"
          {...register("golongan")}
          error={!!errors.golongan}
          disabled={!!initialValues}
        />
        {errors.golongan && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.golongan.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Nama Pangkat
        </label>
        <Input
          placeholder="Contoh: Pembina"
          {...register("namaPangkat")}
          error={!!errors.namaPangkat}
        />
        {errors.namaPangkat && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.namaPangkat.message}
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
          {initialValues ? "Simpan Perubahan" : "Tambah Pangkat"}
        </Button>
      </div>
    </form>
  );
}
