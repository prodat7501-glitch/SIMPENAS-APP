"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, RotateCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import {
  approvalDecisionSchema,
  type ApprovalDecision,
} from "../approval.schema";
import type { ApprovalItem } from "../approval.service";

export function ApprovalDetail({
  item,
  pegawais,
  jabatans,
  approver,
  isSaving,
  onClose,
  onSubmit,
}: {
  item: ApprovalItem | null;
  pegawais: Pegawai[];
  jabatans: Jabatan[];
  approver: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (data: ApprovalDecision) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ApprovalDecision>({
    resolver: zodResolver(approvalDecisionSchema),
    values: {
      documentId: item?.id ?? "",
      documentType: item?.documentType ?? "SPT",
      decision: "Disetujui",
      catatan: "",
      approver,
    },
  });

  if (!item) return null;

  const submitDecision = (decision: ApprovalDecision["decision"]) => {
    setValue("decision", decision);
    void handleSubmit(onSubmit)();
  };
  const getPegawai = (pegawaiId: string) =>
    pegawais.find((pegawai) => pegawai.id === pegawaiId);
  const getJabatanName = (pegawaiId: string) => {
    const pegawai = getPegawai(pegawaiId);
    if (!pegawai) return "-";
    return (
      jabatans.find((jabatan) => jabatan.id === pegawai.jabatanId)?.nama ?? "-"
    );
  };

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title={`Detail Approval ${item.documentType}`}
      className="max-w-5xl"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-2">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-muted/30 rounded-xl p-4">
          <Info label="Jenis Dokumen" value={item.documentType} />
          <Info label="Nomor Dokumen" value={item.nomor} />
          <Info label="Tanggal" value={getTanggalInfo(item)} />
          <Info label="Penandatangan" value={item.penandatanganId} />
          <Info label="Jumlah Personil" value={String(getPersonilCount(item))} />
          {item.documentType === "Nota Dinas" && (
            <Info label="Total Anggaran" value={formatRupiah(item.totalBiaya)} />
          )}
        </div>

        {item.documentType === "SPT" ? (
          <>
            <Section
              title="Menimbang"
              items={item.menimbang.map((x) => x.text)}
            />
            <Section title="Dasar" items={item.dasar.map((x) => x.text)} />
            <Section title="Untuk" items={item.untuk.map((x) => x.text)} />
            <SptPersonilTable
              item={item}
              getPegawai={getPegawai}
              getJabatanName={getJabatanName}
            />
          </>
        ) : (
          <>
            <Section title="Perihal" items={[item.perihal]} />
            <Section title="Isi Nota Dinas" items={[item.isi]} />
            <NotaDinasLampiranTable
              item={item}
              getPegawai={getPegawai}
              getJabatanName={getJabatanName}
            />
          </>
        )}

        <label className="block space-y-1">
          <span className="text-xs font-bold text-foreground">
            Catatan Keputusan
          </span>
          <textarea
            {...register("catatan")}
            rows={4}
            className="editor"
            placeholder={`Wajib diisi apabila ${item.documentType} ditolak untuk revisi.`}
          />
          {errors.catatan && (
            <p className="text-[10px] font-bold text-danger">
              {errors.catatan.message}
            </p>
          )}
        </label>
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => submitDecision("Perlu Revisi")}
            disabled={isSaving}
          >
            <RotateCcw className="w-4 h-4" /> Tolak / Perlu Revisi
          </Button>
          <Button
            type="button"
            onClick={() => submitDecision("Disetujui")}
            disabled={isSaving}
          >
            <CheckCircle className="w-4 h-4" /> Setujui
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function getTanggalInfo(item: ApprovalItem) {
  return item.documentType === "SPT"
    ? `${item.tanggalMulai} – ${item.tanggalSelesai}`
    : item.tanggal;
}

function getPersonilCount(item: ApprovalItem) {
  return item.documentType === "SPT" ? item.personil.length : item.lampiran.length;
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

function formatRupiahIfFilled(val: number) {
  return Number(val) > 0 ? formatRupiah(val) : "-";
}

function SptPersonilTable({
  item,
  getPegawai,
  getJabatanName,
}: {
  item: Extract<ApprovalItem, { documentType: "SPT" }>;
  getPegawai: (pegawaiId: string) => Pegawai | undefined;
  getJabatanName: (pegawaiId: string) => string;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-xs font-bold text-foreground">
          Personil yang Ditugaskan
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Daftar pegawai yang tercantum dalam dokumen SPT untuk proses
          persetujuan.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[680px] border-collapse text-[11px]">
          <thead className="bg-muted/70">
            <tr>
              <th className="border-b border-border p-2 text-center w-10">
                No
              </th>
              <th className="border-b border-border p-2 text-left">
                Nama / NIP
              </th>
              <th className="border-b border-border p-2 text-left">
                Kategori
              </th>
              <th className="border-b border-border p-2 text-left">
                Jabatan
              </th>
            </tr>
          </thead>
          <tbody>
            {item.personil.map((personil, index) => {
              const pegawai = getPegawai(personil.pegawaiId);
              return (
                <tr key={`${personil.pegawaiId}-${index}`}>
                  <td className="border-b border-border p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border-b border-border p-2">
                    <p className="font-bold text-foreground">
                      {pegawai?.nama ?? "Pegawai tidak ditemukan"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      NIP. {pegawai?.nip || "-"}
                    </p>
                  </td>
                  <td className="border-b border-border p-2">
                    {pegawai?.kategoriPegawai ?? "-"}
                  </td>
                  <td className="border-b border-border p-2">
                    {getJabatanName(personil.pegawaiId)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NotaDinasLampiranTable({
  item,
  getPegawai,
  getJabatanName,
}: {
  item: Extract<ApprovalItem, { documentType: "Nota Dinas" }>;
  getPegawai: (pegawaiId: string) => Pegawai | undefined;
  getJabatanName: (pegawaiId: string) => string;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-xs font-bold text-foreground">
          Lampiran Personil Nota Dinas
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Rincian personil dan komponen biaya yang diajukan dalam Nota Dinas.
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[820px] border-collapse text-[11px]">
          <thead className="bg-muted/70">
            <tr>
              <th className="border-b border-border p-2 text-center w-10">
                No
              </th>
              <th className="border-b border-border p-2 text-left">
                Nama / NIP
              </th>
              <th className="border-b border-border p-2 text-left">
                Jabatan
              </th>
              <th className="border-b border-border p-2 text-right">
                Uang Harian
              </th>
              <th className="border-b border-border p-2 text-right">
                Transport
              </th>
              <th className="border-b border-border p-2 text-right">
                Penginapan
              </th>
              <th className="border-b border-border p-2 text-right">
                Tiket
              </th>
              <th className="border-b border-border p-2 text-center">
                Durasi
              </th>
              <th className="border-b border-border p-2 text-right">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {item.lampiran.map((lampiran, index) => {
              const pegawai = getPegawai(lampiran.pegawaiId);
              return (
                <tr key={`${lampiran.pegawaiId}-${index}`}>
                  <td className="border-b border-border p-2 text-center">
                    {index + 1}
                  </td>
                  <td className="border-b border-border p-2">
                    <p className="font-bold text-foreground">
                      {pegawai?.nama ?? "Pegawai tidak ditemukan"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      NIP. {pegawai?.nip || "-"}
                    </p>
                  </td>
                  <td className="border-b border-border p-2">
                    {getJabatanName(lampiran.pegawaiId)}
                  </td>
                  <td className="border-b border-border p-2 text-right">
                    {formatRupiahIfFilled(lampiran.uangHarian)}
                  </td>
                  <td className="border-b border-border p-2 text-right">
                    {formatRupiahIfFilled(lampiran.uangTransport)}
                  </td>
                  <td className="border-b border-border p-2 text-right">
                    {formatRupiahIfFilled(lampiran.penginapan)}
                  </td>
                  <td className="border-b border-border p-2 text-right">
                    {formatRupiahIfFilled(lampiran.tiketPesawat)}
                  </td>
                  <td className="border-b border-border p-2 text-center">
                    {lampiran.volume} hari
                  </td>
                  <td className="border-b border-border p-2 text-right font-bold text-primary">
                    {formatRupiah(lampiran.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5">
              <td colSpan={8} className="p-2 text-right font-bold">
                Total Anggaran
              </td>
              <td className="p-2 text-right font-black text-primary">
                {formatRupiah(item.totalBiaya)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-muted-foreground">
        {label}
      </p>
      <p className="text-xs font-semibold text-foreground mt-1">{value}</p>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3 className="text-xs font-bold text-foreground mb-2">{title}</h3>
      <ol className="list-decimal pl-5 space-y-1 text-xs text-muted-foreground">
        {items.map((text, index) => (
          <li key={`${title}-${index}`}>{text}</li>
        ))}
      </ol>
    </section>
  );
}
