"use client";

import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spt, sptSchema } from "../spt.schema";
import { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import { Trash2, FileText, User, Hash, PlusCircle } from "lucide-react";
import { z } from "zod";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";

type JenisPersonilSpt = "Sekretariat" | "Komisioner";
type SubmitAction = "save" | "saveAndNextKomisioner";

interface SptFormProps {
  initialValues?: Spt | null;
  existingSpts: Spt[];
  notaDinasItems: NotaDinas[];
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  onSubmit: (
    data: Omit<Spt, "id">,
    options?: { keepOpen?: boolean },
  ) => void;
  onCancel: () => void;
  onGenerateNomor: (date: string) => string;
}

export function SptForm({
  initialValues,
  existingSpts,
  notaDinasItems,
  pegawais,
  penandatangans,
  onSubmit,
  onCancel,
  onGenerateNomor,
}: SptFormProps) {
  const [jenisPersonilSpt, setJenisPersonilSpt] =
    React.useState<JenisPersonilSpt>("Sekretariat");
  const [submitAction, setSubmitAction] = React.useState<SubmitAction>("save");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof sptSchema>>({
    resolver: zodResolver(sptSchema),
    defaultValues: {
      notaDinasId: "",
      nomor: "",
      tanggalMulai: new Date().toISOString().split("T")[0],
      tanggalSelesai: new Date().toISOString().split("T")[0],
      penandatanganId: "",
      status: "Draft",
      menimbang: [
        { text: "Bahwa untuk kelancaran pelaksanaan tugas-tugas dinas..." },
      ],
      dasar: [
        { text: "Undang-Undang Nomor 7 Tahun 2017 tentang Pemilihan Umum." },
        {
          text: "DIPA Komisi Pemilihan Umum Kabupaten Gorontalo Tahun Anggaran 2026.",
        },
      ],
      untuk: [{ text: "Melaksanakan perjalanan dinas dalam rangka..." }],
      personil: [],
    },
  });

  const {
    fields: fieldsMenimbang,
    append: appendMenimbang,
    remove: removeMenimbang,
  } = useFieldArray({
    control,
    name: "menimbang",
  });

  const {
    fields: fieldsDasar,
    append: appendDasar,
    remove: removeDasar,
  } = useFieldArray({
    control,
    name: "dasar",
  });

  const {
    fields: fieldsUntuk,
    append: appendUntuk,
    remove: removeUntuk,
  } = useFieldArray({
    control,
    name: "untuk",
  });

  const watchTanggalMulai = watch("tanggalMulai");
  const watchNotaDinasId = watch("notaDinasId");
  const watchPersonil = watch("personil") ?? [];
  const watchNomor = watch("nomor");
  const watchStatus = watch("status");
  const selectedNotaDinas = notaDinasItems.find(
    (item) => item.id === watchNotaDinasId,
  );
  const isSekretarisSigner = (value: string) => {
    const text = value.toLowerCase();
    return (
      text.includes("sekretaris") ||
      text.includes("plt sekretaris") ||
      text.includes("plh sekretaris")
    );
  };
  const isKetuaKpuSigner = (value: string) =>
    value.toLowerCase().includes("ketua kpu");
  const getSignerText = (id: string) => {
    const signer = penandatangans.find((item) => item.id === id);
    return signer ? `${signer.jabatanPenandatangan} ${signer.peran}` : "";
  };
  const isPegawaiKomisioner = (pegawaiId: string) => {
    const pegawai = pegawais.find((item) => item.id === pegawaiId);
    return (
      pegawai?.kategoriPegawai === "Ketua KPU" ||
      pegawai?.kategoriPegawai === "Anggota KPU"
    );
  };
  const filterPersonilByJenis = (
    nota: NotaDinas,
    jenis: JenisPersonilSpt,
  ) =>
    nota.lampiran
      .filter((lampiran) =>
        jenis === "Komisioner"
          ? isPegawaiKomisioner(lampiran.pegawaiId)
          : !isPegawaiKomisioner(lampiran.pegawaiId),
      )
      .map((lampiran) => ({ pegawaiId: lampiran.pegawaiId }));
  const notaHasKomisioner =
    selectedNotaDinas?.lampiran.some((lampiran) =>
      isPegawaiKomisioner(lampiran.pegawaiId),
    ) ?? false;
  const notaHasSekretariat =
    selectedNotaDinas?.lampiran.some(
      (lampiran) => !isPegawaiKomisioner(lampiran.pegawaiId),
    ) ?? false;
  const notaIsMixed = Boolean(
    selectedNotaDinas && notaHasKomisioner && notaHasSekretariat,
  );
  const isKomisionerSpt =
    watchPersonil.length > 0 &&
    watchPersonil.every((person) => isPegawaiKomisioner(person.pegawaiId));
  const penandatanganOptions = penandatangans.filter((item) => {
    const signerText = `${item.jabatanPenandatangan} ${item.peran}`;
    return isKomisionerSpt
      ? isKetuaKpuSigner(signerText)
      : isSekretarisSigner(signerText);
  });
  const canContinueToKomisionerSpt =
    !initialValues &&
    notaIsMixed &&
    jenisPersonilSpt === "Sekretariat" &&
    notaHasKomisioner;
  const hasPreviousSptInSameNotaDinas =
    !initialValues &&
    Boolean(watchNotaDinasId) &&
    existingSpts.some(
      (item) =>
        item.notaDinasId === watchNotaDinasId &&
        item.status !== "Draft" &&
        item.nomor,
    );
  const canGenerateNomor =
    !watchNomor ||
    watchStatus === "Selesai" ||
    watchStatus === "Draft" ||
    hasPreviousSptInSameNotaDinas;
  const findReusableSptText = (notaDinasId: string) =>
    existingSpts.find(
      (item) =>
        item.notaDinasId === notaDinasId &&
        item.id !== initialValues?.id &&
        item.status !== "Draft" &&
        item.menimbang.length > 0 &&
        item.dasar.length > 0 &&
        item.untuk.length > 0,
    );
  const applyReusableSptText = (notaDinasId: string) => {
    if (initialValues) return false;
    const reusable = findReusableSptText(notaDinasId);
    if (!reusable) return false;
    setValue("menimbang", reusable.menimbang, { shouldValidate: true });
    setValue("dasar", reusable.dasar, { shouldValidate: true });
    setValue("untuk", reusable.untuk, { shouldValidate: true });
    return true;
  };

  // Sync initial values
  useEffect(() => {
    if (initialValues) {
      setValue("notaDinasId", initialValues.notaDinasId);
      setValue("nomor", initialValues.nomor);
      setValue("tanggalMulai", initialValues.tanggalMulai);
      setValue("tanggalSelesai", initialValues.tanggalSelesai);
      setValue("penandatanganId", initialValues.penandatanganId);
      setValue("status", initialValues.status);
      setValue("menimbang", initialValues.menimbang);
      setValue("dasar", initialValues.dasar);
      setValue("untuk", initialValues.untuk);
      const nota = notaDinasItems.find(
        (item) => item.id === initialValues.notaDinasId,
      );
      const initialIsKomisioner =
        initialValues.personil.length > 0 &&
        initialValues.personil.every((person) =>
          isPegawaiKomisioner(person.pegawaiId),
        );
      const nextJenis: JenisPersonilSpt = initialIsKomisioner
        ? "Komisioner"
        : "Sekretariat";
      setJenisPersonilSpt(nextJenis);
      setValue(
        "personil",
        nota ? filterPersonilByJenis(nota, nextJenis) : initialValues.personil,
      );
    }
  }, [initialValues, notaDinasItems, setValue]);

  // Handle Ambil Nomor
  const handleAmbilNomor = () => {
    if (!canGenerateNomor) {
      alert(
        "Nomor SPT baru hanya dapat diambil apabila SPT belum bernomor, status SPT sudah Selesai, atau masih membuat SPT lanjutan dari Nota Dinas yang sama.",
      );
      return;
    }
    const generated = onGenerateNomor(watchTanggalMulai);
    setValue("nomor", generated);
    setValue("status", "Nomor Diambil");
  };

  const handleNotaDinasChange = (notaDinasId: string) => {
    const nota = notaDinasItems.find((item) => item.id === notaDinasId);
    const nextJenis: JenisPersonilSpt =
      nota?.lampiran.some((item) => !isPegawaiKomisioner(item.pegawaiId))
        ? "Sekretariat"
        : "Komisioner";
    setJenisPersonilSpt(nextJenis);
    setValue("notaDinasId", notaDinasId, { shouldValidate: true });
    setValue(
      "personil",
      nota ? filterPersonilByJenis(nota, nextJenis) : [],
      { shouldValidate: true },
    );
    if (nota && !initialValues) {
      const copiedFromExistingSpt = applyReusableSptText(notaDinasId);
      if (!copiedFromExistingSpt) {
        setValue("untuk", [{ text: nota.isi }]);
      }
    }
  };
  const handleJenisPersonilChange = (jenis: JenisPersonilSpt) => {
    setJenisPersonilSpt(jenis);
    if (!selectedNotaDinas) return;
    setValue("personil", filterPersonilByJenis(selectedNotaDinas, jenis), {
      shouldValidate: true,
    });
    if (selectedNotaDinas.id) {
      applyReusableSptText(selectedNotaDinas.id);
    }
    setValue("penandatanganId", "", { shouldValidate: true });
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const rest = data;
        const signerText = getSignerText(rest.penandatanganId);
        if (isKomisionerSpt && !isKetuaKpuSigner(signerText)) {
          alert(
            "SPT yang berisi Komisioner KPU wajib ditandatangani oleh Ketua KPU.",
          );
          return;
        }
        if (
          !isKomisionerSpt &&
          !isSekretarisSigner(signerText)
        ) {
          alert(
            "SPT Sekretariat wajib ditandatangani oleh Sekretaris/PLT Sekretaris/PLH Sekretaris.",
          );
          return;
        }
        onSubmit(
          {
          ...rest,
          status: rest.status || "Draft",
          menimbang: (rest.menimbang || []).map((m) => ({
            text: m.text || "",
          })),
          dasar: (rest.dasar || []).map((d) => ({ text: d.text || "" })),
          untuk: (rest.untuk || []).map((u) => ({ text: u.text || "" })),
          personil: (rest.personil || []).map((p) => ({
            pegawaiId: p.pegawaiId || "",
          })),
          },
          { keepOpen: submitAction === "saveAndNextKomisioner" },
        );
        if (submitAction === "saveAndNextKomisioner" && selectedNotaDinas) {
          handleJenisPersonilChange("Komisioner");
          setValue("nomor", "", { shouldValidate: true });
          setValue("penandatanganId", "", { shouldValidate: true });
          setValue("status", "Draft", { shouldValidate: true });
          setSubmitAction("save");
        }
      })}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Header Information */}
        <div className="lg:col-span-1 space-y-4 bg-card p-5 border border-border rounded-xl">
          <h2 className="text-sm font-bold text-foreground uppercase border-b border-border pb-2 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-primary" /> Informasi Header
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Referensi Nota Dinas
            </label>
            <Select
              value={watchNotaDinasId}
              onChange={(event) => handleNotaDinasChange(event.target.value)}
              error={!!errors.notaDinasId}
              disabled={initialValues?.status === "Disetujui"}
            >
              <option value="">-- Pilih Nota Dinas Disetujui --</option>
              {notaDinasItems.map((nota) => (
                <option key={nota.id} value={nota.id}>
                  {nota.nomor} — {nota.perihal}
                </option>
              ))}
            </Select>
            {errors.notaDinasId && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.notaDinasId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Nomor SPT
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
                disabled={!canGenerateNomor}
                className="px-2.5 flex items-center gap-1 cursor-pointer whitespace-nowrap text-xs"
                title={
                  canGenerateNomor
                    ? "Ambil nomor SPT"
                    : "Nomor baru hanya dapat diambil setelah status SPT Selesai, kecuali untuk SPT lanjutan dari Nota Dinas yang sama"
                }
              >
                <Hash className="w-3.5 h-3.5" /> Ambil
              </Button>
            </div>
            {!canGenerateNomor && (
              <p className="text-[10px] text-warning font-bold mt-1">
                SPT sudah memiliki nomor. Nomor baru hanya bisa diambil setelah
                status SPT menjadi Selesai, kecuali untuk SPT lanjutan dari
                Nota Dinas yang sama.
              </p>
            )}
            {errors.nomor && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.nomor.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Tanggal Mulai
              </label>
              <Input
                type="date"
                {...register("tanggalMulai")}
                error={!!errors.tanggalMulai}
              />
              {errors.tanggalMulai && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.tanggalMulai.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Tanggal Selesai
              </label>
              <Input
                type="date"
                {...register("tanggalSelesai")}
                error={!!errors.tanggalSelesai}
              />
              {errors.tanggalSelesai && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.tanggalSelesai.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Pejabat Penandatangan
            </label>
            <Select
              {...register("penandatanganId")}
              error={!!errors.penandatanganId}
            >
              <option value="">
                {isKomisionerSpt
                  ? "-- Pilih Ketua KPU --"
                  : "-- Pilih Sekretaris/PLT/PLH Sekretaris --"}
              </option>
              {penandatanganOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.peran})
                </option>
              ))}
            </Select>
            {penandatanganOptions.length === 0 && (
              <p className="text-[10px] text-warning font-bold mt-1">
                Belum ada pejabat penandatangan yang sesuai aturan. Tambahkan di
                Master Pejabat Penandatangan.
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
              <option value="Menunggu Approval">Kirim untuk Approval</option>
              {initialValues?.status === "Perlu Revisi" && (
                <option value="Perlu Revisi">Perlu Revisi</option>
              )}
              {initialValues?.status === "Disetujui" && (
                <option value="Disetujui">Disetujui</option>
              )}
            </Select>
          </div>
        </div>

        {/* Right Column: Dynamic Lists (Menimbang, Dasar, Untuk, Personil) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section: Menimbang */}
          <div className="bg-card p-5 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h2 className="text-xs font-bold text-foreground uppercase">
                I. Menimbang (Pertimbangan)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendMenimbang({ text: "" })}
                className="h-7 px-2 flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <PlusCircle className="w-3 h-3" /> Tambah Butir
              </Button>
            </div>
            {errors.menimbang && (
              <p className="text-[10px] text-danger font-bold">
                {errors.menimbang.message}
              </p>
            )}
            <div className="space-y-2">
              {fieldsMenimbang.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <Input
                    placeholder="Butir Pertimbangan..."
                    {...register(`menimbang.${idx}.text` as const)}
                    error={!!errors.menimbang?.[idx]?.text}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMenimbang(idx)}
                    className="h-8 w-8 text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Dasar */}
          <div className="bg-card p-5 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h2 className="text-xs font-bold text-foreground uppercase">
                II. Dasar (Landasan Hukum)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendDasar({ text: "" })}
                className="h-7 px-2 flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <PlusCircle className="w-3 h-3" /> Tambah Butir
              </Button>
            </div>
            {errors.dasar && (
              <p className="text-[10px] text-danger font-bold">
                {errors.dasar.message}
              </p>
            )}
            <div className="space-y-2">
              {fieldsDasar.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <Input
                    placeholder="Butir Landasan Hukum..."
                    {...register(`dasar.${idx}.text` as const)}
                    error={!!errors.dasar?.[idx]?.text}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDasar(idx)}
                    className="h-8 w-8 text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Untuk */}
          <div className="bg-card p-5 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h2 className="text-xs font-bold text-foreground uppercase">
                III. Untuk (Tugas / Kegiatan)
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendUntuk({ text: "" })}
                className="h-7 px-2 flex items-center gap-1 cursor-pointer text-[10px]"
              >
                <PlusCircle className="w-3 h-3" /> Tambah Butir
              </Button>
            </div>
            {errors.untuk && (
              <p className="text-[10px] text-danger font-bold">
                {errors.untuk.message}
              </p>
            )}
            <div className="space-y-2">
              {fieldsUntuk.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <span className="text-xs font-bold text-muted-foreground">
                    {idx + 1}.
                  </span>
                  <Input
                    placeholder="Butir Tugas/Kegiatan..."
                    {...register(`untuk.${idx}.text` as const)}
                    error={!!errors.untuk?.[idx]?.text}
                    className="flex-1 text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeUntuk(idx)}
                    className="h-8 w-8 text-danger hover:bg-danger/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Personil */}
          <div className="bg-card p-5 border border-border rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h2 className="text-xs font-bold text-foreground uppercase flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-primary" /> IV. Personil yang
                Ditugaskan
              </h2>
              <span className="text-[10px] text-muted-foreground">
                Otomatis dari lampiran Nota Dinas
              </span>
            </div>
            {errors.personil && (
              <p className="text-[10px] text-danger font-bold">
                {errors.personil.message}
              </p>
            )}
            {selectedNotaDinas && (notaHasKomisioner || notaHasSekretariat) && (
              <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-foreground">
                      Pilih Personil untuk SPT
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Nota Dinas boleh memuat Komisioner dan Sekretariat, namun
                      SPT dibuat terpisah berdasarkan kelompok personil.
                    </p>
                  </div>
                  <Select
                    value={jenisPersonilSpt}
                    onChange={(event) =>
                      handleJenisPersonilChange(
                        event.target.value as JenisPersonilSpt,
                      )
                    }
                    className="sm:w-56"
                  >
                    {notaHasSekretariat && (
                      <option value="Sekretariat">SPT Sekretariat</option>
                    )}
                    {notaHasKomisioner && (
                      <option value="Komisioner">SPT Komisioner</option>
                    )}
                  </Select>
                </div>
                {notaIsMixed && (
                  <p className="text-[10px] font-semibold text-warning">
                    Nota Dinas ini berisi campuran personil. Sistem hanya
                    memuat personil {jenisPersonilSpt} untuk SPT ini.
                  </p>
                )}
              </div>
            )}
            {watchPersonil.length > 0 && (
              <div className="rounded-xl border border-info/30 bg-info/10 p-3 text-[11px] font-semibold text-info">
                Jenis SPT:{" "}
                {isKomisionerSpt
                  ? "SPT Komisioner — ditandatangani Ketua KPU."
                  : "SPT Sekretariat — ditandatangani Sekretaris/PLT/PLH Sekretaris."}
              </div>
            )}
            <div className="space-y-2">
              {watchPersonil.map((person, idx) => {
                const pegawai = pegawais.find(
                  (item) => item.id === person.pegawaiId,
                );
                const lampiran = selectedNotaDinas?.lampiran[idx];
                return (
                  <div
                    key={`${person.pegawaiId}-${idx}`}
                    className="flex gap-2 items-start rounded-lg border border-border p-3"
                  >
                    <span className="text-xs font-bold text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground">
                        {pegawai?.nama ?? person.pegawaiId}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        NIP. {pegawai?.nip || "-"}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground">
                        Kategori: {pegawai?.kategoriPegawai ?? "-"}
                      </p>
                      {lampiran && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {lampiran.uraian}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex justify-end gap-2 border-t border-border bg-card/95 px-1 pt-4 pb-1 backdrop-blur">
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
          onClick={() => setSubmitAction("save")}
          disabled={isSubmitting}
          className="cursor-pointer"
        >
          {initialValues ? "Simpan Perubahan" : "Simpan SPT"}
        </Button>
        {canContinueToKomisionerSpt && (
          <Button
            type="submit"
            variant="outline"
            onClick={() => setSubmitAction("saveAndNextKomisioner")}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Simpan & Next Buat SPT Komisioner
          </Button>
        )}
      </div>
    </form>
  );
}
