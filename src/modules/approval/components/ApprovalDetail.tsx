"use client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, FileText, RotateCcw, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { formatTableDate } from "@/lib/formatters";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import {
  getLampiranCostLines,
  type LampiranCostLine,
} from "@/modules/nota-dinas/nota-dinas-calculation";
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
      className="w-full max-w-[96vw] xl:max-w-7xl 2xl:max-w-[1440px] flex flex-col max-h-[92vh]"
      bodyClassName="min-h-0 flex-1 overflow-y-auto pr-2"
    >
      <div className="space-y-6">
        {/* Ringkasan Metadata Dokumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
          <Info
            label="Jenis Dokumen"
            value={
              <Badge variant="outline" className="font-bold text-xs">
                {item.documentType}
              </Badge>
            }
          />
          <Info
            label="Nomor Dokumen"
            value={
              <span className="font-mono text-sm sm:text-base font-bold tracking-wide text-foreground">
                {item.nomor}
              </span>
            }
          />
          <Info label="Tanggal Dokumen" value={getTanggalInfo(item)} />
          <Info
            label="Penandatangan Dokumen"
            value={
              item.penandatanganSnapshot?.nama
                ? `${item.penandatanganSnapshot.nama} (${item.penandatanganSnapshot.jabatanPenandatangan || item.penandatanganSnapshot.peran})`
                : item.penandatanganId || "-"
            }
          />
          <Info
            label="Jumlah Personil"
            value={`${getPersonilCount(item)} Orang`}
          />
          {item.documentType === "Nota Dinas" && (
            <Info
              label="Total Anggaran"
              value={formatRupiah(item.totalBiaya)}
              highlight
            />
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
              pegawais={pegawais}
              getPegawai={getPegawai}
              getJabatanName={getJabatanName}
            />
          </>
        ) : (
          <>
            {/* Perihal */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Perihal Nota Dinas
              </span>
              <p className="text-sm sm:text-base font-bold text-foreground leading-snug">
                {item.perihal || "-"}
              </p>
            </div>

            {/* Isi Nota Dinas */}
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border pb-2.5">
                <FileText className="w-4 h-4 text-primary" />
                Isi Nota Dinas
              </h3>
              <div className="text-sm sm:text-[14.5px] leading-relaxed text-foreground/90 whitespace-pre-line bg-muted/30 p-4 rounded-xl border border-border/60">
                {item.isi || "-"}
              </div>
            </div>

            {/* Lampiran Biaya & Personil */}
            <NotaDinasLampiranTable
              item={item}
              pegawais={pegawais}
              getPegawai={getPegawai}
              getJabatanName={getJabatanName}
            />
          </>
        )}

        {/* Catatan Keputusan */}
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-3">
          <label className="block space-y-2">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Catatan Keputusan Approver
            </span>
            <textarea
              {...register("catatan")}
              rows={3}
              className="w-full text-sm p-3.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-200"
              placeholder={`Wajib diisi apabila ${item.documentType} ditolak untuk revisi.`}
            />
            {errors.catatan && (
              <p className="text-xs font-bold text-danger">
                {errors.catatan.message}
              </p>
            )}
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving}
            className="h-11 px-6 text-sm font-semibold cursor-pointer"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => submitDecision("Perlu Revisi")}
            disabled={isSaving}
            className="h-11 px-6 text-sm font-bold gap-2 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" /> Tolak / Perlu Revisi
          </Button>
          <Button
            type="button"
            onClick={() => submitDecision("Disetujui")}
            disabled={isSaving}
            className="h-11 px-7 text-sm font-bold gap-2 cursor-pointer shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
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
    ? `${formatTableDate(item.tanggalMulai)} – ${formatTableDate(item.tanggalSelesai)}`
    : formatTableDate(item.tanggal);
}

function getPersonilCount(item: ApprovalItem) {
  return item.documentType === "SPT"
    ? item.personil.length
    : item.lampiran.length;
}

function formatRupiah(val: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

function SptPersonilTable({
  item,
  pegawais,
  getPegawai,
  getJabatanName,
}: {
  item: Extract<ApprovalItem, { documentType: "SPT" }>;
  pegawais: Pegawai[];
  getPegawai: (pegawaiId: string) => Pegawai | undefined;
  getJabatanName: (pegawaiId: string) => string;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Personil yang Ditugaskan
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar pegawai yang tercantum dalam dokumen SPT untuk proses
            persetujuan.
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start sm:self-auto font-medium text-xs"
        >
          {item.personil.length} Personil
        </Badge>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[680px] border-collapse text-xs">
          <thead className="bg-muted/80">
            <tr>
              <th className="border-b border-border p-3 text-center w-12 font-bold text-foreground uppercase tracking-wider text-[11px]">
                No
              </th>
              <th className="border-b border-border p-3 text-left font-bold text-foreground uppercase tracking-wider text-[11px]">
                Nama / NIP
              </th>
              <th className="border-b border-border p-3 text-left font-bold text-foreground uppercase tracking-wider text-[11px]">
                Kategori
              </th>
              <th className="border-b border-border p-3 text-left font-bold text-foreground uppercase tracking-wider text-[11px]">
                Jabatan
              </th>
            </tr>
          </thead>
          <tbody>
            {sortByPegawaiOrder(
              item.personil,
              (personil) => personil.pegawaiId,
              pegawais,
            ).map((personil, index) => {
              const pegawai = getPegawai(personil.pegawaiId);
              return (
                <tr
                  key={`${personil.pegawaiId}-${index}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="border-b border-border p-3 text-center font-bold text-muted-foreground text-xs">
                    {index + 1}
                  </td>
                  <td className="border-b border-border p-3">
                    <p className="font-bold text-foreground text-sm">
                      {pegawai?.nama ?? "Pegawai tidak ditemukan"}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      NIP. {pegawai?.nip || "-"}
                    </p>
                  </td>
                  <td className="border-b border-border p-3 text-foreground/80 font-medium">
                    {pegawai?.kategoriPegawai ?? "-"}
                  </td>
                  <td className="border-b border-border p-3 text-foreground/80 font-medium">
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
  pegawais,
  getPegawai,
  getJabatanName,
}: {
  item: Extract<ApprovalItem, { documentType: "Nota Dinas" }>;
  pegawais: Pegawai[];
  getPegawai: (pegawaiId: string) => Pegawai | undefined;
  getJabatanName: (pegawaiId: string) => string;
}) {
  const costColumns = Array.from(
    item.lampiran.reduce((columns, row) => {
      getLampiranCostLines(row, item.jenis).forEach((line) => {
        if (line.subtotal > 0 && !columns.has(line.key)) {
          columns.set(line.key, line);
        }
      });
      return columns;
    }, new Map<LampiranCostLine["key"], LampiranCostLine>()),
  ).map(([, line]) => line);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b border-border pb-3">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Lampiran Personil & Rincian Anggaran Nota Dinas
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rincian personil pelaksana dan rincian komponen biaya yang diajukan dalam Nota Dinas.
          </p>
        </div>
        <Badge
          variant="outline"
          className="self-start sm:self-auto font-medium text-xs"
        >
          {item.lampiran.length} Personil
        </Badge>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full min-w-[900px] border-collapse text-xs">
          <thead className="bg-muted/80">
            <tr>
              <th className="border-b border-border p-3 text-center w-12 font-bold text-foreground uppercase tracking-wider text-[11px]">
                No
              </th>
              <th className="border-b border-border p-3 text-left font-bold text-foreground uppercase tracking-wider text-[11px] min-w-[200px]">
                Nama / NIP
              </th>
              <th className="border-b border-border p-3 text-left font-bold text-foreground uppercase tracking-wider text-[11px] min-w-[160px]">
                Jabatan
              </th>
              {costColumns.map((column) => (
                <th
                  key={column.key}
                  className="border-b border-border p-3 text-right font-bold text-foreground uppercase tracking-wider text-[11px] whitespace-nowrap min-w-[140px]"
                >
                  {column.label}
                </th>
              ))}
              <th className="border-b border-border p-3 text-right font-bold text-foreground uppercase tracking-wider text-[11px] min-w-[140px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {sortByPegawaiOrder(
              item.lampiran,
              (lampiran) => lampiran.pegawaiId,
              pegawais,
            ).map((lampiran, index) => {
              const pegawai = getPegawai(lampiran.pegawaiId);
              return (
                <tr
                  key={`${lampiran.pegawaiId}-${index}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="border-b border-border p-3 text-center font-bold text-muted-foreground text-xs">
                    {index + 1}
                  </td>
                  <td className="border-b border-border p-3">
                    <p className="font-bold text-foreground text-sm">
                      {pegawai?.nama ?? "Pegawai tidak ditemukan"}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                      NIP. {pegawai?.nip || "-"}
                    </p>
                  </td>
                  <td className="border-b border-border p-3">
                    <span className="text-xs font-medium text-foreground/80 leading-snug">
                      {getJabatanName(lampiran.pegawaiId)}
                    </span>
                  </td>
                  {costColumns.map((column) => {
                    const line = getLampiranCostLines(
                      lampiran,
                      item.jenis,
                    ).find((candidate) => candidate.key === column.key);
                    return (
                      <td
                        key={column.key}
                        className="border-b border-border p-3 text-right whitespace-nowrap"
                      >
                        {line && line.subtotal > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-[11px] font-mono text-muted-foreground block">
                              {formatRupiah(line.rate)} × {line.quantity}{" "}
                              {line.unit}
                            </span>
                            <span className="font-bold text-foreground text-xs sm:text-sm block">
                              {formatRupiah(line.subtotal)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">-</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="border-b border-border p-3 text-right font-black text-primary text-sm whitespace-nowrap">
                    {formatRupiah(lampiran.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/10 border-t-2 border-primary/20">
              <td
                colSpan={3 + costColumns.length}
                className="p-3.5 text-right font-bold text-foreground text-sm"
              >
                Total Anggaran Keseluruhan
              </td>
              <td className="p-3.5 text-right font-black text-primary text-base whitespace-nowrap">
                {formatRupiah(item.totalBiaya)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function Info({
  label,
  value,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="space-y-1">
      <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
        {label}
      </span>
      <div
        className={
          highlight
            ? "text-base sm:text-lg font-black text-primary"
            : "text-sm sm:text-[14px] font-bold text-foreground leading-snug"
        }
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border pb-2.5">
        <FileText className="w-4 h-4 text-primary" /> {title}
      </h3>
      <ol className="list-decimal pl-5 space-y-2 text-sm leading-relaxed text-foreground/90">
        {items.map((text, index) => (
          <li key={`${title}-${index}`} className="pl-1">
            {text}
          </li>
        ))}
      </ol>
    </div>
  );
}
