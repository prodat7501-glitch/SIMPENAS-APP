"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NotaDinas, notaDinasSchema } from "../nota-dinas.schema";
import { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import { SBM } from "@/modules/sbm/sbm.schema";
import {
  Plus,
  Trash2,
  Calendar,
  FileText,
  User,
  HelpCircle,
  Hash,
} from "lucide-react";
import { z } from "zod";

interface NotaDinasFormProps {
  initialValues?: NotaDinas | null;
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  sbms: SBM[];
  onSubmit: (data: Omit<NotaDinas, "id">) => void;
  onCancel: () => void;
  onGenerateNomor: (date: string) => string;
}

export function NotaDinasForm({
  initialValues,
  pegawais,
  penandatangans,
  sbms,
  onSubmit,
  onCancel,
  onGenerateNomor,
}: NotaDinasFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof notaDinasSchema>>({
    resolver: zodResolver(notaDinasSchema),
    defaultValues: {
      kepada: "Ketua KPU Kabupaten Gorontalo",
      dari: "Kasubag Keuangan, Umum & Logistik",
      tembusan: "",
      nomor: "",
      tanggal: new Date().toISOString().split("T")[0],
      sifat: "Biasa",
      perihal: "",
      isi: "",
      penandatanganId: "",
      jenis: "Luar Kota",
      status: "Draft",
      totalBiaya: 0,
      lampiran: [
        {
          pegawaiId: "",
          uraian: "Perjalanan dinas",
          uangHarian: 0,
          uangTransport: 0,
          penginapan: 0,
          tiketPesawat: 0,
          transportBandaraAsal: 0,
          transportBandaraTujuan: 0,
          volume: 1,
          total: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lampiran",
  });

  const watchJenis = watch("jenis");
  const watchTanggal = watch("tanggal");
  const watchLampiran = watch("lampiran") || [];
  const isKasubbagSigner = (value: string) => {
    const text = value.toLowerCase();
    return (
      text.includes("kasubbag") ||
      text.includes("kepala sub bagian") ||
      text.includes("kepala subbagian")
    );
  };
  const penandatanganNotaDinasOptions = penandatangans.filter((item) =>
    isKasubbagSigner(`${item.jabatanPenandatangan} ${item.peran}`),
  );

  // Sync initial values
  useEffect(() => {
    if (initialValues) {
      setValue("kepada", initialValues.kepada);
      setValue("dari", initialValues.dari);
      setValue("tembusan", initialValues.tembusan || "");
      setValue("nomor", initialValues.nomor);
      setValue("tanggal", initialValues.tanggal);
      setValue("sifat", initialValues.sifat);
      setValue("perihal", initialValues.perihal);
      setValue("isi", initialValues.isi);
      setValue("penandatanganId", initialValues.penandatanganId);
      setValue("jenis", initialValues.jenis);
      setValue("status", initialValues.status);
      setValue("lampiran", initialValues.lampiran);
      setValue("totalBiaya", initialValues.totalBiaya);
    }
  }, [initialValues, setValue]);

  // SBM cross-reference helper
  const handlePegawaiChange = (index: number, pegawaiId: string) => {
    if (!pegawaiId) return;

    // Search default SBM based on travel type
    let defaultHarian = 0;
    let defaultTransport = 0;
    let defaultHotel = 0;

    if (watchJenis === "Dalam Kota") {
      const match = sbms.find((s) =>
        s.jenisBiaya.toLowerCase().includes("dalam kota"),
      );
      defaultHarian = match ? match.tarif : 150000;
    } else if (watchJenis === "Luar Kota") {
      const match = sbms.find((s) =>
        s.jenisBiaya.toLowerCase().includes("luar kota"),
      );
      defaultHarian = match ? match.tarif : 370000;
      defaultTransport = 250000; // standard allowance
    } else if (watchJenis === "Luar Daerah") {
      const matchHarian = sbms.find(
        (s) =>
          s.jenisBiaya.toLowerCase().includes("luar daerah") ||
          s.jenisBiaya.toLowerCase().includes("dki jakarta"),
      );
      const matchHotel = sbms.find(
        (s) =>
          s.jenisBiaya.toLowerCase().includes("hotel") ||
          s.jenisBiaya.toLowerCase().includes("akomodasi"),
      );
      defaultHarian = matchHarian ? matchHarian.tarif : 530000;
      defaultHotel = matchHotel ? matchHotel.tarif : 1200000;
      defaultTransport = 250000; // standard airport transport
    }

    setValue(`lampiran.${index}.uangHarian`, defaultHarian);
    setValue(`lampiran.${index}.uangTransport`, defaultTransport);
    setValue(`lampiran.${index}.penginapan`, defaultHotel);
    setValue(
      `lampiran.${index}.tiketPesawat`,
      watchJenis === "Luar Daerah" ? 2500000 : 0,
    );
    setValue(
      `lampiran.${index}.transportBandaraAsal`,
      watchJenis === "Luar Daerah" ? 250000 : 0,
    );
    setValue(
      `lampiran.${index}.transportBandaraTujuan`,
      watchJenis === "Luar Daerah" ? 250000 : 0,
    );

    triggerCalculations();
  };

  // Recalculate row & grand total
  const triggerCalculations = () => {
    let grandTotal = 0;
    const currentLampiran = watch("lampiran") || [];

    currentLampiran.forEach((item, idx) => {
      const harian = Number(item.uangHarian) || 0;
      const transport = Number(item.uangTransport) || 0;
      const hotel = Number(item.penginapan) || 0;
      const tiket = Number(item.tiketPesawat) || 0;
      const airport1 = Number(item.transportBandaraAsal) || 0;
      const airport2 = Number(item.transportBandaraTujuan) || 0;
      const vol = Number(item.volume) || 1;

      let rowTotal = 0;
      if (watchJenis === "Dalam Kota") {
        rowTotal = (harian + transport) * vol;
      } else if (watchJenis === "Luar Kota") {
        rowTotal = (harian + transport + hotel) * vol;
      } else {
        rowTotal = (harian + tiket + airport1 + airport2 + hotel) * vol;
      }

      setValue(`lampiran.${idx}.total`, rowTotal);
      grandTotal += rowTotal;
    });

    setValue("totalBiaya", grandTotal);
  };

  // Handle Ambil Nomor
  const handleAmbilNomor = () => {
    const generated = onGenerateNomor(watchTanggal);
    setValue("nomor", generated);
    setValue("status", "Nomor Diambil");
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const { id, ...rest } = data;
        onSubmit({
          ...rest,
          sifat: rest.sifat || "Biasa",
          jenis: rest.jenis || "Luar Kota",
          tembusan: rest.tembusan || "",
          status: rest.status || "Draft",
          totalBiaya: Number(rest.totalBiaya) || 0,
          lampiran: (rest.lampiran || []).map((item) => ({
            ...item,
            uraian: item.uraian || "Perjalanan dinas",
            uangHarian: Number(item.uangHarian) || 0,
            uangTransport: Number(item.uangTransport) || 0,
            penginapan: Number(item.penginapan) || 0,
            tiketPesawat: Number(item.tiketPesawat) || 0,
            transportBandaraAsal: Number(item.transportBandaraAsal) || 0,
            transportBandaraTujuan: Number(item.transportBandaraTujuan) || 0,
            volume: Number(item.volume) || 1,
            total: Number(item.total) || 0,
          })),
        });
      })}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Header Card (2/3 width or 1/3) */}
        <div className="lg:col-span-1 space-y-4 bg-card p-5 border border-border rounded-xl">
          <h2 className="text-sm font-bold text-foreground uppercase border-b border-border pb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Informasi Header
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Kepada
            </label>
            <Input {...register("kepada")} error={!!errors.kepada} />
            {errors.kepada && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.kepada.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Dari (Pengirim)
            </label>
            <Input {...register("dari")} error={!!errors.dari} />
            {errors.dari && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.dari.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Tembusan (Opsional)
            </label>
            <Input
              {...register("tembusan")}
              placeholder="Contoh: Sekretaris KPU Kabupaten Gorontalo"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Tanggal
              </label>
              <Input
                type="date"
                {...register("tanggal")}
                error={!!errors.tanggal}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Sifat Surat
              </label>
              <Select {...register("sifat")}>
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Rahasia">Rahasia</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Nomor Nota Dinas
            </label>
            <div className="flex gap-1.5">
              <Input
                {...register("nomor")}
                placeholder="Klik Ambil Nomor ->"
                error={!!errors.nomor}
                readOnly
                className="bg-muted text-xs font-mono font-bold"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAmbilNomor}
                className="px-2.5 flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs"
              >
                <Hash className="w-3.5 h-3.5" /> Ambil
              </Button>
            </div>
            {errors.nomor && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.nomor.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Perihal
            </label>
            <Input
              {...register("perihal")}
              error={!!errors.perihal}
              placeholder="Contoh: Permohonan Perjalanan Dinas..."
            />
            {errors.perihal && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.perihal.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Tipe Dinas
            </label>
            <Select
              {...register("jenis")}
              onChange={(e) => {
                setValue("jenis", e.target.value as NotaDinas["jenis"]);
                triggerCalculations();
              }}
            >
              <option value="Dalam Kota">Perjalanan Dinas Dalam Kota</option>
              <option value="Luar Kota">Perjalanan Dinas Luar Kota</option>
              <option value="Luar Daerah">
                Perjalanan Dinas Luar Daerah (Pesawat)
              </option>
            </Select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Pejabat Penandatangan
            </label>
            <Select
              {...register("penandatanganId")}
              error={!!errors.penandatanganId}
            >
              <option value="">-- Pilih Kasubbag/Kepala Sub Bagian --</option>
              {penandatanganNotaDinasOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.peran})
                </option>
              ))}
            </Select>
            {penandatanganNotaDinasOptions.length === 0 && (
              <p className="text-[10px] text-warning font-bold mt-1">
                Belum ada Kasubbag/Kepala Sub Bagian aktif di Master Pejabat
                Penandatangan.
              </p>
            )}
            {errors.penandatanganId && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.penandatanganId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Status
            </label>
            <Select {...register("status")}>
              <option value="Draft">Draft</option>
              <option value="Nomor Diambil">Nomor Diambil</option>
              <option value="Menunggu Approval">Kirim ke Supervisor</option>
              {initialValues?.status === "Perlu Revisi" && (
                <option value="Perlu Revisi">Perlu Revisi</option>
              )}
              {initialValues?.status === "Disetujui" && (
                <option value="Disetujui">Disetujui</option>
              )}
              {initialValues?.status === "Selesai" && (
                <option value="Selesai">Selesai (Diarsipkan)</option>
              )}
            </Select>
          </div>
        </div>

        {/* Right: Isi & Lampiran Costing (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card p-5 border border-border rounded-xl space-y-4">
            <h2 className="text-sm font-bold text-foreground uppercase border-b border-border pb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> Isi Nota Dinas
            </h2>
            <div>
              <textarea
                {...register("isi")}
                rows={4}
                className="w-full text-xs p-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                placeholder="Tulis rincian permohonan nota dinas secara lengkap di sini..."
              />
              {errors.isi && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.isi.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card p-5 border border-border rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="text-sm font-bold text-foreground uppercase flex items-center gap-1.5">
                <User className="w-4 h-4 text-primary" /> Lampiran Personil &
                Anggaran ({watchJenis})
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    pegawaiId: "",
                    uraian: "Perjalanan dinas",
                    uangHarian: 0,
                    uangTransport: 0,
                    penginapan: 0,
                    tiketPesawat: 0,
                    transportBandaraAsal: 0,
                    transportBandaraTujuan: 0,
                    volume: 1,
                    total: 0,
                  })
                }
                className="flex items-center gap-1 cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </Button>
            </div>

            {errors.lampiran && (
              <p className="text-[10px] text-danger font-bold">
                {errors.lampiran.message}
              </p>
            )}

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-muted/40 border border-border rounded-lg space-y-3 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      remove(index);
                      triggerCalculations();
                    }}
                    className="absolute top-2 right-2 text-danger hover:bg-danger/10 h-7 w-7 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                        Nama Pegawai
                      </label>
                      <Select
                        {...register(`lampiran.${index}.pegawaiId` as const)}
                        onChange={(e) => {
                          setValue(
                            `lampiran.${index}.pegawaiId`,
                            e.target.value,
                          );
                          handlePegawaiChange(index, e.target.value);
                        }}
                      >
                        <option value="">-- Pilih Pegawai --</option>
                        {pegawais.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nama} (NIP. {p.nip || "-"})
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  {/* Dynamic cost columns based on travel type */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                        Uang Harian (Rp)
                      </label>
                      <Input
                        type="number"
                        {...register(`lampiran.${index}.uangHarian` as const, {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        })}
                      />
                    </div>

                    {watchJenis !== "Luar Daerah" && (
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                          Uang Transport (Rp)
                        </label>
                        <Input
                          type="number"
                          {...register(
                            `lampiran.${index}.uangTransport` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                        />
                      </div>
                    )}

                    {watchJenis !== "Dalam Kota" && (
                      <div>
                        <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                          Hotel / Penginapan (Rp)
                        </label>
                        <Input
                          type="number"
                          {...register(
                            `lampiran.${index}.penginapan` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                        />
                      </div>
                    )}

                    {watchJenis === "Luar Daerah" && (
                      <>
                        <div>
                          <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                            Tiket Pesawat (Rp)
                          </label>
                          <Input
                            type="number"
                            {...register(
                              `lampiran.${index}.tiketPesawat` as const,
                              {
                                valueAsNumber: true,
                                onChange: triggerCalculations,
                              },
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                            Trans. Bandara Asal (Rp)
                          </label>
                          <Input
                            type="number"
                            {...register(
                              `lampiran.${index}.transportBandaraAsal` as const,
                              {
                                valueAsNumber: true,
                                onChange: triggerCalculations,
                              },
                            )}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                            Trans. Bandara Tujuan (Rp)
                          </label>
                          <Input
                            type="number"
                            {...register(
                              `lampiran.${index}.transportBandaraTujuan` as const,
                              {
                                valueAsNumber: true,
                                onChange: triggerCalculations,
                              },
                            )}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                        Durasi (Hari)
                      </label>
                      <Input
                        type="number"
                        {...register(`lampiran.${index}.volume` as const, {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-1.5 pt-2 text-right">
                    <span className="text-[10px] text-muted-foreground">
                      Subtotal Baris:
                    </span>
                    <span className="text-xs font-extrabold text-primary">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(watchLampiran[index]?.total || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
              <span className="text-xs font-bold text-foreground">
                Total Anggaran Keseluruhan Nota Dinas:
              </span>
              <span className="text-base font-black text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(watch(`totalBiaya`) || 0)}
              </span>
            </div>
          </div>
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
          {initialValues ? "Simpan Perubahan" : "Simpan Nota Dinas"}
        </Button>
      </div>
    </form>
  );
}
