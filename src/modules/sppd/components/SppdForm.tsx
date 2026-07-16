"use client";

import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  FileCheck,
  MapPin,
  Route,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import {
  DEFAULT_INSTANSI,
  SPPD_STATUS_OPTIONS,
  TRANSPORTASI_OPTIONS,
} from "../sppd.constants";
import { type Sppd, type SppdFormValues, sppdSchema } from "../sppd.schema";

interface SppdFormProps {
  initialValues?: Sppd | null;
  approvedSpts: Spt[];
  existingSppds: Sppd[];
  pegawais: Pegawai[];
  dipas: DIPA[];
  penandatangans: Penandatangan[];
  isSaving: boolean;
  onSubmit: (data: Omit<Sppd, "id">) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split("T")[0];

const calculateDuration = (start?: string, end?: string) => {
  if (!start || !end) return 1;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate < startDate
  ) {
    return 1;
  }

  const diff = endDate.getTime() - startDate.getTime();
  return Math.floor(diff / 86_400_000) + 1;
};

const getSequenceFromSptNumber = (nomorSpt: string) => {
  const parsed = Number(nomorSpt.split("/")[0]?.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

type Page2Signer = NonNullable<Sppd["tandaTanganHalaman2"]>[number];

const normalizePage2Signer = (item?: Partial<Page2Signer>): Page2Signer => ({
  tibaDi: item?.tibaDi ?? "",
  tanggalTiba: item?.tanggalTiba ?? "",
  berangkatDari: item?.berangkatDari ?? "",
  ke: item?.ke ?? "",
  tanggalBerangkat: item?.tanggalBerangkat ?? "",
  jabatan: item?.jabatan ?? "",
  nama: item?.nama ?? "",
  nip: item?.nip ?? "",
});

export function SppdForm({
  initialValues,
  approvedSpts,
  existingSppds,
  pegawais,
  dipas,
  penandatangans,
  isSaving,
  onSubmit,
  onCancel,
}: SppdFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<SppdFormValues>({
    resolver: zodResolver(sppdSchema),
    defaultValues: {
      nomor: "",
      sptId: "",
      personil: [],
      maksud: "",
      transportasi: "",
      tempatBerangkat: "Limboto",
      tempatTujuan: "",
      tanggalBerangkat: today,
      tanggalKembali: today,
      lamaPerjalanan: 1,
      instansi: DEFAULT_INSTANSI,
      dipaId: "",
      penandatanganId: "",
      jumlahKolomHalaman2: 6,
      tandaTanganHalaman2: [],
      status: "Draft",
    },
  });

  const { fields: tandaTanganFields, replace: replaceTandaTangan } =
    useFieldArray({
      control,
      name: "tandaTanganHalaman2",
    });

  const selectedSptId = useWatch({ control, name: "sptId" });
  const tanggalBerangkat = useWatch({ control, name: "tanggalBerangkat" });
  const tanggalKembali = useWatch({ control, name: "tanggalKembali" });
  const personil = useWatch({ control, name: "personil" }) ?? [];
  const selectedSpt = approvedSpts.find((item) => item.id === selectedSptId);

  useEffect(() => {
    if (!initialValues) return;

    setValue("nomor", initialValues.nomor);
    setValue("sptId", initialValues.sptId);
    setValue("personil", initialValues.personil);
    setValue("maksud", initialValues.maksud);
    setValue("transportasi", initialValues.transportasi);
    setValue("tempatBerangkat", initialValues.tempatBerangkat);
    setValue("tempatTujuan", initialValues.tempatTujuan);
    setValue("tanggalBerangkat", initialValues.tanggalBerangkat);
    setValue("tanggalKembali", initialValues.tanggalKembali);
    setValue("lamaPerjalanan", initialValues.lamaPerjalanan);
    setValue("instansi", initialValues.instansi);
    setValue("dipaId", initialValues.dipaId);
    setValue("penandatanganId", initialValues.penandatanganId);
    setValue("jumlahKolomHalaman2", initialValues.jumlahKolomHalaman2 ?? 6);
    replaceTandaTangan(
      (initialValues.tandaTanganHalaman2 ?? []).map(normalizePage2Signer),
    );
    setValue("status", initialValues.status);
  }, [initialValues, replaceTandaTangan, setValue]);

  useEffect(() => {
    const duration = calculateDuration(tanggalBerangkat, tanggalKembali);
    setValue("lamaPerjalanan", duration, { shouldValidate: true });
  }, [tanggalBerangkat, tanggalKembali, setValue]);

  const handleSptChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sptId = event.target.value;
    const nextSpt = approvedSpts.find((item) => item.id === sptId);
    const existingSameSpt = existingSppds.find((item) => item.sptId === sptId);

    setValue("sptId", sptId, { shouldValidate: true });

    if (!nextSpt) {
      setValue("nomor", "", { shouldValidate: true });
      setValue("personil", [], { shouldValidate: true });
      return;
    }

    const tanggalBerangkat =
      existingSameSpt?.tanggalBerangkat ?? nextSpt.tanggalMulai;
    setValue(
      "nomor",
      penomoranService.formatNumber(
        "SPPD",
        getSequenceFromSptNumber(nextSpt.nomor),
        tanggalBerangkat,
      ),
      { shouldValidate: true },
    );
    setValue("personil", [], { shouldValidate: true });
    setValue("maksud", existingSameSpt?.maksud ?? nextSpt.untuk[0]?.text ?? "", {
      shouldValidate: true,
    });
    setValue("transportasi", existingSameSpt?.transportasi ?? "", {
      shouldValidate: true,
    });
    setValue("tempatBerangkat", existingSameSpt?.tempatBerangkat ?? "Limboto", {
      shouldValidate: true,
    });
    setValue("tempatTujuan", existingSameSpt?.tempatTujuan ?? "", {
      shouldValidate: true,
    });
    setValue("tanggalBerangkat", tanggalBerangkat, {
      shouldValidate: true,
    });
    setValue("tanggalKembali", existingSameSpt?.tanggalKembali ?? nextSpt.tanggalSelesai, {
      shouldValidate: true,
    });
    setValue("instansi", existingSameSpt?.instansi ?? DEFAULT_INSTANSI, {
      shouldValidate: true,
    });
    setValue("dipaId", existingSameSpt?.dipaId ?? "", {
      shouldValidate: true,
    });
    setValue("penandatanganId", existingSameSpt?.penandatanganId ?? "", {
      shouldValidate: true,
    });
    setValue("jumlahKolomHalaman2", existingSameSpt?.jumlahKolomHalaman2 ?? 6, {
      shouldValidate: true,
    });
    replaceTandaTangan(
      (existingSameSpt?.tandaTanganHalaman2 ?? []).map(normalizePage2Signer),
    );
  };

  const handleJumlahTandaTanganChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const count = Math.max(Number(event.target.value), 1);
    const manualCount = Math.max(count - 1, 0);
    const currentTandaTangan = getValues("tandaTanganHalaman2") ?? [];
    replaceTandaTangan(
      Array.from({ length: manualCount }, (_, index) => ({
        ...normalizePage2Signer(currentTandaTangan[index]),
      })),
    );
    setValue("jumlahKolomHalaman2", count, { shouldValidate: true });
  };

  const handlePersonilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pegawaiId = event.target.value;
    setValue(
      "personil",
      pegawaiId ? [{ pegawaiId }] : [],
      { shouldValidate: true },
    );
  };

  const getPegawaiLabel = (pegawaiId: string) => {
    const pegawai = pegawais.find((item) => item.id === pegawaiId);
    return pegawai
      ? `${pegawai.nama} / NIP. ${pegawai.nip || "-"}`
      : "Personil tidak ditemukan";
  };

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onSubmit({
          nomor: data.nomor,
          sptId: data.sptId,
          personil: data.personil.map((item) => ({
            pegawaiId: item.pegawaiId,
          })),
          maksud: data.maksud,
          transportasi: data.transportasi,
          tempatBerangkat: data.tempatBerangkat,
          tempatTujuan: data.tempatTujuan,
          tanggalBerangkat: data.tanggalBerangkat,
          tanggalKembali: data.tanggalKembali,
          lamaPerjalanan: Number(data.lamaPerjalanan),
          instansi: data.instansi || DEFAULT_INSTANSI,
          dipaId: data.dipaId,
          penandatanganId: data.penandatanganId,
          jumlahKolomHalaman2: Number(data.jumlahKolomHalaman2 ?? 6),
          tandaTanganHalaman2: (data.tandaTanganHalaman2 ?? []).map(
            (item) => ({
              tibaDi: item.tibaDi ?? "",
              tanggalTiba: item.tanggalTiba ?? "",
              berangkatDari: item.berangkatDari ?? "",
              ke: item.ke ?? "",
              tanggalBerangkat: item.tanggalBerangkat ?? "",
              jabatan: item.jabatan ?? "",
              nama: item.nama ?? "",
              nip: item.nip ?? "",
            }),
          ),
          status: data.status ?? "Draft",
        });
      })}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="space-y-4 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase flex items-center gap-2 border-b border-border pb-2">
            <FileCheck className="w-4 h-4 text-primary" />
            Referensi Dokumen
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              SPT Disetujui
            </label>
            <Select
              value={selectedSptId}
              onChange={handleSptChange}
              error={!!errors.sptId}
            >
              <option value="">-- Pilih SPT --</option>
              {approvedSpts.map((spt) => (
                <option key={spt.id} value={spt.id}>
                  {spt.nomor} ({spt.personil.length} personil)
                </option>
              ))}
            </Select>
            {errors.sptId && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.sptId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Nomor SPPD
            </label>
            <div className="flex gap-2">
              <Input
                {...register("nomor")}
                readOnly
                placeholder="Otomatis mengikuti nomor SPT"
                error={!!errors.nomor}
                className="font-mono text-xs font-bold bg-muted"
              />
            </div>
            <p className="text-[10px] text-muted-foreground font-semibold mt-1">
              Nomor urut SPPD mengikuti nomor SPT referensi, dengan kode
              dokumen SPT diubah menjadi SPD.
            </p>
            {errors.nomor && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.nomor.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Akun DIPA
            </label>
            <Select {...register("dipaId")} error={!!errors.dipaId}>
              <option value="">-- Pilih Akun DIPA --</option>
              {dipas.map((dipa) => (
                <option key={dipa.id} value={dipa.id}>
                  {dipa.kodeDipa} - {dipa.program}
                </option>
              ))}
            </Select>
            {errors.dipaId && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.dipaId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Pejabat Penandatangan
            </label>
            <Select
              {...register("penandatanganId")}
              error={!!errors.penandatanganId}
            >
              <option value="">-- Pilih Pejabat --</option>
              {penandatangans.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.peran})
                </option>
              ))}
            </Select>
            {errors.penandatanganId && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.penandatanganId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Romawi Halaman 2
            </label>
            <Input
              type="number"
              min={1}
              {...register("jumlahKolomHalaman2")}
              onChange={handleJumlahTandaTanganChange}
            />
            {tandaTanganFields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-1 rounded-xl border border-border bg-background p-3"
              >
                <p className="text-[10px] font-black uppercase text-muted-foreground">
                  Romawi {index + 2}
                </p>
                <div className="rounded-lg border border-dashed border-border p-2">
                  <p className="mb-2 text-[10px] font-black uppercase text-muted-foreground">
                    Riwayat Perjalanan
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input
                      placeholder="Tiba di"
                      {...register(`tandaTanganHalaman2.${index}.tibaDi`)}
                    />
                    <Input
                      type="date"
                      placeholder="Tanggal tiba"
                      {...register(`tandaTanganHalaman2.${index}.tanggalTiba`)}
                    />
                    <Input
                      placeholder="Berangkat dari"
                      {...register(
                        `tandaTanganHalaman2.${index}.berangkatDari`,
                      )}
                    />
                    <Input
                      placeholder="Ke"
                      {...register(`tandaTanganHalaman2.${index}.ke`)}
                    />
                    <Input
                      type="date"
                      placeholder="Tanggal berangkat"
                      {...register(
                        `tandaTanganHalaman2.${index}.tanggalBerangkat`,
                      )}
                      className="md:col-span-2"
                    />
                  </div>
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    Jika field “Tiba di” kosong, sistem akan memakai tujuan
                    utama atau nilai “Ke” dari Romawi sebelumnya.
                  </p>
                </div>
                <p className="pt-1 text-[10px] font-black uppercase text-muted-foreground">
                  Penandatangan
                </p>
                <Input
                  placeholder="Jabatan penandatangan tujuan"
                  {...register(`tandaTanganHalaman2.${index}.jabatan`)}
                />
                <Input
                  placeholder="Nama penandatangan tujuan"
                  {...register(`tandaTanganHalaman2.${index}.nama`)}
                />
                <Input
                  placeholder="NIP penandatangan tujuan"
                  {...register(`tandaTanganHalaman2.${index}.nip`)}
                />
              </div>
            ))}
            <p className="text-[10px] text-muted-foreground font-semibold">
              Romawi I dan Romawi akhir otomatis memakai PPK SPPD. Romawi II
              dan seterusnya diisi manual; jika kosong, dokumen tetap kosong.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Status Approval
            </label>
            <Select {...register("status")} error={!!errors.status}>
              {SPPD_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4 bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-bold uppercase flex items-center gap-2 border-b border-border pb-2">
            <Route className="w-4 h-4 text-primary" />
            Data Perjalanan
          </h2>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
              Maksud Perjalanan
            </label>
            <Input
              {...register("maksud")}
              error={!!errors.maksud}
              placeholder="Maksud perjalanan dinas"
            />
            {errors.maksud && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.maksud.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Transportasi
              </label>
              <Select
                {...register("transportasi")}
                error={!!errors.transportasi}
              >
                <option value="">-- Pilih Transportasi --</option>
                {TRANSPORTASI_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
              {errors.transportasi && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.transportasi.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Tempat Berangkat
              </label>
              <Input
                {...register("tempatBerangkat")}
                error={!!errors.tempatBerangkat}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
              {errors.tempatBerangkat && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.tempatBerangkat.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Tempat Tujuan
              </label>
              <Input
                {...register("tempatTujuan")}
                error={!!errors.tempatTujuan}
                leftIcon={<MapPin className="w-4 h-4" />}
              />
              {errors.tempatTujuan && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.tempatTujuan.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
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
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                Lama Perjalanan
              </label>
              <Input
                type="number"
                {...register("lamaPerjalanan")}
                readOnly
                error={!!errors.lamaPerjalanan}
                rightIcon={<CalendarDays className="w-4 h-4" />}
                className="font-bold bg-muted"
              />
              {errors.lamaPerjalanan && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.lamaPerjalanan.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-2">
              Personil dari SPT
            </label>
            <Select
              value={personil[0]?.pegawaiId ?? ""}
              onChange={handlePersonilChange}
              error={!!errors.personil}
              disabled={!selectedSpt}
            >
              <option value="">-- Pilih satu personil --</option>
              {selectedSpt?.personil.map((item) => (
                <option key={item.pegawaiId} value={item.pegawaiId}>
                  {getPegawaiLabel(item.pegawaiId)}
                </option>
              ))}
            </Select>
            <div className="mt-2 rounded-xl border border-dashed border-border p-3 text-[11px] text-muted-foreground">
              <UserRound className="mr-1 inline h-3.5 w-3.5 text-primary" />
              SPPD dibuat per orang. Jika satu SPT berisi beberapa personil,
              buat SPPD terpisah untuk masing-masing personil. Field perjalanan
              dari SPPD dengan SPT yang sama akan otomatis disamakan; operator
              cukup memilih nama/personil.
            </div>
            {errors.personil && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.personil.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex justify-end gap-2 pt-4 pb-1 border-t border-border bg-card">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Menyimpan..."
            : initialValues
              ? "Simpan Perubahan"
              : "Simpan SPPD"}
        </Button>
      </div>
    </form>
  );
}
