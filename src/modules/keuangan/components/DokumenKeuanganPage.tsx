"use client";
import { useState } from "react";
import {
  CircleCheckBig,
  FilePlus2,
  Printer,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
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
import { useJabatan } from "@/modules/jabatan/useJabatan";
import {
  canAccessSpjByNotaDinas,
  isFinanceUnitUser,
  resolveCurrentPegawai,
} from "@/lib/document-access";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import { useUnitKerja } from "@/modules/unit-kerja/useUnitKerja";
import type {
  DokumenKeuangan,
  JenisDokumen,
  PaymentCompletionInput,
} from "../keuangan.schema";
import { useKeuangan } from "../useKeuangan";
import { DokumenPreview } from "./DokumenPreview";
import { PaymentCompletionDialog } from "./PaymentCompletionDialog";
import { formatRupiah, formatTableDate } from "@/lib/formatters";

const required: Partial<Record<JenisDokumen, JenisDokumen>> = {
  "Daftar Nominatif": "SPBY",
  "Tanda Terima": "Daftar Nominatif",
  Kuitansi: "Tanda Terima",
};
export function DokumenKeuanganPage({ jenis }: { jenis: JenisDokumen }) {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { items: reports, isLoading: reportsLoading } = useLaporan();
  const { items: sppds, isLoading: sppdsLoading } = useSppd();
  const { items: spts } = useSpt();
  const { items: notas } = useNotaDinas();
  const { items: dipas } = useDipa();
  const { items: pegawais } = usePegawai();
  const { items: unitKerja } = useUnitKerja();
  const { items: jabatans } = useJabatan();
  const { items: pangkats } = usePangkat();
  const { items: penandatangans } = usePenandatangan();
  const [paymentTarget, setPaymentTarget] = useState<DokumenKeuangan | null>(
    null,
  );
  const data = useKeuangan(
    reports,
    { sppds, spts, notas, dipas },
    !reportsLoading && !sppdsLoading,
  );
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const isAdministrator = user?.role === "Administrator";
  const canManageFinanceDocument = isFinanceUnitUser(
    user,
    currentPegawai,
    unitKerja,
  );
  const canViewAllFinanceDocuments =
    isAdministrator || canManageFinanceDocument;
  const canDeleteDocument = isAdministrator && hasPermission(jenis, "D");
  const canCompletePayment =
    jenis === "Kuitansi" &&
    user?.role === "Sub Bagian Keuangan" &&
    !!currentPegawai &&
    canManageFinanceDocument;
  const paymentOfficerName =
    currentPegawai?.nama ?? user?.name ?? "Sub Bagian Keuangan";
  if (!hasPermission(jenis, "R"))
    return <Alert variant="error">Akses ditolak.</Alert>;
  const generate = async (spjId: string) => {
    if (!canManageFinanceDocument) {
      addToast(
        `${jenis} hanya dapat dibuat oleh Unit Sub Bagian Keuangan.`,
        "error",
      );
      return;
    }
    const spj = data.items.find((x) => x.id === spjId);
    if (!spj) return;
    try {
      const document = await data.generate({
        id: spjId,
        jenis,
      });
      addToast(`${jenis} berhasil dibuat`, "success");
      data.setPreview(document);
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Dokumen gagal dibuat",
        "error",
      );
    }
  };
  const regenerate = async (spjId: string) => {
    if (!canManageFinanceDocument) {
      addToast(
        `${jenis} hanya dapat dibuat ulang oleh Unit Sub Bagian Keuangan.`,
        "error",
      );
      return;
    }
    if (jenis !== "SPBY") return;
    if (
      !confirm(
        "Buat ulang SPBY akan menimpa dokumen SPBY lama untuk SPJ ini. Lanjutkan?",
      )
    ) {
      return;
    }

    try {
      const document = await data.regenerate({
        id: spjId,
        jenis,
      });
      addToast("SPBY berhasil dibuat ulang", "success");
      if (document) data.setPreview(document);
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "SPBY gagal dibuat ulang",
        "error",
      );
    }
  };
  const completePayment = async (payment: PaymentCompletionInput) => {
    if (!paymentTarget || !canCompletePayment) {
      addToast(
        "Penyelesaian pembayaran hanya dapat dilakukan oleh Unit Sub Bagian Keuangan.",
        "error",
      );
      return;
    }

    try {
      await data.completePayment({
        documentId: paymentTarget.id,
        payment,
      });
      addToast("Pembayaran berhasil ditandai selesai", "success");
      setPaymentTarget(null);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Status pembayaran gagal disimpan.",
        "error",
      );
    }
  };
  const removeDocument = async (document: DokumenKeuangan) => {
    if (!canDeleteDocument) {
      addToast(
        `Hanya Administrator yang dapat menghapus ${document.jenis}.`,
        "error",
      );
      return;
    }
    if (
      !confirm(
        `Hapus ${document.jenis} nomor ${document.nomor}? Dokumen yang dihapus tidak dapat dipulihkan.`,
      )
    ) {
      return;
    }

    try {
      await data.removeDocument(document.id);
      if (paymentTarget?.id === document.id) setPaymentTarget(null);
      addToast(`${document.jenis} berhasil dihapus`, "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : `${document.jenis} gagal dihapus`,
        "error",
      );
    }
  };
  const eligible = data.items.filter(
    (x) =>
      ["Validasi Selesai", "Proses Pembayaran", "Pembayaran Selesai"].includes(
        x.status,
      ) &&
      (canViewAllFinanceDocuments ||
        canAccessSpjByNotaDinas(
          currentPegawaiId,
          x,
          reports,
          sppds,
          spts,
          notas,
        )),
  );
  const dependency = required[jenis];
  const isIndividualDocument =
    jenis === "SPBY" || jenis === "Tanda Terima" || jenis === "Kuitansi";
  const isPaymentDocument = jenis === "Kuitansi";
  const getPenerimaLabel = (doc?: { rincian: { pegawaiId: string }[] }) => {
    const pegawaiId = doc?.rincian[0]?.pegawaiId;
    if (!pegawaiId) return "Per orang";
    return pegawais.find((item) => item.id === pegawaiId)?.nama ?? "-";
  };
  const formatPaymentDate = (value?: string) => formatTableDate(value);
  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={reportsLoading || sppdsLoading || data.isLoading || data.isBusy}
        message={`Memproses ${jenis}...`}
      />
      <div>
        <h1 className="text-xl font-extrabold">{jenis}</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Generate dan cetak {jenis} berdasarkan SPJ yang telah selesai
          divalidasi
          {isPaymentDocument
            ? ", kemudian konfirmasikan setelah dana benar-benar dibayarkan."
            : "."}
        </p>
      </div>
      {!eligible.length && (
        <Alert variant="warning" title="Belum Dapat Diproses">
          Selesaikan Validasi SPJ terlebih dahulu.
        </Alert>
      )}
      {!canViewAllFinanceDocuments && (
        <Alert variant="info" title="Akses Terbatas">
          Anda hanya dapat melihat {jenis} yang berasal dari Nota Dinas yang
          mencantumkan Anda sebagai personil.
        </Alert>
      )}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SPPD</TableHead>
              {isIndividualDocument && <TableHead>Penerima</TableHead>}
              <TableHead>Status SPJ</TableHead>
              <TableHead>Prasyarat</TableHead>
              <TableHead>Nomor {jenis}</TableHead>
              <TableHead>Total</TableHead>
              {isPaymentDocument && (
                <>
                  <TableHead>Status Pembayaran</TableHead>
                  <TableHead>Detail Pembayaran</TableHead>
                </>
              )}
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eligible.flatMap((spj) => {
              const docs = spj.dokumen.filter((x) => x.jenis === jenis);
              const rows =
                isIndividualDocument && docs.length ? docs : [docs[0]];
              const prereqOk =
                !dependency || spj.dokumen.some((x) => x.jenis === dependency);
              return rows.map((doc, index) => (
                <TableRow key={`${spj.id}-${doc?.id ?? `new-${index}`}`}>
                  <TableCell className="font-mono font-bold">
                    {sppds.find((x) => x.id === (doc?.sppdId ?? spj.sppdId))
                      ?.nomor ?? "-"}
                  </TableCell>
                  {isIndividualDocument && (
                    <TableCell>{getPenerimaLabel(doc)}</TableCell>
                  )}
                  <TableCell>
                    <Badge
                      variant={
                        spj.status === "Proses Pembayaran" ? "info" : "success"
                      }
                    >
                      {spj.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dependency ? (
                      <Badge variant={prereqOk ? "success" : "warning"}>
                        {dependency}
                      </Badge>
                    ) : (
                      "Validasi Selesai"
                    )}
                  </TableCell>
                  <TableCell>{doc?.nomor ?? "Belum dibuat"}</TableCell>
                  <TableCell>{doc ? formatRupiah(doc.total) : "-"}</TableCell>
                  {isPaymentDocument && (
                    <>
                      <TableCell>
                        {doc ? (
                          <Badge
                            variant={
                              doc.status === "Selesai" ? "success" : "warning"
                            }
                          >
                            {doc.status === "Selesai"
                              ? "Pembayaran Selesai"
                              : "Menunggu Pembayaran"}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {doc?.pembayaran ? (
                          <div className="space-y-0.5">
                            <div>
                              {formatPaymentDate(
                                doc.pembayaran.tanggalPembayaran,
                              )}
                            </div>
                            <div className="text-muted-foreground">
                              {doc.pembayaran.metodePembayaran}
                              {doc.pembayaran.referensiPembayaran
                                ? ` · ${doc.pembayaran.referensiPembayaran}`
                                : ""}
                            </div>
                            <div className="text-muted-foreground">
                              Oleh: {doc.pembayaran.petugasPembayaran}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </>
                  )}
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {doc ? (
                        <>
                          {jenis === "SPBY" &&
                            index === 0 &&
                            canManageFinanceDocument && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => regenerate(spj.id)}
                              >
                                <RefreshCcw className="w-4 h-4" /> Buat Ulang
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => data.setPreview(doc)}
                            title="Pratinjau & Cetak"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          {canDeleteDocument && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDocument(doc)}
                              title={`Hapus ${jenis}`}
                              className="text-danger hover:bg-danger/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                          {isPaymentDocument &&
                            canCompletePayment &&
                            doc.status !== "Selesai" && (
                              <Button
                                size="sm"
                                onClick={() => setPaymentTarget(doc)}
                              >
                                <CircleCheckBig className="w-4 h-4" />
                                Tandai Pembayaran Selesai
                              </Button>
                            )}
                        </>
                      ) : (
                        <Button
                          size="sm"
                          disabled={
                            !prereqOk ||
                            !hasPermission(jenis, "C") ||
                            !canManageFinanceDocument
                          }
                          onClick={() => generate(spj.id)}
                        >
                          <FilePlus2 className="w-4 h-4" /> Generate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <DokumenPreview
        document={data.preview?.jenis === jenis ? data.preview : null}
        pegawais={pegawais}
        jabatans={jabatans}
        pangkats={pangkats}
        penandatangans={penandatangans}
        spts={spts}
        sppds={sppds}
        reports={reports}
        notas={notas}
        dipas={dipas}
        onClose={() => data.setPreview(null)}
      />
      <PaymentCompletionDialog
        document={paymentTarget}
        recipientName={getPenerimaLabel(paymentTarget ?? undefined)}
        officerName={paymentOfficerName}
        isSubmitting={data.isBusy}
        onClose={() => setPaymentTarget(null)}
        onSubmit={completePayment}
      />
    </div>
  );
}
