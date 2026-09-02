"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { UserCheck, Sparkles } from "lucide-react";
import {
  DEFAULT_PERAN_DOKUMEN,
  JENIS_DOKUMEN_PENANDATANGAN,
  Penandatangan,
  penandatanganSchema,
} from "../penandatangan.schema";

const ROLE_STORAGE_KEY = "simpenas_penandatangan_roles";

const readCustomRoles = () => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(ROLE_STORAGE_KEY);
  if (!stored) return [];
  return JSON.parse(stored) as string[];
};

const saveCustomRoles = (roles: string[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ROLE_STORAGE_KEY, JSON.stringify(roles));
  }
};

interface PenandatanganFormProps {
  initialValues?: Penandatangan | null;
  onSubmit: (data: Omit<Penandatangan, "id">) => void;
  onCancel: () => void;
}

export function PenandatanganForm({
  initialValues,
  onSubmit,
  onCancel,
}: PenandatanganFormProps) {
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const [selectedPegawaiId, setSelectedPegawaiId] = useState<string>(() => {
    if (!initialValues) return "";
    const matched = pegawais.find(
      (p) =>
        (p.nip && p.nip === initialValues.nip) ||
        p.nama.toLowerCase() === initialValues.nama.toLowerCase(),
    );
    return matched?.id || "";
  });

  const [customRoles, setCustomRoles] = useState<string[]>(readCustomRoles);
  const [showRoleInput, setShowRoleInput] = useState(false);
  const [newRole, setNewRole] = useState("");
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof penandatanganSchema>>({
    resolver: zodResolver(penandatanganSchema),
    defaultValues: {
      nip: "",
      nama: "",
      jabatanPenandatangan: "",
      peran: "KPA",
      berlakuMulai: "",
      berlakuSampai: "",
      jenisDokumen: ["SPBY", "Daftar Nominatif", "Tanda Terima", "Kuitansi"],
      status: "Aktif",
    },
  });

  const roleOptions = useMemo(
    () => [...new Set([...DEFAULT_PERAN_DOKUMEN, ...customRoles])],
    [customRoles],
  );

  useEffect(() => {
    if (initialValues) {
      setValue("nip", initialValues.nip);
      setValue("nama", initialValues.nama);
      setValue("jabatanPenandatangan", initialValues.jabatanPenandatangan);
      setValue("peran", initialValues.peran);
      setValue("berlakuMulai", initialValues.berlakuMulai);
      setValue("berlakuSampai", initialValues.berlakuSampai);
      setValue("jenisDokumen", initialValues.jenisDokumen);
      setValue("status", initialValues.status);
    }
  }, [initialValues, setValue]);

  const handleSelectPegawai = (pegawaiId: string) => {
    setSelectedPegawaiId(pegawaiId);
    if (!pegawaiId) return;

    const selected = pegawais.find((p) => p.id === pegawaiId);
    if (selected) {
      setValue("nama", selected.nama, { shouldValidate: true });
      setValue("nip", selected.nip || "", { shouldValidate: true });

      const currentJabatan = jabatans.find((j) => j.id === selected.jabatanId);
      if (currentJabatan?.nama) {
        setValue("jabatanPenandatangan", currentJabatan.nama, {
          shouldValidate: true,
        });
      }
    }
  };

  const handleAddRole = () => {
    const role = newRole.trim();
    if (!role || roleOptions.includes(role)) return;
    const updated = [...customRoles, role];
    setCustomRoles(updated);
    saveCustomRoles(updated);
    setValue("peran", role, { shouldValidate: true });
    setNewRole("");
    setShowRoleInput(false);
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const rest = { ...data };
        delete rest.id;
        onSubmit({
          ...rest,
          berlakuMulai: rest.berlakuMulai || "",
          berlakuSampai: rest.berlakuSampai || "",
          status: rest.status || "Aktif",
        });
      })}
      className="space-y-4"
    >
      {/* Selector Pegawai Otomatis */}
      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 space-y-1.5">
        <label className="block text-xs font-bold text-primary uppercase flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-primary" />
          <span>
            Pilih dari Master Pegawai (Otomatis Isi Nama, NIP & Jabatan)
          </span>
        </label>
        <Select
          value={selectedPegawaiId}
          onChange={(e) => handleSelectPegawai(e.target.value)}
          className="text-xs bg-card"
        >
          <option value="">-- Pilih Pegawai dari Daftar --</option>
          {pegawais.map((pegawai) => {
            const jab = jabatans.find((j) => j.id === pegawai.jabatanId);
            return (
              <option key={pegawai.id} value={pegawai.id}>
                {pegawai.nama} — NIP: {pegawai.nip || "Tanpa NIP"}
                {jab ? ` (${jab.nama})` : ""}
              </option>
            );
          })}
        </Select>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-primary shrink-0" />
          Memilih pegawai akan otomatis mengisi kolom <strong>
            Nama
          </strong>, <strong>NIP</strong>, dan <strong>Jabatan Cetak</strong> di
          bawah.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            NIP Pejabat <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Contoh: 19800411 200801 1 003"
            {...register("nip")}
            error={!!errors.nip}
          />
          {errors.nip && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.nip.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
            Nama Pejabat <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="Contoh: Faisal Yusuf, S.E"
            {...register("nama")}
            error={!!errors.nama}
          />
          {errors.nama && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.nama.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
          Jabatan Cetak (Kop Surat) <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Contoh: Pejabat Pembuat Komitmen (PPK)"
          {...register("jabatanPenandatangan")}
          error={!!errors.jabatanPenandatangan}
        />
        {errors.jabatanPenandatangan && (
          <p className="text-[10px] text-danger font-bold mt-1">
            {errors.jabatanPenandatangan.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <label className="block text-xs font-bold text-muted-foreground uppercase">
              Peran Dokumen <span className="text-destructive">*</span>
            </label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowRoleInput((value) => !value)}
              className="h-7 px-2 text-[10px]"
            >
              Tambah Peran
            </Button>
          </div>
          <Select {...register("peran")} error={!!errors.peran}>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </Select>
          {showRoleInput && (
            <div className="mt-2 flex gap-2">
              <Input
                value={newRole}
                onChange={(event) => setNewRole(event.target.value)}
                placeholder="Contoh: Pemeriksa SPJ"
              />
              <Button type="button" onClick={handleAddRole}>
                Tambah
              </Button>
            </div>
          )}
          {errors.peran && (
            <p className="text-[10px] text-danger font-bold mt-1">
              {errors.peran.message}
            </p>
          )}
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
            Berlaku Mulai
          </label>
          <Input type="date" {...register("berlakuMulai")} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-muted-foreground">
            Berlaku Sampai (Opsional)
          </label>
          <Input
            type="date"
            {...register("berlakuSampai")}
            error={!!errors.berlakuSampai}
          />
          {errors.berlakuSampai && (
            <p className="mt-1 text-[10px] font-bold text-danger">
              {errors.berlakuSampai.message}
            </p>
          )}
        </div>
      </div>

      <fieldset className="space-y-2 rounded-xl border border-border p-3">
        <legend className="px-1 text-xs font-bold uppercase text-muted-foreground">
          Digunakan pada Jenis Dokumen{" "}
          <span className="text-destructive">*</span>
        </legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {JENIS_DOKUMEN_PENANDATANGAN.map((jenis) => (
            <label
              key={jenis}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                value={jenis}
                {...register("jenisDokumen")}
              />
              {jenis}
            </label>
          ))}
        </div>
        {errors.jenisDokumen && (
          <p className="text-[10px] font-bold text-danger">
            {errors.jenisDokumen.message}
          </p>
        )}
      </fieldset>

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
          {initialValues ? "Simpan Perubahan" : "Tambah Pejabat"}
        </Button>
      </div>
    </form>
  );
}
