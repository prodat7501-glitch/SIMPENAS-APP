"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Send, Trash2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Upload } from "@/components/ui/upload";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import {
  laporanSchema,
  type Laporan,
  type LaporanFormValues,
} from "../laporan.schema";

interface Props {
  initialValues: Laporan | null;
  spts: Spt[];
  sppds: Sppd[];
  pegawais: Pegawai[];
  isSaving: boolean;
  onSubmit: (data: Omit<Laporan, "id">) => Promise<void>;
  onCancel: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const formatTanggalIndonesia = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const uniqueText = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const DEFAULT_JUDUL_LAPORAN = "Laporan Perjalanan Dinas";
const DEFAULT_SURAT_TUGAS = "Sekretaris KPU";
const DEFAULT_TEMPAT_LAPORAN = "Limboto";

const buildDasarPelaksanaan = (
  suratTugas: string,
  nomor: string,
  tanggal: string,
) => `Surat Tugas\t: ${suratTugas}\nNomor\t: ${nomor}\nTanggal\t: ${tanggal}`;

const buildTempatWaktu = (tempat: string, hariTanggal: string) =>
  `Tempat Pelaksanaan\t: ${tempat}\nHari / Tanggal\t: ${hariTanggal}`;

const getSptIdFromReport = (
  item: Laporan | null,
  sppds: Sppd[],
): string => {
  if (!item) return "";
  if (item.sptId) return item.sptId;
  return sppds.find((sppd) => sppd.id === item.sppdId)?.sptId ?? "";
};

const getTanggalPelaksanaan = (relatedSppds: Sppd[], spt?: Spt) => {
  const first = relatedSppds[0];
  const start = first?.tanggalBerangkat ?? spt?.tanggalMulai ?? "";
  const end = first?.tanggalKembali ?? spt?.tanggalSelesai ?? "";

  if (!start && !end) return "";
  if (!end || start === end) return formatTanggalIndonesia(start);
  return `${formatTanggalIndonesia(start)} s.d. ${formatTanggalIndonesia(end)}`;
};

const resolveInitialValues = (
  item: Laporan | null,
  spts: Spt[],
  sppds: Sppd[],
): LaporanFormValues => {
  const sptId = getSptIdFromReport(item, sppds);
  const spt = spts.find((data) => data.id === sptId);
  const relatedSppds = sppds.filter((data) => data.sptId === sptId);
  const tempatPelaksanaan =
    item?.tempatPelaksanaan ||
    uniqueText(relatedSppds.map((data) => data.tempatTujuan)).join(", ");
  const hariTanggalPelaksanaan =
    item?.hariTanggalPelaksanaan || getTanggalPelaksanaan(relatedSppds, spt);
  const nomorSuratTugas = item?.nomorSuratTugas || spt?.nomor || "";
  const tanggalSuratTugas =
    item?.tanggalSuratTugas || formatTanggalIndonesia(spt?.tanggalMulai);

  return {
    sptId,
    sppdId: item?.sppdId || relatedSppds[0]?.id || "",
    pelaksanaId: item?.pelaksanaId || spt?.personil[0]?.pegawaiId || "",
    judulLaporan: item?.judulLaporan || DEFAULT_JUDUL_LAPORAN,
    suratTugas: item?.suratTugas || DEFAULT_SURAT_TUGAS,
    nomorSuratTugas,
    tanggalSuratTugas,
    dasarPelaksanaan:
      item?.dasarPelaksanaan ||
      buildDasarPelaksanaan(
        item?.suratTugas || DEFAULT_SURAT_TUGAS,
        nomorSuratTugas,
        tanggalSuratTugas,
      ),
    maksud: item?.maksud || relatedSppds[0]?.maksud || spt?.untuk[0]?.text || "",
    tujuan:
      item?.tujuan ||
      uniqueText(relatedSppds.map((data) => data.tempatTujuan)).join(", "),
    tempatPelaksanaan,
    hariTanggalPelaksanaan,
    tempatWaktu:
      item?.tempatWaktu ||
      buildTempatWaktu(tempatPelaksanaan, hariTanggalPelaksanaan),
    materi: item?.materi || "",
    hasilPelaksanaan: item?.hasilPelaksanaan || "",
    kalimatPenutup: item?.kalimatPenutup || "",
    dokumentasi: (item?.dokumentasi ?? []).map((foto) => ({
      ...foto,
      caption: foto.caption ?? "",
    })),
    tandaTangan: item?.tandaTangan || "manual",
    status: item?.status ?? "Draft",
    catatanVerifikasi: item?.catatanVerifikasi ?? "",
    tempatLaporan: item?.tempatLaporan ?? DEFAULT_TEMPAT_LAPORAN,
    tanggalLaporan: item?.tanggalLaporan ?? today(),
  };
};

export function LaporanForm({
  initialValues,
  spts,
  sppds,
  pegawais,
  isSaving,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    control,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<LaporanFormValues>({
    resolver: zodResolver(laporanSchema),
    defaultValues: resolveInitialValues(null, spts, sppds),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "dokumentasi",
  });
  const sptId = useWatch({ control, name: "sptId" });
  const status = useWatch({ control, name: "status" });
  const selectedSpt = spts.find((item) => item.id === sptId);
  const relatedSppds = sppds.filter((item) => item.sptId === sptId);

  useEffect(() => {
    reset(resolveInitialValues(initialValues, spts, sppds));
  }, [initialValues, reset, sppds, spts]);

  const selectSpt = (id: string) => {
    const spt = spts.find((item) => item.id === id);
    const related = sppds.filter((item) => item.sptId === id);
    const tempatPelaksanaan = uniqueText(
      related.map((item) => item.tempatTujuan),
    ).join(", ");
    const hariTanggalPelaksanaan = getTanggalPelaksanaan(related, spt);
    const nomorSuratTugas = spt?.nomor ?? "";
    const tanggalSuratTugas = formatTanggalIndonesia(spt?.tanggalMulai);

    setValue("sptId", id, { shouldValidate: true });
    setValue("sppdId", related[0]?.id ?? "", { shouldValidate: true });
    setValue("pelaksanaId", spt?.personil[0]?.pegawaiId ?? "");
    setValue("judulLaporan", DEFAULT_JUDUL_LAPORAN, { shouldValidate: true });
    setValue("suratTugas", DEFAULT_SURAT_TUGAS, { shouldValidate: true });
    setValue("nomorSuratTugas", nomorSuratTugas, { shouldValidate: true });
    setValue("tanggalSuratTugas", tanggalSuratTugas, { shouldValidate: true });
    setValue(
      "dasarPelaksanaan",
      buildDasarPelaksanaan(
        DEFAULT_SURAT_TUGAS,
        nomorSuratTugas,
        tanggalSuratTugas,
      ),
    );
    setValue("maksud", related[0]?.maksud ?? spt?.untuk[0]?.text ?? "", {
      shouldValidate: true,
    });
    setValue("tujuan", tempatPelaksanaan, { shouldValidate: true });
    setValue("tempatPelaksanaan", tempatPelaksanaan, {
      shouldValidate: true,
    });
    setValue("hariTanggalPelaksanaan", hariTanggalPelaksanaan, {
      shouldValidate: true,
    });
    setValue(
      "tempatWaktu",
      buildTempatWaktu(tempatPelaksanaan, hariTanggalPelaksanaan),
    );
  };

  const addFiles = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 100 * 1024 * 1024) continue;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      append({
        id: `${Date.now()}-${file.name}`,
        nama: file.name,
        dataUrl,
        caption: "",
      });
    }
  };

  const submit = handleSubmit(async (data) => {
    const payload = laporanSchema.parse({
      ...data,
      dasarPelaksanaan: buildDasarPelaksanaan(
        data.suratTugas,
        data.nomorSuratTugas,
        data.tanggalSuratTugas,
      ),
      tempatWaktu: buildTempatWaktu(
        data.tempatPelaksanaan,
        data.hariTanggalPelaksanaan,
      ),
      tandaTangan: "manual",
      dokumentasi: (data.dokumentasi ?? []).map((foto) => ({
        ...foto,
        caption: "",
      })),
    });
    await onSubmit(payload);
  });

  return (
    <form
      onSubmit={submit}
      className="space-y-6 max-h-[75vh] overflow-y-auto pr-2"
    >
      <label className="space-y-1 block">
        <span className="font-bold text-foreground">Judul Laporan</span>
        <Input {...register("judulLaporan")} />
        <Error text={errors.judulLaporan?.message} />
      </label>

      <div className="grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <label className="space-y-1">
          <span className="font-bold text-foreground">Nomor SPT</span>
          <Select
            value={sptId}
            onChange={(e) => selectSpt(e.target.value)}
            disabled={!!initialValues}
          >
            <option value="">Pilih Nomor SPT</option>
            {spts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nomor}
              </option>
            ))}
          </Select>
          <Error text={errors.sptId?.message} />
        </label>
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-xs">
          <p className="mb-2 flex items-center gap-2 font-bold text-foreground">
            <UsersRound className="h-4 w-4 text-primary" />
            Pelaksana sesuai SPT
          </p>
          {!selectedSpt ? (
            <p className="text-muted-foreground">
              Pilih Nomor SPT untuk melihat daftar pelaksana.
            </p>
          ) : (
            <ol className="list-decimal space-y-1 pl-4">
              {sortByPegawaiOrder(
                selectedSpt.personil,
                (person) => person.pegawaiId,
                pegawais,
              ).map(({ pegawaiId }) => {
                const pegawai = pegawais.find((item) => item.id === pegawaiId);
                return (
                  <li key={pegawaiId}>
                    {pegawai?.nama ?? pegawaiId}
                    {pegawai?.nip ? ` / NIP. ${pegawai.nip}` : ""}
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="font-bold text-foreground">A. Dasar Pelaksanaan</h3>
        <div className="grid md:grid-cols-3 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              Surat Tugas
            </span>
            <Input {...register("suratTugas")} />
            <Error text={errors.suratTugas?.message} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              Nomor
            </span>
            <Input {...register("nomorSuratTugas")} />
            <Error text={errors.nomorSuratTugas?.message} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              Tanggal
            </span>
            <Input {...register("tanggalSuratTugas")} />
            <Error text={errors.tanggalSuratTugas?.message} />
          </label>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="B. Maksud" error={errors.maksud?.message}>
          <textarea {...register("maksud")} className="editor" rows={3} />
        </Field>
        <Field label="C. Tujuan" error={errors.tujuan?.message}>
          <textarea {...register("tujuan")} className="editor" rows={3} />
          <p className="text-[10px] font-semibold text-muted-foreground">
            Isi satu tujuan kegiatan per baris. Saat dicetak akan menjadi poin
            1, 2, 3, dan seterusnya.
          </p>
        </Field>
      </div>

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="font-bold text-foreground">
          D. Tempat dan Waktu Pelaksanaan
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              Tempat Pelaksanaan
            </span>
            <Input {...register("tempatPelaksanaan")} />
            <Error text={errors.tempatPelaksanaan?.message} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground">
              Hari / Tanggal
            </span>
            <Input {...register("hariTanggalPelaksanaan")} />
            <Error text={errors.hariTanggalPelaksanaan?.message} />
          </label>
        </div>
        {relatedSppds.length > 0 && (
          <p className="text-[10px] font-semibold text-muted-foreground">
            Data otomatis memakai SPPD terkait SPT ini, tetapi tetap bisa
            diedit manual bila diperlukan.
          </p>
        )}
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="E. Materi" error={errors.materi?.message}>
          <textarea {...register("materi")} className="editor" rows={3} />
          <p className="text-[10px] font-semibold text-muted-foreground">
            Isi satu materi per baris. Saat dicetak akan menjadi bullet.
          </p>
        </Field>
        <Field
          label="F. Hasil Pelaksanaan"
          error={errors.hasilPelaksanaan?.message}
        >
          <textarea
            {...register("hasilPelaksanaan")}
            className="editor"
            rows={5}
          />
          <p className="text-[10px] font-semibold text-muted-foreground">
            Isi satu hasil pelaksanaan per baris. Saat dicetak akan menjadi
            poin 1, 2, 3, dan seterusnya.
          </p>
        </Field>
      </div>

      <Field
        label="Kalimat Penutup"
        error={errors.kalimatPenutup?.message}
      >
        <textarea
          {...register("kalimatPenutup")}
          className="editor"
          rows={3}
          placeholder="Masukkan kalimat penutup laporan"
        />
        <p className="text-[10px] font-semibold text-muted-foreground">
          Dicetak setelah poin F dan sejajar dengan posisi huruf F.
        </p>
      </Field>

      <section className="space-y-3 border border-border rounded-xl p-4">
        <h3 className="font-bold text-foreground flex gap-2">
          <Camera className="w-4 h-4" /> G. Dokumentasi Kegiatan
        </h3>
        <Upload
          accept="image/png,image/jpeg,image/webp"
          multiple
          onFileSelect={addFiles}
          description="PNG, JPG, WEBP (Maksimal 100MB per file)"
          maxSizeMb={100}
        />
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[80px_1fr_auto] gap-3 items-center bg-muted/30 p-3 rounded-xl"
          >
            <Image
              src={field.dataUrl}
              alt={field.nama}
              width={80}
              height={64}
              unoptimized
              className="w-20 h-16 object-cover rounded-lg"
            />
            <p className="truncate text-xs font-semibold text-foreground">
              {field.nama}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="w-4 h-4 text-danger" />
            </Button>
          </div>
        ))}
        <Error
          text={
            typeof errors.dokumentasi?.message === "string"
              ? errors.dokumentasi.message
              : undefined
          }
        />
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="font-bold text-foreground">
            Tempat Pembuatan Laporan
          </span>
          <Input {...register("tempatLaporan")} />
          <Error text={errors.tempatLaporan?.message} />
        </label>
        <label className="space-y-1">
          <span className="font-bold text-foreground">
            Tanggal Pembuatan Laporan
          </span>
          <Input type="date" {...register("tanggalLaporan")} />
        </label>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="space-y-1">
          <span className="font-bold text-foreground">Status Pengiriman</span>
          <Select {...register("status")}>
            <option value="Draft">Draft</option>
            <option value="Menunggu Verifikasi">Kirim untuk Verifikasi</option>
            {status === "Perlu Revisi" && (
              <option value="Perlu Revisi">Perlu Revisi</option>
            )}
          </Select>
        </label>
      </div>

      <p className="rounded-xl border border-dashed border-border bg-muted/20 p-3 text-[11px] font-semibold text-muted-foreground">
        Tanda tangan pelaksana tidak diinput di aplikasi. Nama pelaksana akan
        tampil otomatis di bagian bawah cetakan sesuai personil SPT, kemudian
        ditandatangani manual setelah dokumen dicetak.
      </p>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-card pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Send className="w-4 h-4" />{" "}
          {isSaving ? "Menyimpan..." : "Simpan Laporan"}
        </Button>
      </div>
    </form>
  );
}

function Error({ text }: { text?: string }) {
  return text ? (
    <p className="text-[10px] font-bold text-danger mt-1">{text}</p>
  ) : null;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1">
      <span className="font-bold text-foreground">{label}</span>
      {children}
      <Error text={error} />
    </label>
  );
}
