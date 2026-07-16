"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SBM, sbmSchema } from "../sbm.schema";

interface SBMFormProps {
  initialValues?: SBM | null;
  onSubmit: (data: Omit<SBM, "id">) => void;
  onCancel: () => void;
}

export function SBMForm({ initialValues, onSubmit, onCancel }: SBMFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Omit<SBM, "id">>({
    resolver: zodResolver(sbmSchema),
    defaultValues: {
      wilayah: "",
      jenisBiaya: "",
      satuan: "",
      tarif: 0,
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("wilayah", initialValues.wilayah);
      setValue("jenisBiaya", initialValues.jenisBiaya);
      setValue("satuan", initialValues.satuan);
      setValue("tarif", initialValues.tarif);
    }
  }, [initialValues, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          ...data,
          tarif: Number(data.tarif),
        });
      })}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Wilayah / Provinsi
        </label>
        <Input
          placeholder="Contoh: Gorontalo"
          {...register("wilayah")}
          error={!!errors.wilayah}
        />
        {errors.wilayah && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.wilayah.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Jenis Biaya
        </label>
        <Input
          placeholder="Contoh: Uang Harian Luar Kota"
          {...register("jenisBiaya")}
          error={!!errors.jenisBiaya}
        />
        {errors.jenisBiaya && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.jenisBiaya.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Satuan
          </label>
          <Input
            placeholder="Contoh: OH, Malam, Kali"
            {...register("satuan")}
            error={!!errors.satuan}
          />
          {errors.satuan && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.satuan.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Tarif Standar (Rp)
          </label>
          <Input
            type="number"
            placeholder="Tarif"
            {...register("tarif", { valueAsNumber: true })}
            error={!!errors.tarif}
          />
          {errors.tarif && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.tarif.message}
            </p>
          )}
        </div>
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
          {initialValues ? "Simpan Perubahan" : "Tambah SBM"}
        </Button>
      </div>
    </form>
  );
}
