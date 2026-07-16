"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Jabatan, jabatanSchema } from "../jabatan.schema";

interface JabatanFormProps {
  initialValues?: Jabatan | null;
  onSubmit: (data: Omit<Jabatan, "id">) => void;
  onCancel: () => void;
}

export function JabatanForm({
  initialValues,
  onSubmit,
  onCancel,
}: JabatanFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<Jabatan, "id">>({
    resolver: zodResolver(jabatanSchema),
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
          Kode Jabatan
        </label>
        <Input
          placeholder="Contoh: JAB005"
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
          Nama Jabatan
        </label>
        <Input
          placeholder="Contoh: Bendahara Pengeluaran"
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
          {initialValues ? "Simpan Perubahan" : "Tambah Jabatan"}
        </Button>
      </div>
    </form>
  );
}
