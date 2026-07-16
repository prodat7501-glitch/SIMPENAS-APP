"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { useSbm } from "@/modules/sbm/useSbm";
import { NotaDinasTable } from "@/modules/nota-dinas/components/NotaDinasTable";
import { NotaDinasForm } from "@/modules/nota-dinas/components/NotaDinasForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import { TemplateFooter, TemplateHeader, useTemplateDocumentStyle } from "@/components/document/DocumentTemplate";
import { PrintExportActions } from "@/components/ui/print-export-actions";
import { useActivityStore } from "@/stores/activity.store";
import { useNotificationStore } from "@/stores/notification.store";

type LampiranAmountField =
  | "uangHarian"
  | "uangTransport"
  | "penginapan"
  | "tiketPesawat";

export default function NotaDinasPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove, generateNomor } = useNotaDinas();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const { items: penandatangans } = usePenandatangan();
  const { items: sbms } = useSbm();
  const { addToast } = useToast();
  const addActivity = useActivityStore((state) => state.add);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const templateStyle = useTemplateDocumentStyle();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NotaDinas | null>(null);
  const [previewItem, setPreviewItem] = useState<NotaDinas | null>(null);

  // RBAC checks
  const canRead = hasPermission("Nota Dinas", "R");
  const canCreate = hasPermission("Nota Dinas", "C");
  const canUpdate = hasPermission("Nota Dinas", "U");
  const canDelete = hasPermission("Nota Dinas", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman transaksi Nota Dinas.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: NotaDinas) => {
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui data", "error");
      return;
    }
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      addToast("Anda tidak memiliki izin untuk menghapus data", "error");
      return;
    }
    if (
      confirm("Apakah Anda yakin ingin menghapus transaksi Nota Dinas ini?")
    ) {
      remove(id);
      addToast("Nota Dinas berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (data: Omit<NotaDinas, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Nota Dinas berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Nota Dinas berhasil disimpan", "success");
    }
    if (data.status === "Menunggu Approval") {
      addNotification(
        "Nota Dinas Menunggu Approval",
        `${data.nomor} telah diajukan kepada Supervisor.`,
        "info",
      );
      addActivity({
        action: "Approval",
        module: "Nota Dinas",
        description: `Mengajukan ${data.nomor} untuk approval`,
        user: "Pengguna aktif",
      });
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const getPegawaiNameAndNip = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    return p ? `${p.nama} / NIP. ${p.nip || "-"}` : "-";
  };

  const getPegawaiJabatan = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    if (!p) return "-";
    const j = jabatans.find((x) => x.id === p.jabatanId);
    return j ? j.nama : "-";
  };

  const getPenandatanganDetail = (id: string) => {
    const p = penandatangans.find((x) => x.id === id);
    return p ? p : null;
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatRupiahIfFilled = (val: number) =>
    Number(val) > 0 ? formatRupiah(val) : "";

  const hasLampiranAmount = (item: NotaDinas, field: LampiranAmountField) =>
    item.lampiran.some((lampiran) => Number(lampiran[field]) > 0);

  const getTransportBandara = (item: NotaDinas["lampiran"][number]) =>
    Number(item.transportBandaraAsal) + Number(item.transportBandaraTujuan);

  const hasTransportBandara = (item: NotaDinas) =>
    item.lampiran.some((lampiran) => getTransportBandara(lampiran) > 0);

  const getPrintableAmountColumnCount = (item: NotaDinas) =>
    [
      hasLampiranAmount(item, "uangHarian"),
      hasLampiranAmount(item, "uangTransport"),
      hasLampiranAmount(item, "penginapan"),
      hasLampiranAmount(item, "tiketPesawat"),
      hasTransportBandara(item),
    ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Hide controls during printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Transaksi Nota Dinas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Buat dan cetak nota dinas usulan perjalanan dinas pegawai.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat Nota Dinas
          </Button>
        )}
      </div>

      <div className="no-print">
        <NotaDinasTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={(item) => setPreviewItem(item)}
          canEdit={canUpdate || canDelete}
        />
      </div>

      {/* Main Dialog Form */}
      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={
          editingItem ? "Ubah Transaksi Nota Dinas" : "Buat Nota Dinas Baru"
        }
        className="max-w-6xl"
      >
        <NotaDinasForm
          initialValues={editingItem}
          pegawais={pegawais}
          penandatangans={penandatangans}
          sbms={sbms}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          onGenerateNomor={generateNomor}
        />
      </Dialog>

      {/* High-Fidelity Printable Document Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print-direct">
          <div style={templateStyle} className="bg-white text-black w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-2xl space-y-6 print-container relative my-auto">
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
              <PrintExportActions
                title={`Nota Dinas ${previewItem.nomor}`}
                module="Nota Dinas"
                description={`Mencetak atau mengekspor Nota Dinas ${previewItem.nomor}`}
                printLabel="Cetak Fisik"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewItem(null)}
                className="h-8 w-8 text-black hover:bg-black/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Kop Surat Resmi */}
            <TemplateHeader />

            {/* Judul Nota Dinas */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold underline tracking-wider uppercase">
                NOTA DINAS
              </h3>
              <p className="text-xs font-mono">Nomor: {previewItem.nomor}</p>
            </div>

            {/* Memo Headers */}
            <div className="grid grid-cols-12 gap-x-2 gap-y-2 text-xs border-b border-black pb-4">
              <div className="col-span-2 font-bold">Kepada</div>
              <div className="col-span-10">: {previewItem.kepada}</div>

              <div className="col-span-2 font-bold">Dari</div>
              <div className="col-span-10">: {previewItem.dari}</div>

              <div className="col-span-2 font-bold">Tanggal</div>
              <div className="col-span-10">: {previewItem.tanggal}</div>

              <div className="col-span-2 font-bold">Sifat</div>
              <div className="col-span-10">: {previewItem.sifat}</div>

              <div className="col-span-2 font-bold">Perihal</div>
              <div className="col-span-10 font-bold uppercase">
                : {previewItem.perihal}
              </div>

              {previewItem.tembusan && (
                <>
                  <div className="col-span-2 font-bold">Tembusan</div>
                  <div className="col-span-10">: {previewItem.tembusan}</div>
                </>
              )}
            </div>

            {/* Isi Ringkasan */}
            <div className="text-xs leading-relaxed space-y-4 min-h-[100px] text-justify whitespace-pre-line">
              {previewItem.isi}
            </div>

            {/* Lampiran Personil & Anggaran (Tabel Resmi) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase underline">
                Lampiran Rincian Personil & Anggaran:
              </h4>
              <div className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse border border-black text-[9px] nota-dinas-print-table">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-1.5 text-center w-8">
                      No
                    </th>
                    <th className="border border-black p-1.5 text-center">
                      Nama / NIP
                    </th>
                    <th className="border border-black p-1.5 text-center">
                      Jabatan
                    </th>
                    {hasLampiranAmount(previewItem, "uangHarian") && (
                      <th className="border border-black p-1.5 text-center">
                        Uang Harian
                      </th>
                    )}
                    {hasLampiranAmount(previewItem, "uangTransport") && (
                      <th className="border border-black p-1.5 text-center">
                        Transport
                      </th>
                    )}
                    {hasLampiranAmount(previewItem, "penginapan") && (
                      <th className="border border-black p-1.5 text-center">
                        Penginapan
                      </th>
                    )}
                    {hasLampiranAmount(previewItem, "tiketPesawat") && (
                      <th className="border border-black p-1.5 text-center">
                        Tiket
                      </th>
                    )}
                    {hasTransportBandara(previewItem) && (
                      <th className="border border-black p-1.5 text-center">
                        Trans. Bandara
                      </th>
                    )}
                    <th className="border border-black p-1.5 text-center w-12">
                      Durasi
                    </th>
                    <th className="border border-black p-1.5 text-center w-28">
                      Total Biaya
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewItem.lampiran.map((item, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-1.5 text-center">
                        {idx + 1}
                      </td>
                      <td className="border border-black p-1.5 font-bold">
                        {getPegawaiNameAndNip(item.pegawaiId)}
                      </td>
                      <td className="border border-black p-1.5">
                        {getPegawaiJabatan(item.pegawaiId)}
                      </td>
                      {hasLampiranAmount(previewItem, "uangHarian") && (
                        <td className="border border-black p-1.5 text-right">
                          {formatRupiahIfFilled(item.uangHarian)}
                        </td>
                      )}
                      {hasLampiranAmount(previewItem, "uangTransport") && (
                        <td className="border border-black p-1.5 text-right">
                          {formatRupiahIfFilled(item.uangTransport)}
                        </td>
                      )}
                      {hasLampiranAmount(previewItem, "penginapan") && (
                        <td className="border border-black p-1.5 text-right">
                          {formatRupiahIfFilled(item.penginapan)}
                        </td>
                      )}
                      {hasLampiranAmount(previewItem, "tiketPesawat") && (
                        <td className="border border-black p-1.5 text-right">
                          {formatRupiahIfFilled(item.tiketPesawat)}
                        </td>
                      )}
                      {hasTransportBandara(previewItem) && (
                        <td className="border border-black p-1.5 text-right">
                          {formatRupiahIfFilled(getTransportBandara(item))}
                        </td>
                      )}
                      <td className="border border-black p-1.5 text-center">
                        {item.volume} Hari
                      </td>
                      <td className="border border-black p-1.5 text-right font-bold">
                        {formatRupiah(item.total)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td
                      colSpan={4 + getPrintableAmountColumnCount(previewItem)}
                      className="border border-black p-2 text-right uppercase"
                    >
                      Total Anggaran:
                    </td>
                    <td className="border border-black p-2 text-right text-primary">
                      {formatRupiah(previewItem.totalBiaya)}
                    </td>
                  </tr>
                </tbody>
              </table>
              </div>
            </div>

            {/* Paraf & Tanda Tangan */}
            <div className="pt-8">
              <div className="flex items-end justify-between gap-6">
                <table className="w-80 border-collapse border border-black text-[9px] nota-dinas-paraf-table">
                  <thead>
                    <tr>
                      <th className="border border-black p-1 text-center">
                        Jabatan
                      </th>
                      <th className="border border-black p-1 text-center">
                        Paraf
                      </th>
                      <th className="border border-black p-1 text-center">
                        Tanggal
                      </th>
                      <th className="border border-black p-1 text-center">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Sekretaris (KPA)", "PPK", "PPSPM"].map((jabatan) => (
                      <tr key={jabatan}>
                        <td className="border border-black p-1 h-6">
                          {jabatan}
                        </td>
                        <td className="border border-black p-1 h-6" />
                        <td className="border border-black p-1 h-6" />
                        <td className="border border-black p-1 h-6" />
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="w-72 space-y-16 text-center text-xs">
                  <div className="space-y-1">
                    <p className="font-bold">
                      {getPenandatanganDetail(previewItem.penandatanganId)
                        ?.jabatanPenandatangan ||
                        "Kuasa Pengguna Anggaran (KPA)"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline uppercase">
                      {getPenandatanganDetail(previewItem.penandatanganId)
                        ?.nama || "Herman Monoarfa, M.Si"}
                    </p>
                    <p className="text-gray-500 font-mono text-[10px]">
                      NIP.{" "}
                      {getPenandatanganDetail(previewItem.penandatanganId)
                        ?.nip || "-"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <TemplateFooter />
          </div>
        </div>
      )}

      {/* Global CSS for hiding print wrappers */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          html,
          body {
            width: 210mm;
            min-height: 297mm;
            background: white !important;
          }
          body * {
            visibility: hidden;
          }
          .print-direct,
          .print-direct * {
            visibility: visible;
          }
          .print-direct {
            position: static !important;
            left: 0;
            top: 0;
            width: 100% !important;
            min-height: auto !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            display: block !important;
            overflow: visible !important;
          }
          .print-container {
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            width: auto !important;
            max-width: 100% !important;
            min-height: auto !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            font-size: 11px !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .nota-dinas-print-table {
            table-layout: fixed;
            font-size: 7.5px !important;
            line-height: 1.15 !important;
            page-break-inside: auto;
          }
          .nota-dinas-print-table th,
          .nota-dinas-print-table td {
            padding: 2px !important;
            word-break: break-word;
            vertical-align: top;
          }
          .nota-dinas-print-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .nota-dinas-paraf-table {
            width: 70mm !important;
            font-size: 7.5px !important;
            line-height: 1.1 !important;
          }
          .nota-dinas-paraf-table th,
          .nota-dinas-paraf-table td {
            padding: 2px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
