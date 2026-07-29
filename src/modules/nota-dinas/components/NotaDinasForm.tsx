"use client";

import React, { useEffect, useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  type LampiranItem,
  type NotaDinas,
  notaDinasSchema,
} from "../nota-dinas.schema";
import {
  calculateLampiranTotal,
  getLampiranCostLines,
  type LampiranCostKey,
} from "../nota-dinas-calculation";
import type { NotaDinasTravelConflict } from "../nota-dinas.service";
import { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import {
  getNotaDinasApprovalDestination,
  isPenandatanganAvailable,
  resolveNotaDinasApprover,
} from "@/modules/penandatangan/penandatangan.service";
import { SBM } from "@/modules/sbm/sbm.schema";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import { Plus, Trash2, FileText, User, Hash } from "lucide-react";
import { z } from "zod";
import { getDipaBudgetAvailability } from "../nota-dinas-budget";

interface TravelConflictCheck {
  pegawaiId: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
}

const formatTanggal = (value: string) => {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const createEmptyLampiranItem = (): LampiranItem => ({
  pegawaiId: "",
  uraian: "Perjalanan dinas",
  uangHarian: 0,
  volumeUangHarian: 0,
  volumeUangHarianPaketMeeting: 0,
  uangHarianFull: 0,
  volumeUangHarianFull: 0,
  uangTransport: 0,
  volumeUangTransport: 0,
  penginapan: 0,
  volumePenginapan: 0,
  tiketPesawat: 0,
  volumeTiketPesawat: 0,
  transportBandaraAsal: 0,
  volumeTransportBandaraAsal: 0,
  transportBandaraTujuan: 0,
  volumeTransportBandaraTujuan: 0,
  volume: 1,
  total: 0,
});

const toCalculationItem = (
  item: Partial<LampiranItem> | undefined,
  jenis: NotaDinas["jenis"],
): LampiranItem => {
  const volume = Number(item?.volume) || 1;
  return {
    ...createEmptyLampiranItem(),
    ...item,
    pegawaiId: item?.pegawaiId ?? "",
    uraian: item?.uraian ?? "Perjalanan dinas",
    uangHarian: Number(item?.uangHarian) || 0,
    volumeUangHarian:
      item?.volumeUangHarian === undefined
        ? volume
        : Number(item.volumeUangHarian) || 0,
    volumeUangHarianPaketMeeting:
      item?.volumeUangHarianPaketMeeting === undefined
        ? volume
        : Number(item.volumeUangHarianPaketMeeting) || 0,
    uangHarianFull: Number(item?.uangHarianFull) || 0,
    volumeUangHarianFull: Number(item?.volumeUangHarianFull) || 0,
    uangTransport: Number(item?.uangTransport) || 0,
    volumeUangTransport:
      item?.volumeUangTransport === undefined
        ? volume
        : Number(item.volumeUangTransport) || 0,
    penginapan: Number(item?.penginapan) || 0,
    volumePenginapan:
      item?.volumePenginapan === undefined
        ? jenis === "Luar Daerah"
          ? Math.max(0, volume - 1)
          : jenis === "Luar Kota"
            ? volume
            : 0
        : Number(item.volumePenginapan) || 0,
    tiketPesawat: Number(item?.tiketPesawat) || 0,
    volumeTiketPesawat:
      item?.volumeTiketPesawat === undefined && jenis === "Luar Daerah"
        ? 2
        : Number(item?.volumeTiketPesawat) || 0,
    transportBandaraAsal: Number(item?.transportBandaraAsal) || 0,
    volumeTransportBandaraAsal:
      item?.volumeTransportBandaraAsal === undefined && jenis === "Luar Daerah"
        ? 2
        : Number(item?.volumeTransportBandaraAsal) || 0,
    transportBandaraTujuan: Number(item?.transportBandaraTujuan) || 0,
    volumeTransportBandaraTujuan:
      item?.volumeTransportBandaraTujuan === undefined &&
      jenis === "Luar Daerah"
        ? 2
        : Number(item?.volumeTransportBandaraTujuan) || 0,
    volume,
    total: Number(item?.total) || 0,
  };
};

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

interface CostInputPairProps {
  title: string;
  amountRegistration: UseFormRegisterReturn;
  volumeRegistration: UseFormRegisterReturn;
  volumeUnit: "Hari" | "Malam" | "Kali";
  formula: React.ReactNode;
}

function CostInputPair({
  title,
  amountRegistration,
  volumeRegistration,
  volumeUnit,
  formula,
}: CostInputPairProps) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3">
      <p className="mb-2 border-b border-border/60 pb-2 text-[10px] font-extrabold uppercase text-foreground">
        {title}
      </p>
      <div className="grid grid-cols-2 items-start gap-3">
        <label className="block space-y-1">
          <span className="block text-[9px] font-bold uppercase text-muted-foreground">
            Nominal (Rp)
          </span>
          <Input type="number" min={0} {...amountRegistration} />
        </label>
        <label className="block space-y-1">
          <span className="block text-[9px] font-bold uppercase text-muted-foreground">
            Volume ({volumeUnit})
          </span>
          <Input type="number" min={0} {...volumeRegistration} />
        </label>
      </div>
      <div className="min-h-5">{formula}</div>
    </div>
  );
}

interface NotaDinasFormProps {
  initialValues?: NotaDinas | null;
  defaultPengirimJabatan: string;
  loginPenandatangan: Penandatangan | null;
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  sbms: SBM[];
  dipas: DIPA[];
  notas: NotaDinas[];
  onSubmit: (data: Omit<NotaDinas, "id">) => void;
  onCancel: () => void;
  onGenerateNomor: (date: string) => string;
  onNumberReserved: (number: string) => void;
  onFindTravelConflicts: (
    input: TravelConflictCheck,
  ) => NotaDinasTravelConflict[];
  onTravelConflictsDetected: (conflicts: NotaDinasTravelConflict[]) => void;
}

export function NotaDinasForm({
  initialValues,
  defaultPengirimJabatan,
  loginPenandatangan,
  pegawais,
  penandatangans,
  sbms,
  dipas,
  notas,
  onSubmit,
  onCancel,
  onGenerateNomor,
  onNumberReserved,
  onFindTravelConflicts,
  onTravelConflictsDetected,
}: NotaDinasFormProps) {
  const today = new Date().toISOString().split("T")[0];
  const [numberError, setNumberError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof notaDinasSchema>>({
    resolver: zodResolver(notaDinasSchema),
    defaultValues: {
      kepada: "Sekretaris KPU Kabupaten Gorontalo",
      dari: defaultPengirimJabatan,
      tembusan: "",
      nomor: "",
      tanggal: today,
      tanggalBerangkat: today,
      tanggalKembali: today,
      lokasiTujuan: "",
      sifat: "Biasa",
      perihal: "",
      isi: "",
      dipaId: "",
      penandatanganId: "",
      penandatanganSnapshot: null,
      jenis: "Luar Kota",
      status: "Draft",
      totalBiaya: 0,
      travelConflicts: [],
      lampiran: [createEmptyLampiranItem()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lampiran",
  });

  const watchJenis = useWatch({ control, name: "jenis" });
  const watchTanggal = useWatch({ control, name: "tanggal" });
  const watchNomor = useWatch({ control, name: "nomor" });
  const watchTanggalBerangkat = useWatch({
    control,
    name: "tanggalBerangkat",
  });
  const watchTanggalKembali = useWatch({
    control,
    name: "tanggalKembali",
  });
  const watchLampiran = useWatch({ control, name: "lampiran" }) || [];
  const watchTotalBiaya = useWatch({ control, name: "totalBiaya" });
  const watchDipaId = useWatch({ control, name: "dipaId" });
  const selectedDipa = dipas.find((item) => item.id === watchDipaId);
  const budgetAvailability = getDipaBudgetAvailability({
    dipa: selectedDipa,
    notas,
    currentTotal: watchTotalBiaya || 0,
    excludeNotaDinasId: initialValues?.id,
  });
  const conflictsByLampiran = watchLampiran.map((item) =>
    onFindTravelConflicts({
      pegawaiId: item.pegawaiId,
      tanggalBerangkat: watchTanggalBerangkat,
      tanggalKembali: watchTanggalKembali,
    }),
  );
  const masterPenandatangan = penandatangans.find(
    (item) => item.id === initialValues?.penandatanganId,
  );
  const lockedPenandatangan = initialValues
    ? masterPenandatangan
    : loginPenandatangan;
  const lockedPenandatanganName =
    initialValues?.penandatanganSnapshot?.nama ??
    lockedPenandatangan?.nama ??
    "";
  const lockedPenandatanganJabatan =
    initialValues?.penandatanganSnapshot?.jabatanPenandatangan ??
    lockedPenandatangan?.jabatanPenandatangan ??
    "";
  const lockedPenandatanganLabel = lockedPenandatanganName
    ? `${lockedPenandatanganName} — ${lockedPenandatanganJabatan}`
    : "Pejabat penandatangan belum terhubung dengan akun login";
  const loginPenandatanganAvailable = Boolean(
    loginPenandatangan &&
    isPenandatanganAvailable(loginPenandatangan, "Nota Dinas", watchTanggal),
  );
  const notaDinasApprover = resolveNotaDinasApprover(
    penandatangans,
    watchTanggal,
  );
  const approvalDestination =
    getNotaDinasApprovalDestination(notaDinasApprover);

  // Sync initial values
  useEffect(() => {
    if (initialValues) {
      setValue("kepada", initialValues.kepada);
      setValue("dari", initialValues.dari);
      setValue("tembusan", initialValues.tembusan || "");
      setValue("nomor", initialValues.nomor);
      setValue("tanggal", initialValues.tanggal);
      setValue("tanggalBerangkat", initialValues.tanggalBerangkat || "");
      setValue("tanggalKembali", initialValues.tanggalKembali || "");
      setValue("lokasiTujuan", initialValues.lokasiTujuan || "");
      setValue("sifat", initialValues.sifat);
      setValue("perihal", initialValues.perihal);
      setValue("isi", initialValues.isi);
      setValue("dipaId", initialValues.dipaId ?? "");
      setValue("penandatanganId", initialValues.penandatanganId);
      setValue(
        "penandatanganSnapshot",
        initialValues.penandatanganSnapshot ?? null,
      );
      setValue("jenis", initialValues.jenis);
      setValue("status", initialValues.status);
      setValue("lampiran", initialValues.lampiran);
      setValue("totalBiaya", initialValues.totalBiaya);
      setValue("travelConflicts", initialValues.travelConflicts ?? []);
      return;
    }

    setValue("kepada", "Sekretaris KPU Kabupaten Gorontalo");
    setValue("dari", defaultPengirimJabatan);
    setValue("penandatanganId", loginPenandatangan?.id ?? "");
    setValue("penandatanganSnapshot", null);
  }, [defaultPengirimJabatan, initialValues, loginPenandatangan, setValue]);

  // SBM cross-reference helper
  const handlePegawaiChange = (index: number, pegawaiId: string) => {
    if (!pegawaiId) return;

    // Search default SBM based on travel type
    let defaultHarian = 0;
    let defaultHarianFull = 0;
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
      const matchHarianFull = sbms.find(
        (s) =>
          s.jenisBiaya.toLowerCase().includes("luar daerah") ||
          s.jenisBiaya.toLowerCase().includes("dki jakarta"),
      );
      const matchHarianMeeting = sbms.find((s) =>
        s.jenisBiaya.toLowerCase().includes("paket meeting"),
      );
      const matchHotel = sbms.find(
        (s) =>
          s.jenisBiaya.toLowerCase().includes("hotel") ||
          s.jenisBiaya.toLowerCase().includes("akomodasi"),
      );
      defaultHarian =
        matchHarianMeeting?.tarif ?? matchHarianFull?.tarif ?? 530000;
      defaultHarianFull = matchHarianFull?.tarif ?? 530000;
      defaultHotel = matchHotel ? matchHotel.tarif : 1200000;
      defaultTransport = 250000;
    }

    const suggestedVolume = Math.max(
      1,
      Number(getValues(`lampiran.${index}.volume`)) || 1,
    );

    setValue(`lampiran.${index}.uangHarian`, defaultHarian);
    setValue(
      `lampiran.${index}.volumeUangHarian`,
      watchJenis === "Luar Daerah" ? 0 : suggestedVolume,
    );
    setValue(
      `lampiran.${index}.volumeUangHarianPaketMeeting`,
      watchJenis === "Luar Daerah" ? suggestedVolume : 0,
    );
    setValue(`lampiran.${index}.uangHarianFull`, defaultHarianFull);
    setValue(`lampiran.${index}.volumeUangHarianFull`, 0);
    setValue(`lampiran.${index}.uangTransport`, defaultTransport);
    setValue(`lampiran.${index}.volumeUangTransport`, suggestedVolume);
    setValue(`lampiran.${index}.penginapan`, defaultHotel);
    setValue(
      `lampiran.${index}.volumePenginapan`,
      watchJenis === "Luar Daerah"
        ? Math.max(0, suggestedVolume - 1)
        : watchJenis === "Luar Kota"
          ? suggestedVolume
          : 0,
    );
    setValue(
      `lampiran.${index}.tiketPesawat`,
      watchJenis === "Luar Daerah" ? 2500000 : 0,
    );
    setValue(
      `lampiran.${index}.volumeTiketPesawat`,
      watchJenis === "Luar Daerah" ? 2 : 0,
    );
    setValue(
      `lampiran.${index}.transportBandaraAsal`,
      watchJenis === "Luar Daerah" ? 250000 : 0,
    );
    setValue(
      `lampiran.${index}.volumeTransportBandaraAsal`,
      watchJenis === "Luar Daerah" ? 2 : 0,
    );
    setValue(
      `lampiran.${index}.transportBandaraTujuan`,
      watchJenis === "Luar Daerah" ? 250000 : 0,
    );
    setValue(
      `lampiran.${index}.volumeTransportBandaraTujuan`,
      watchJenis === "Luar Daerah" ? 2 : 0,
    );

    queueMicrotask(() => triggerCalculations());
  };

  // Recalculate row & grand total
  const recalculateLampiran = (jenis: NotaDinas["jenis"]) => {
    let grandTotal = 0;
    const currentLampiran = getValues("lampiran") || [];

    currentLampiran.forEach((item, idx) => {
      const rowTotal = calculateLampiranTotal(
        toCalculationItem(item, jenis),
        jenis,
      );

      setValue(`lampiran.${idx}.total`, rowTotal);
      grandTotal += rowTotal;
    });

    setValue("totalBiaya", grandTotal);
  };

  const triggerCalculations = () =>
    recalculateLampiran(getValues("jenis") ?? "Luar Kota");

  const getCurrentCostLine = (index: number, key: LampiranCostKey) =>
    getLampiranCostLines(
      toCalculationItem(watchLampiran[index], watchJenis ?? "Luar Kota"),
      watchJenis ?? "Luar Kota",
    ).find((line) => line.key === key);

  const renderCostFormula = (index: number, key: LampiranCostKey) => {
    const line = getCurrentCostLine(index, key);
    if (!line) return null;
    return (
      <p className="mt-1 text-[9px] font-semibold text-muted-foreground">
        × {line.quantity} {line.unit} = {formatRupiah(line.subtotal)}
      </p>
    );
  };

  // Handle Ambil Nomor
  const handleAmbilNomor = () => {
    if (watchNomor) return;
    try {
      const generated = onGenerateNomor(watchTanggal);
      setValue("nomor", generated);
      setValue("status", "Nomor Diambil");
      setNumberError("");
      onNumberReserved(generated);
    } catch (error) {
      setNumberError(
        error instanceof Error
          ? error.message
          : "Nomor Nota Dinas belum dapat diambil.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        const rest = { ...data };
        delete rest.id;
        const authoritativePenandatanganId = initialValues
          ? initialValues.penandatanganId
          : loginPenandatangan?.id;

        if (!authoritativePenandatanganId) {
          setError("penandatanganId", {
            type: "manual",
            message:
              "Akun login belum terhubung dengan Pejabat Penandatangan Nota Dinas.",
          });
          return;
        }

        if (!initialValues && !loginPenandatanganAvailable) {
          setError("penandatanganId", {
            type: "manual",
            message:
              "Pejabat penandatangan akun login tidak aktif atau berada di luar periode berlaku.",
          });
          return;
        }

        rest.penandatanganId = authoritativePenandatanganId;
        const detectedConflicts = Array.from(
          new Map(
            (rest.lampiran || [])
              .flatMap((item) =>
                onFindTravelConflicts({
                  pegawaiId: item.pegawaiId,
                  tanggalBerangkat: rest.tanggalBerangkat,
                  tanggalKembali: rest.tanggalKembali,
                }),
              )
              .map((conflict) => [
                [
                  conflict.pegawaiId,
                  conflict.notaDinasId,
                  conflict.tanggalBerangkat,
                  conflict.tanggalKembali,
                ].join("|"),
                conflict,
              ]),
          ).values(),
        );

        if (detectedConflicts.length > 0) {
          onTravelConflictsDetected(detectedConflicts);
        }

        const normalizedJenis = rest.jenis || "Luar Kota";
        const normalizedLampiran = (rest.lampiran || []).map((item) => {
          const normalized = toCalculationItem(item, normalizedJenis);
          return {
            ...normalized,
            total: calculateLampiranTotal(normalized, normalizedJenis),
          };
        });

        const normalizedTotalBiaya = normalizedLampiran.reduce(
          (sum, item) => sum + item.total,
          0,
        );
        const submitDipa = dipas.find((item) => item.id === rest.dipaId);
        const submitBudget = getDipaBudgetAvailability({
          dipa: submitDipa,
          notas,
          currentTotal: normalizedTotalBiaya,
          excludeNotaDinasId: initialValues?.id,
        });
        if (
          rest.status === "Menunggu Approval" &&
          (!submitDipa || submitBudget.exceeded)
        ) {
          setError("dipaId", {
            type: "manual",
            message: !submitDipa
              ? "Sumber Anggaran DIPA wajib dipilih sebelum dikirim."
              : `Usulan melampaui sisa pagu ${formatRupiah(submitBudget.available)}. Pilih sumber DIPA lain atau kurangi anggaran.`,
          });
          return;
        }

        onSubmit({
          ...rest,
          penandatanganSnapshot: initialValues?.penandatanganSnapshot ?? null,
          sifat: rest.sifat || "Biasa",
          jenis: rest.jenis || "Luar Kota",
          tembusan: rest.tembusan || "",
          status: rest.status || "Draft",
          totalBiaya: normalizedTotalBiaya,
          travelConflicts: detectedConflicts,
          lampiran: normalizedLampiran,
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
            <Input
              {...register("dari")}
              error={!!errors.dari}
              readOnly
              aria-readonly="true"
              className="bg-muted/50"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Diisi otomatis dari jabatan pengguna yang sedang login.
            </p>
            {errors.dari && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.dari.message}
              </p>
            )}
          </div>

          {!initialValues && !defaultPengirimJabatan && (
            <Alert variant="warning" title="Jabatan pengirim belum tersedia">
              Akun ini belum terhubung ke Master Pegawai dan Master Jabatan.
              Lengkapi pemetaan akun sebelum menyimpan Nota Dinas.
            </Alert>
          )}

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

          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-[10px] font-bold uppercase text-foreground">
              Rencana Perjalanan
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                  Tanggal Berangkat
                </label>
                <Input
                  type="date"
                  {...register("tanggalBerangkat")}
                  error={!!errors.tanggalBerangkat}
                />
                {errors.tanggalBerangkat && (
                  <p className="text-[10px] text-danger font-bold mt-1">
                    {errors.tanggalBerangkat.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                  Tanggal Kembali
                </label>
                <Input
                  type="date"
                  {...register("tanggalKembali")}
                  error={!!errors.tanggalKembali}
                />
                {errors.tanggalKembali && (
                  <p className="text-[10px] text-danger font-bold mt-1">
                    {errors.tanggalKembali.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[9px] font-bold text-muted-foreground uppercase mb-1">
                Lokasi Tujuan
              </label>
              <Input
                {...register("lokasiTujuan")}
                error={!!errors.lokasiTujuan}
                placeholder="Contoh: KPU Provinsi Gorontalo"
              />
              {errors.lokasiTujuan && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.lokasiTujuan.message}
                </p>
              )}
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
                disabled={Boolean(watchNomor)}
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
            {numberError && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {numberError}
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
                const jenis = e.target.value as NotaDinas["jenis"];
                setValue("jenis", jenis);
                queueMicrotask(() => recalculateLampiran(jenis));
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
              Pejabat Penandatangan (Terkunci)
            </label>
            <input type="hidden" {...register("penandatanganId")} />
            <Input value={lockedPenandatanganLabel} readOnly />
            {!initialValues && !loginPenandatangan && (
              <p className="text-[10px] text-warning font-bold mt-1">
                Hubungkan akun login ke Master Pegawai dan Master Pejabat
                Penandatangan sebelum membuat Nota Dinas.
              </p>
            )}
            {!initialValues && loginPenandatangan && (
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                Otomatis mengikuti pejabat yang terhubung dengan akun login dan
                tidak dapat diganti dari form ini.
              </p>
            )}
            {initialValues && (
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                Penandatangan dokumen tersimpan dipertahankan saat diedit.
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
              <option value="Menunggu Approval">
                Kirim ke {approvalDestination}
              </option>
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
            <p className="mt-1 text-[10px] text-muted-foreground">
              {notaDinasApprover
                ? `Pejabat approval aktif: ${notaDinasApprover.nama} — ${notaDinasApprover.jabatanPenandatangan}`
                : "Administrator belum menetapkan Sekretaris/PLH/PLT Sekretaris aktif untuk tanggal Nota Dinas ini."}
            </p>
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
                onClick={() => append(createEmptyLampiranItem())}
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

            <div className="max-h-[560px] space-y-4 overflow-y-auto pr-2">
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
                      {conflictsByLampiran[index]?.length > 0 && (
                        <Alert
                          variant="error"
                          title="Potensi perjalanan dinas ganda"
                          className="mt-2 border-danger/50 bg-danger/10 p-3 [&_div]:text-danger [&_p]:text-danger"
                          role="alert"
                        >
                          <ul className="space-y-1">
                            {conflictsByLampiran[index].map((conflict) => (
                              <li
                                key={`${conflict.notaDinasId}-${conflict.tanggalBerangkat}-${conflict.tanggalKembali}`}
                              >
                                Personel sudah tercantum pada Nota Dinas Nomor{" "}
                                <strong>{conflict.nomorNotaDinas}</strong>,
                                perjalanan{" "}
                                {formatTanggal(conflict.tanggalBerangkat)} s.d.{" "}
                                {formatTanggal(conflict.tanggalKembali)} ke{" "}
                                <strong>{conflict.lokasiTujuan}</strong>.
                              </li>
                            ))}
                          </ul>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Dynamic cost pairs based on travel type */}
                  <div className="grid grid-cols-1 gap-3 border-t border-border/60 pt-3 xl:grid-cols-2">
                    <CostInputPair
                      title={
                        watchJenis === "Luar Daerah"
                          ? "Uang Harian Paket Meeting"
                          : "Uang Harian"
                      }
                      amountRegistration={register(
                        `lampiran.${index}.uangHarian` as const,
                        {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        },
                      )}
                      volumeRegistration={register(
                        watchJenis === "Luar Daerah"
                          ? (`lampiran.${index}.volumeUangHarianPaketMeeting` as const)
                          : (`lampiran.${index}.volumeUangHarian` as const),
                        {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        },
                      )}
                      volumeUnit="Hari"
                      formula={renderCostFormula(index, "uangHarian")}
                    />

                    {watchJenis === "Luar Daerah" && (
                      <CostInputPair
                        title="Uang Harian Full"
                        amountRegistration={register(
                          `lampiran.${index}.uangHarianFull` as const,
                          {
                            valueAsNumber: true,
                            onChange: triggerCalculations,
                          },
                        )}
                        volumeRegistration={register(
                          `lampiran.${index}.volumeUangHarianFull` as const,
                          {
                            valueAsNumber: true,
                            onChange: triggerCalculations,
                          },
                        )}
                        volumeUnit="Hari"
                        formula={renderCostFormula(index, "uangHarianFull")}
                      />
                    )}

                    <CostInputPair
                      title={
                        watchJenis === "Luar Daerah"
                          ? "Transport"
                          : "Uang Transport"
                      }
                      amountRegistration={register(
                        `lampiran.${index}.uangTransport` as const,
                        {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        },
                      )}
                      volumeRegistration={register(
                        `lampiran.${index}.volumeUangTransport` as const,
                        {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        },
                      )}
                      volumeUnit="Hari"
                      formula={renderCostFormula(index, "uangTransport")}
                    />

                    {watchJenis !== "Dalam Kota" && (
                      <CostInputPair
                        title="Hotel / Penginapan"
                        amountRegistration={register(
                          `lampiran.${index}.penginapan` as const,
                          {
                            valueAsNumber: true,
                            onChange: triggerCalculations,
                          },
                        )}
                        volumeRegistration={register(
                          `lampiran.${index}.volumePenginapan` as const,
                          {
                            valueAsNumber: true,
                            onChange: triggerCalculations,
                          },
                        )}
                        volumeUnit="Malam"
                        formula={renderCostFormula(index, "penginapan")}
                      />
                    )}

                    {watchJenis === "Luar Daerah" && (
                      <>
                        <CostInputPair
                          title="Tiket Pesawat"
                          amountRegistration={register(
                            `lampiran.${index}.tiketPesawat` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeRegistration={register(
                            `lampiran.${index}.volumeTiketPesawat` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeUnit="Kali"
                          formula={renderCostFormula(index, "tiketPesawat")}
                        />
                        <CostInputPair
                          title="Transport Bandara Asal"
                          amountRegistration={register(
                            `lampiran.${index}.transportBandaraAsal` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeRegistration={register(
                            `lampiran.${index}.volumeTransportBandaraAsal` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeUnit="Kali"
                          formula={renderCostFormula(
                            index,
                            "transportBandaraAsal",
                          )}
                        />
                        <CostInputPair
                          title="Transport Bandara Tujuan"
                          amountRegistration={register(
                            `lampiran.${index}.transportBandaraTujuan` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeRegistration={register(
                            `lampiran.${index}.volumeTransportBandaraTujuan` as const,
                            {
                              valueAsNumber: true,
                              onChange: triggerCalculations,
                            },
                          )}
                          volumeUnit="Kali"
                          formula={renderCostFormula(
                            index,
                            "transportBandaraTujuan",
                          )}
                        />
                      </>
                    )}
                  </div>

                  <div className="grid gap-3 rounded-xl border border-dashed border-border bg-muted/30 p-3 sm:grid-cols-[minmax(150px,220px)_1fr] sm:items-end">
                    <label className="block space-y-1">
                      <span className="block text-[9px] font-bold uppercase text-muted-foreground">
                        Durasi Perjalanan (Hari)
                      </span>
                      <Input
                        type="number"
                        min={1}
                        {...register(`lampiran.${index}.volume` as const, {
                          valueAsNumber: true,
                          onChange: triggerCalculations,
                        })}
                      />
                    </label>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Durasi hanya sebagai referensi tanggal perjalanan. Nominal
                      dan volume setiap komponen biaya diisi serta dihitung
                      secara terpisah.
                    </p>
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
                }).format(watchTotalBiaya || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div className="border-b border-border pb-2">
              <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase text-foreground">
                <Hash className="h-4 w-4 text-primary" /> Sumber Anggaran
              </h2>
            </div>
            <label className="block space-y-1">
              <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                Sumber Anggaran DIPA
              </span>
              <Select {...register("dipaId")} error={!!errors.dipaId}>
                <option value="">-- Pilih Sumber Anggaran DIPA --</option>
                {dipas.map((dipa) => {
                  const availability = getDipaBudgetAvailability({
                    dipa,
                    notas,
                    currentTotal: 0,
                    excludeNotaDinasId: initialValues?.id,
                  });
                  return (
                    <option key={dipa.id} value={dipa.id}>
                      {dipa.kodeDipa} - {dipa.akunPerjalananDinas} (
                      {dipa.tahunAnggaran}) - Sisa{" "}
                      {formatRupiah(availability.available)}
                    </option>
                  );
                })}
              </Select>
              {errors.dipaId && (
                <p className="text-[10px] font-bold text-danger">
                  {errors.dipaId.message}
                </p>
              )}
            </label>

            {selectedDipa && (
              <div className="grid gap-3 rounded-lg bg-muted/40 p-3 text-[10px] sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <span className="block text-muted-foreground">Pagu</span>
                  <strong>{formatRupiah(budgetAvailability.pagu)}</strong>
                </div>
                <div>
                  <span className="block text-muted-foreground">
                    Komitmen Lain
                  </span>
                  <strong>{formatRupiah(budgetAvailability.committed)}</strong>
                </div>
                <div>
                  <span className="block text-muted-foreground">
                    Sisa Tersedia
                  </span>
                  <strong>{formatRupiah(budgetAvailability.available)}</strong>
                </div>
                <div>
                  <span className="block text-muted-foreground">
                    Usulan Ini
                  </span>
                  <strong>
                    {formatRupiah(budgetAvailability.currentTotal)}
                  </strong>
                </div>
              </div>
            )}

            {selectedDipa && budgetAvailability.exceeded && (
              <Alert variant="error" title="Pagu Anggaran Terlampaui">
                Total usulan menjadi{" "}
                {formatRupiah(budgetAvailability.projected)}, melebihi pagu{" "}
                {formatRupiah(budgetAvailability.pagu)}. Nota Dinas tidak dapat
                dikirim ke Sekretaris sampai sumber anggaran diganti atau usulan
                dikurangi.
              </Alert>
            )}
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
