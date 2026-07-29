"use client";
import { useState } from "react";
import { ClipboardCheck, Eye } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Stepper } from "@/components/ui/stepper";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { useDipa } from "@/modules/dipa/useDipa";
import {
  canAccessSpjByNotaDinas,
  isFinanceUnitUser,
  resolveCurrentPegawai,
} from "@/lib/document-access";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { getLampiranCostBreakdown } from "@/modules/nota-dinas/nota-dinas-calculation";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import { useUnitKerja } from "@/modules/unit-kerja/useUnitKerja";
import { formatRupiah, formatTableDate } from "@/lib/formatters";
import type { RealisasiBiaya, Spj } from "../keuangan.schema";
import { useKeuangan } from "../useKeuangan";

const steps = [
  { label: "SPJ Diterima" },
  { label: "Validasi SPJ" },
  { label: "Validasi Selesai" },
  { label: "Proses Pembayaran" },
  { label: "Pembayaran Selesai" },
];
const step = (status: Spj["status"]) =>
  ({
    "SPJ Diterima": 0,
    "Validasi SPJ": 1,
    "Validasi Selesai": 2,
    "Proses Pembayaran": 3,
    "Pembayaran Selesai": 4,
  })[status];
const isCompletedStep = (status: Spj["status"]) =>
  status === "Validasi Selesai" || status === "Pembayaran Selesai";
const statusTone = (status: Spj["status"]) => {
  if (status === "Validasi Selesai" || status === "Pembayaran Selesai") {
    return "success" as const;
  }
  if (status === "Proses Pembayaran") return "info" as const;
  return "warning" as const;
};
const isReturnedForCompletion = (item: Spj) =>
  item.status === "SPJ Diterima" && Boolean(item.catatan.trim());

type RealisasiAmountField =
  | "uangTransportHarian"
  | "penginapan"
  | "tiketPesawat"
  | "transportBandaraAsal"
  | "transportBandaraTujuan";

const REALISASI_COLUMNS: Array<{
  field: RealisasiAmountField;
  label: string;
}> = [
  { field: "tiketPesawat", label: "Tiket Pesawat" },
  { field: "transportBandaraAsal", label: "Transport Bandara Asal" },
  { field: "transportBandaraTujuan", label: "Transport Bandara Tujuan" },
  { field: "uangTransportHarian", label: "Uang Transport Harian" },
  { field: "penginapan", label: "Penginapan" },
];

export function SpjPageContent() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { items: reports, isLoading: reportsLoading } = useLaporan();
  const { items: sppds, isLoading: sppdsLoading } = useSppd();
  const { items: spts } = useSpt();
  const { items: notas } = useNotaDinas();
  const { items: dipas } = useDipa();
  const { items: pegawais } = usePegawai();
  const { items: unitKerja } = useUnitKerja();
  const data = useKeuangan(
    reports,
    { sppds, spts, notas, dipas },
    !reportsLoading && !sppdsLoading,
  );
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const canValidateSpj = isFinanceUnitUser(user, currentPegawai, unitKerja);
  const visibleItems = canValidateSpj
    ? data.items
    : data.items.filter((item) =>
        canAccessSpjByNotaDinas(
          currentPegawaiId,
          item,
          reports,
          sppds,
          spts,
          notas,
        ),
      );
  const [selected, setSelected] = useState<Spj | null>(null);
  const [checklist, setChecklist] = useState<Spj["checklist"]>({
    laporan: false,
    sppd: false,
    dokumentasi: false,
    tandaTangan: false,
  });
  const [catatan, setCatatan] = useState("");
  const [realisasiBiaya, setRealisasiBiaya] = useState<RealisasiBiaya[]>([]);
  const openValidation = (item: Spj) => {
    setSelected(item);
    setChecklist(item.checklist);
    setRealisasiBiaya(item.realisasiBiaya);
    setCatatan(item.catatan);
  };
  if (!hasPermission("Validasi SPJ dan Pembayaran", "R"))
    return <Alert variant="error">Akses ditolak.</Alert>;
  const act = async (action: "mulai" | "revisi" | "selesai") => {
    if (!selected) return;
    if (!canValidateSpj) {
      addToast(
        "Validasi SPJ dan pembayaran hanya dapat diproses oleh pegawai Unit Sub Bagian Keuangan.",
        "error",
      );
      return;
    }
    try {
      await data.validate({
        id: selected.id,
        checklist,
        realisasiBiaya,
        catatan,
        action,
      });
      addToast("Status SPJ berhasil diperbarui", "success");
      setSelected(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Validasi gagal", "error");
    }
  };
  const selectedSppd = sppds.find((item) => item.id === selected?.sppdId);
  const selectedSpt = spts.find((item) => item.id === selectedSppd?.sptId);
  const selectedNota = notas.find(
    (item) => item.id === selectedSpt?.notaDinasId,
  );
  const validationLocked =
    !canValidateSpj ||
    selected?.status === "Proses Pembayaran" ||
    selected?.status === "Pembayaran Selesai";
  const updateRealisasiAmount = (
    pegawaiId: string,
    field: RealisasiAmountField,
    value: number,
  ) => {
    setRealisasiBiaya((rows) =>
      rows.map((row) =>
        row.pegawaiId === pegawaiId
          ? { ...row, [field]: Math.max(0, value || 0) }
          : row,
      ),
    );
  };
  const setRealisasiVerified = (pegawaiId: string, diverifikasi: boolean) => {
    setRealisasiBiaya((rows) =>
      rows.map((row) =>
        row.pegawaiId === pegawaiId ? { ...row, diverifikasi } : row,
      ),
    );
  };
  const getProposalBreakdown = (row: RealisasiBiaya) => {
    const indexed = selectedNota?.lampiran[row.lampiranIndex];
    const lampiran =
      indexed?.pegawaiId === row.pegawaiId
        ? indexed
        : selectedNota?.lampiran.find(
            (item) => item.pegawaiId === row.pegawaiId,
          );
    return lampiran && selectedNota
      ? getLampiranCostBreakdown(lampiran, selectedNota.jenis)
      : null;
  };
  const getProposalAmount = (
    row: RealisasiBiaya,
    field: RealisasiAmountField,
  ) => {
    const breakdown = getProposalBreakdown(row);
    if (!breakdown) return 0;
    if (field === "uangTransportHarian") return breakdown.uangTransport;
    return breakdown[field];
  };
  const getDailyAllowance = (row: RealisasiBiaya) => {
    const breakdown = getProposalBreakdown(row);
    return breakdown
      ? breakdown.uangHarianPaketMeeting + breakdown.uangHarianFull
      : 0;
  };
  const getRealisasiTotal = (row: RealisasiBiaya) =>
    getDailyAllowance(row) +
    REALISASI_COLUMNS.reduce((sum, column) => sum + row[column.field], 0);
  const getSppdPersonilNames = (sppdId: string) => {
    const relatedSppd = sppds.find((item) => item.id === sppdId);
    if (!relatedSppd) return [];

    return relatedSppd.personil.map(
      (person) =>
        pegawais.find((pegawai) => pegawai.id === person.pegawaiId)?.nama ??
        person.pegawaiId,
    );
  };
  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={reportsLoading || sppdsLoading || data.isLoading || data.isBusy}
        message="Memproses validasi SPJ..."
      />
      <div>
        <h1 className="text-xl font-extrabold">Validasi SPJ dan Pembayaran</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Pantau alur penerimaan SPJ, validasi, proses dokumen keuangan, hingga
          pembayaran selesai.
        </p>
      </div>
      <Stepper
        steps={steps}
        currentStep={
          visibleItems.length
            ? Math.min(...visibleItems.map((x) => step(x.status)))
            : 0
        }
        completeCurrentStep={
          visibleItems.length > 0 &&
          visibleItems.every((item) => isCompletedStep(item.status))
        }
      />
      {data.error && <Alert variant="error">Gagal memuat data SPJ.</Alert>}
      {!canValidateSpj && (
        <Alert variant="info" title="Akses Terbatas">
          Anda hanya dapat melihat hasil validasi SPJ untuk dokumen perjalanan
          yang berasal dari Nota Dinas yang mencantumkan Anda sebagai personil.
        </Alert>
      )}
      <TableContainer>
        <Table className="min-w-[1120px]">
          <TableHeader>
            <TableRow>
              <TableHead>SPPD</TableHead>
              <TableHead>Personil SPPD</TableHead>
              <TableHead>Tanggal Diterima</TableHead>
              <TableHead>Kelengkapan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Catatan Keuangan</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-bold">
                  {sppds.find((x) => x.id === item.sppdId)?.nomor ?? "-"}
                </TableCell>
                <TableCell className="min-w-52 font-semibold">
                  {getSppdPersonilNames(item.sppdId).join(", ") || "-"}
                </TableCell>
                <TableCell>{formatTableDate(item.tanggalDiterima)}</TableCell>
                <TableCell>
                  {Object.values(item.checklist).filter(Boolean).length}/4
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      isReturnedForCompletion(item)
                        ? "danger"
                        : statusTone(item.status)
                    }
                  >
                    {isReturnedForCompletion(item)
                      ? "SPJ Perlu Dilengkapi"
                      : item.status}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-72">
                  {item.catatan.trim() ? (
                    <p
                      className={
                        isReturnedForCompletion(item)
                          ? "text-xs font-semibold text-danger"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {item.catatan}
                    </p>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {new Set(item.dokumen.map((document) => document.jenis)).size}
                  /4
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openValidation(item)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!visibleItems.length && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  Belum ada hasil validasi SPJ yang dapat Anda akses.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Pemeriksaan Kelengkapan SPJ"
        className="max-w-[96vw]"
      >
        <div className="max-h-[80vh] space-y-5 overflow-y-auto pr-1">
          <Stepper
            steps={steps}
            currentStep={selected ? step(selected.status) : 0}
            completeCurrentStep={
              selected ? isCompletedStep(selected.status) : false
            }
          />
          {selected && isReturnedForCompletion(selected) && (
            <Alert variant="error" title="SPJ Perlu Dilengkapi">
              Catatan Unit Keuangan: {selected.catatan}
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries({
              laporan: "Laporan terverifikasi",
              sppd: "Dokumen SPPD",
              dokumentasi: "Dokumentasi kegiatan",
              tandaTangan: "Tanda tangan pelaksana",
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 p-3 border border-border rounded-xl text-foreground"
              >
                <input
                  type="checkbox"
                  checked={checklist[key as keyof typeof checklist]}
                  disabled={validationLocked}
                  onChange={(e) =>
                    setChecklist((x) => ({ ...x, [key]: e.target.checked }))
                  }
                />{" "}
                {label}
              </label>
            ))}
          </div>
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-extrabold text-foreground">
                Realisasi Biaya Berdasarkan Bukti SPJ
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Uang Harian mengikuti nilai Nota Dinas. Komponen lainnya diisi
                Unit Keuangan berdasarkan kuitansi, tiket, invoice, atau bukti
                pertanggungjawaban yang diterima.
              </p>
            </div>
            <Alert variant="info" title="Pemisahan Nilai Usulan dan Realisasi">
              Nominal usulan Nota Dinas ditampilkan sebagai pembanding. Dokumen
              keuangan akan menggunakan nilai realisasi SPJ setelah setiap
              personel ditandai sudah diperiksa.
            </Alert>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full min-w-[1320px] border-collapse text-[11px]">
                <thead className="bg-muted/70">
                  <tr>
                    <th className="border-b border-border p-2 text-left">
                      Personel
                    </th>
                    <th className="border-b border-border p-2 text-right">
                      Uang Harian
                      <span className="block text-[9px] font-normal">
                        dari Nota Dinas
                      </span>
                    </th>
                    {REALISASI_COLUMNS.map((column) => (
                      <th
                        key={column.field}
                        className="border-b border-border p-2 text-center"
                      >
                        {column.label}
                      </th>
                    ))}
                    <th className="border-b border-border p-2 text-right">
                      Total Dibayar
                    </th>
                    <th className="border-b border-border p-2 text-center">
                      Diperiksa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {realisasiBiaya.map((row) => (
                    <tr key={row.pegawaiId}>
                      <td className="border-b border-border p-2 font-bold text-foreground">
                        {pegawais.find((item) => item.id === row.pegawaiId)
                          ?.nama ?? "Pegawai tidak ditemukan"}
                      </td>
                      <td className="border-b border-border p-2 text-right font-bold text-primary">
                        {formatRupiah(getDailyAllowance(row))}
                      </td>
                      {REALISASI_COLUMNS.map((column) => (
                        <td
                          key={column.field}
                          className="border-b border-border p-2 align-top"
                        >
                          <Input
                            type="number"
                            min={0}
                            value={
                              row[column.field] === 0 && !validationLocked
                                ? ""
                                : row[column.field]
                            }
                            placeholder="0"
                            disabled={validationLocked}
                            onChange={(event) =>
                              updateRealisasiAmount(
                                row.pegawaiId,
                                column.field,
                                Number(event.target.value),
                              )
                            }
                            className="min-w-32 text-right"
                          />
                          <p className="mt-1 whitespace-nowrap text-[9px] text-muted-foreground">
                            Usulan:{" "}
                            {formatRupiah(getProposalAmount(row, column.field))}
                          </p>
                        </td>
                      ))}
                      <td className="border-b border-border p-2 text-right font-black text-foreground">
                        {formatRupiah(getRealisasiTotal(row))}
                      </td>
                      <td className="border-b border-border p-2 text-center">
                        <input
                          type="checkbox"
                          checked={row.diverifikasi}
                          disabled={validationLocked}
                          aria-label={`Tandai realisasi ${row.pegawaiId} sudah diperiksa`}
                          onChange={(event) =>
                            setRealisasiVerified(
                              row.pegawaiId,
                              event.target.checked,
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                  {realisasiBiaya.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="p-4 text-center text-muted-foreground"
                      >
                        Personel dan referensi Nota Dinas belum tersedia.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          <label className="block space-y-1">
            <span className="font-bold text-foreground">
              Catatan Pemeriksaan
            </span>
            <Input
              value={catatan}
              disabled={validationLocked}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </label>
          {canValidateSpj &&
          selected?.status !== "Proses Pembayaran" &&
          selected?.status !== "Pembayaran Selesai" ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => act("mulai")}>
                <ClipboardCheck className="w-4 h-4" /> Mulai Validasi
              </Button>
              <Button variant="destructive" onClick={() => act("revisi")}>
                Kembalikan untuk Dilengkapi
              </Button>
              <Button onClick={() => act("selesai")}>Validasi Selesai</Button>
            </div>
          ) : (
            <Alert variant="info">
              {selected?.status === "Proses Pembayaran" ||
              selected?.status === "Pembayaran Selesai"
                ? "Validasi telah dikunci karena proses pembayaran sudah dimulai."
                : "Mode lihat saja. Perubahan status validasi hanya dapat dilakukan oleh Unit Sub Bagian Keuangan."}
            </Alert>
          )}
        </div>
      </Dialog>
    </div>
  );
}
