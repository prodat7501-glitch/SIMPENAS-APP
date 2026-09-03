"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  KATEGORI_PEGAWAI_OPTIONS,
  Pegawai,
  ROLE_APLIKASI_OPTIONS,
  pegawaiSchema,
} from "../pegawai.schema";
import { Jabatan } from "@/modules/jabatan/jabatan.schema";
import { UnitKerja } from "@/modules/unit-kerja/unit-kerja.schema";
import { Pangkat } from "@/modules/pangkat/pangkat.schema";

interface PegawaiFormProps {
  initialValues?: Pegawai | null;
  jabatans: Jabatan[];
  unitKerjas: UnitKerja[];
  pangkats: Pangkat[];
  onSubmit: (data: Omit<Pegawai, "id">) => void;
  onCancel: () => void;
}

export function PegawaiForm({
  initialValues,
  jabatans,
  unitKerjas,
  pangkats,
  onSubmit,
  onCancel,
}: PegawaiFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof pegawaiSchema>>({
    resolver: zodResolver(pegawaiSchema),
    defaultValues: {
      kategoriPegawai: "ASN/Sekretariat",
      nip: "",
      nama: "",
      jabatanId: "",
      unitKerjaId: "",
      pangkatId: "",
      roleAplikasi: "Pegawai",
      status: "Aktif",
    },
  });

  useEffect(() => {
    if (initialValues) {
      setValue("kategoriPegawai", initialValues.kategoriPegawai);
      setValue("nip", initialValues.nip ?? "");
      setValue("nama", initialValues.nama);
      setValue("jabatanId", initialValues.jabatanId);
      setValue("unitKerjaId", initialValues.unitKerjaId);
      setValue("pangkatId", initialValues.pangkatId ?? "");
      setValue("roleAplikasi", initialValues.roleAplikasi ?? "Pegawai");
      setValue("status", initialValues.status);
    }
  }, [initialValues, setValue]);

  const kategoriPegawai = useWatch({
    control,
    name: "kategoriPegawai",
  });
  const sortedPangkats = useMemo(() => {
    return [...pangkats].sort((a, b) => {
      return (
        a.golongan.localeCompare(b.golongan, undefined, { numeric: true }) ||
        a.namaPangkat.localeCompare(b.namaPangkat)
      );
    });
  }, [pangkats]);

  const isAsnSekretariat = kategoriPegawai === "ASN/Sekretariat";

  useEffect(() => {
    if (!isAsnSekretariat) {
      setValue("pangkatId", "");
    }
  }, [isAsnSekretariat, setValue]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          kategoriPegawai: data.kategoriPegawai || "ASN/Sekretariat",
          nip: data.nip || "",
          nama: data.nama,
          jabatanId: data.jabatanId,
          unitKerjaId: data.unitKerjaId,
          pangkatId: data.pangkatId || "",
          roleAplikasi: data.roleAplikasi || "Pegawai",
          status: data.status || "Aktif",
        });
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Kategori Pegawai
          </label>
          <Select
            {...register("kategoriPegawai")}
            error={!!errors.kategoriPegawai}
          >
            {KATEGORI_PEGAWAI_OPTIONS.map((kategori) => (
              <option key={kategori} value={kategori}>
                {kategori}
              </option>
            ))}
          </Select>
          {errors.kategoriPegawai && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.kategoriPegawai.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            NIP Pegawai {!isAsnSekretariat && "(Opsional)"}
          </label>
          <Input
            placeholder="Contoh: 19900815 201801 1 002"
            {...register("nip")}
            error={!!errors.nip}
          />
          {errors.nip && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.nip.message}
            </p>
          )}
          {!isAsnSekretariat && (
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Ketua/Anggota KPU dapat disimpan tanpa NIP.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Nama Lengkap
          </label>
          <Input
            placeholder="Contoh: Eriyanto"
            {...register("nama")}
            error={!!errors.nama}
          />
          {errors.nama && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.nama.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Jabatan
          </label>
          <Select {...register("jabatanId")} error={!!errors.jabatanId}>
            <option value="">-- Pilih Jabatan --</option>
            {jabatans.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </Select>
          {errors.jabatanId && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.jabatanId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Unit Kerja
          </label>
          <Select {...register("unitKerjaId")} error={!!errors.unitKerjaId}>
            <option value="">-- Pilih Unit Kerja --</option>
            {unitKerjas.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nama}
              </option>
            ))}
          </Select>
          {errors.unitKerjaId && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.unitKerjaId.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Pangkat / Golongan {!isAsnSekretariat && "(Opsional)"}
          </label>
          <Select
            {...register("pangkatId")}
            error={!!errors.pangkatId}
            disabled={!isAsnSekretariat}
          >
            <option value="">
              {isAsnSekretariat
                ? `-- Pilih Pangkat/Golongan (${sortedPangkats.length} Pilihan) --`
                : "Tidak memiliki pangkat/golongan"}
            </option>
            {sortedPangkats.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaPangkat} ({p.golongan})
              </option>
            ))}
          </Select>
          {errors.pangkatId && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.pangkatId.message}
            </p>
          )}
          {!isAsnSekretariat && (
            <p className="text-[10px] text-muted-foreground font-medium mt-1">
              Pangkat/golongan hanya wajib untuk ASN/Sekretariat.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Role Aplikasi
          </label>
          <Select {...register("roleAplikasi")} error={!!errors.roleAplikasi}>
            {ROLE_APLIKASI_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
          {errors.roleAplikasi && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.roleAplikasi.message}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground font-medium mt-1">
            Role mengatur akses aplikasi; approval dokumen tetap mengikuti
            jabatan/otoritas.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Status
          </label>
          <Select {...register("status")} error={!!errors.status}>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </Select>
          {errors.status && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.status.message}
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
          {initialValues ? "Simpan Perubahan" : "Tambah Pegawai"}
        </Button>
      </div>
    </form>
  );
}
