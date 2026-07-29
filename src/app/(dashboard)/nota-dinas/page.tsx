"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { useSbm } from "@/modules/sbm/useSbm";
import { useSpt } from "@/modules/spt/useSpt";
import { useSppd } from "@/modules/sppd/useSppd";
import { useDipa } from "@/modules/dipa/useDipa";
import { NotaDinasTable } from "@/modules/nota-dinas/components/NotaDinasTable";
import { NotaDinasForm } from "@/modules/nota-dinas/components/NotaDinasForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExportDataButton } from "@/components/ui/export-data-button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import {
  getLampiranCostLines,
  type LampiranCostLine,
} from "@/modules/nota-dinas/nota-dinas-calculation";
import type { NotaDinasTravelConflict } from "@/modules/nota-dinas/nota-dinas.service";
import { getDipaBudgetAvailability } from "@/modules/nota-dinas/nota-dinas-budget";
import {
  TemplateFooter,
  TemplateHeader,
  useTemplateDocumentStyle,
} from "@/components/document/DocumentTemplate";
import { PrintExportActions } from "@/components/ui/print-export-actions";
import { PrintPageSetup } from "@/components/ui/print-preview";
import { useActivityStore } from "@/stores/activity.store";
import { useNotificationStore } from "@/stores/notification.store";
import {
  getNotaDinasApprovalDestination,
  isPenandatanganAvailable,
  resolveNotaDinasApprover,
  snapshotToPenandatangan,
} from "@/modules/penandatangan/penandatangan.service";

const formatTanggal = (value: string) => {
  const parts = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const date = parts
    ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
    : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const normalizeName = (value: string) =>
  value.trim().toLocaleLowerCase("id-ID");

const normalizeNip = (value: string) => value.replace(/\D/g, "");

const isKasubbagSigner = (value: string) => {
  const text = value.toLowerCase();
  return (
    text.includes("kasubbag") ||
    text.includes("kepala sub bagian") ||
    text.includes("kepala subbagian")
  );
};

const getPrintableCostColumns = (item: NotaDinas): LampiranCostLine[] => {
  const columns = new Map<LampiranCostLine["key"], LampiranCostLine>();
  item.lampiran.forEach((row) => {
    getLampiranCostLines(row, item.jenis).forEach((line) => {
      if (line.subtotal > 0 && !columns.has(line.key)) {
        columns.set(line.key, line);
      }
    });
  });
  return Array.from(columns.values());
};

export default function NotaDinasPage() {
  const { user, hasPermission } = useAuth();
  const {
    items,
    add,
    update,
    remove,
    generateNomor,
    releaseNomor,
    findTravelConflicts,
  } = useNotaDinas();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const { items: penandatangans } = usePenandatangan();
  const { items: sbms } = useSbm();
  const { items: spts } = useSpt();
  const { items: sppds } = useSppd();
  const { items: dipas } = useDipa();
  const { addToast } = useToast();
  const addActivity = useActivityStore((state) => state.add);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const templateStyle = useTemplateDocumentStyle();

  const normalizedUserName = user?.name ? normalizeName(user.name) : "";
  const currentPegawai =
    pegawais.find((pegawai) => pegawai.id === user?.pegawaiId) ??
    pegawais.find(
      (pegawai) =>
        Boolean(normalizedUserName) &&
        normalizeName(pegawai.nama) === normalizedUserName,
    );
  const defaultPengirimJabatan =
    jabatans.find((jabatan) => jabatan.id === currentPegawai?.jabatanId)
      ?.nama ?? "";
  const currentPegawaiNip = normalizeNip(currentPegawai?.nip ?? "");
  const currentNotaDinasPenandatangan =
    penandatangans.find((item) => {
      const signerIdentity = `${item.jabatanPenandatangan} ${item.peran}`;
      const signerNip = normalizeNip(item.nip);
      const sameNip = Boolean(
        currentPegawaiNip && signerNip === currentPegawaiNip,
      );
      const sameName = Boolean(
        normalizedUserName && normalizeName(item.nama) === normalizedUserName,
      );

      return (
        isKasubbagSigner(signerIdentity) &&
        isPenandatanganAvailable(item, "Nota Dinas") &&
        (sameNip || sameName)
      );
    }) ?? null;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NotaDinas | null>(null);
  const [previewItem, setPreviewItem] = useState<NotaDinas | null>(null);
  const [pendingNumber, setPendingNumber] = useState<string | null>(null);

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
    const ownerPegawaiId = item.createdByPegawaiId;
    const isOwner =
      user?.role === "Administrator" ||
      (Boolean(currentPegawai?.id) && ownerPegawaiId === currentPegawai?.id) ||
      (!ownerPegawaiId &&
        item.penandatanganId === currentNotaDinasPenandatangan?.id);
    if (!isOwner) {
      addToast(
        "Nota Dinas hanya dapat diperbaiki oleh Kasubbag pembuatnya.",
        "error",
      );
      return;
    }
    setEditingItem(item);
    setPendingNumber(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      addToast("Hanya Administrator yang dapat menghapus Nota Dinas", "error");
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
    const authoritativePenandatanganId =
      editingItem?.penandatanganId ?? currentNotaDinasPenandatangan?.id;
    if (!authoritativePenandatanganId) {
      addToast(
        "Akun login belum terhubung dengan Pejabat Penandatangan Nota Dinas aktif",
        "error",
      );
      return;
    }
    const securedData: Omit<NotaDinas, "id"> = {
      ...data,
      createdByPegawaiId:
        editingItem?.createdByPegawaiId || currentPegawai?.id || "",
      catatanRevisi: editingItem?.catatanRevisi ?? data.catatanRevisi ?? "",
      penandatanganId: authoritativePenandatanganId,
      penandatanganSnapshot:
        editingItem?.penandatanganSnapshot ??
        data.penandatanganSnapshot ??
        null,
    };

    if (securedData.status === "Menunggu Approval") {
      const selectedDipa = dipas.find((dipa) => dipa.id === securedData.dipaId);
      const budget = getDipaBudgetAvailability({
        dipa: selectedDipa,
        notas: items,
        currentTotal: securedData.totalBiaya,
        excludeNotaDinasId: editingItem?.id,
      });
      if (!selectedDipa || budget.exceeded) {
        addToast(
          !selectedDipa
            ? "Sumber Anggaran DIPA wajib dipilih sebelum Nota Dinas dikirim."
            : `Pagu ${selectedDipa.kodeDipa} tidak mencukupi. Sisa tersedia ${formatRupiah(budget.available)}.`,
          "error",
        );
        return;
      }
    }

    if (editingItem) {
      update(editingItem.id!, securedData);
      addToast("Nota Dinas berhasil diperbarui", "success");
    } else {
      add(securedData);
      addToast("Nota Dinas berhasil disimpan", "success");
    }
    if (securedData.status === "Menunggu Approval") {
      const approvalDestination = getNotaDinasApprovalDestination(
        resolveNotaDinasApprover(penandatangans, securedData.tanggal),
      );
      addNotification(
        "Nota Dinas Menunggu Approval",
        `${securedData.nomor} telah diajukan kepada ${approvalDestination}.`,
        "info",
      );
      addActivity({
        action: "Approval",
        module: "Nota Dinas",
        description: `Mengajukan ${securedData.nomor} kepada ${approvalDestination} untuk approval`,
        user: "Pengguna aktif",
      });
    }
    setPendingNumber(null);
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    if (!editingItem && pendingNumber) {
      releaseNomor(pendingNumber);
    }
    setPendingNumber(null);
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleTravelConflictsDetected = (
    conflicts: NotaDinasTravelConflict[],
  ) => {
    const detail = conflicts
      .map((conflict) => {
        const namaPegawai =
          pegawais.find((pegawai) => pegawai.id === conflict.pegawaiId)?.nama ||
          "Personel";
        return `${namaPegawai}: Nota Dinas ${conflict.nomorNotaDinas}, ${formatTanggal(conflict.tanggalBerangkat)} s.d. ${formatTanggal(conflict.tanggalKembali)}, ${conflict.lokasiTujuan}`;
      })
      .join(" | ");

    addNotification("Potensi Perjalanan Dinas Ganda", detail, "error");
    addToast(
      `${conflicts.length} benturan jadwal ditemukan. Nota Dinas tetap disimpan dengan peringatan.`,
      "error",
    );
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

  const getPenandatanganDetail = (id: string, item?: NotaDinas | null) => {
    if (item?.penandatanganSnapshot) {
      return snapshotToPenandatangan(item.penandatanganSnapshot);
    }
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

  const previewCostColumns = previewItem
    ? getPrintableCostColumns(previewItem)
    : [];

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
        <div className="flex flex-wrap items-center gap-2">
          <ExportDataButton
            title="Data Nota Dinas"
            module="Nota Dinas"
            rows={items}
            defaultFileName={`data-nota-dinas-${new Date().toISOString().slice(0, 10)}`}
            columns={[
              {
                header: "No",
                value: (_, index) => index + 1,
                type: "number",
                width: 45,
              },
              { header: "Nomor", value: (item) => item.nomor, width: 180 },
              { header: "Perihal", value: (item) => item.perihal, width: 260 },
              {
                header: "Tanggal",
                value: (item) => formatTanggal(item.tanggal),
                width: 100,
              },
              { header: "Pengirim", value: (item) => item.dari, width: 180 },
              { header: "Tipe Dinas", value: (item) => item.jenis, width: 95 },
              {
                header: "Personil",
                value: (item) =>
                  item.lampiran
                    .map(
                      (row) =>
                        pegawais.find((pegawai) => pegawai.id === row.pegawaiId)
                          ?.nama ?? row.pegawaiId,
                    )
                    .join(", "),
                width: 240,
              },
              {
                header: "Total Biaya",
                value: (item) => item.totalBiaya,
                type: "currency",
                width: 110,
              },
              { header: "Status", value: (item) => item.status, width: 110 },
            ]}
          />
          {canCreate && (
            <Button
              onClick={() => {
                setEditingItem(null);
                setPendingNumber(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat Nota Dinas
            </Button>
          )}
        </div>
      </div>

      <div className="no-print">
        <NotaDinasTable
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={(item) => setPreviewItem(item)}
          canEdit={canUpdate}
          canEditItem={(item) =>
            user?.role === "Administrator" ||
            item.createdByPegawaiId === currentPegawai?.id ||
            (!item.createdByPegawaiId &&
              item.penandatanganId === currentNotaDinasPenandatangan?.id)
          }
          canDelete={canDelete}
          getPegawaiName={(pegawaiId) =>
            pegawais.find((pegawai) => pegawai.id === pegawaiId)?.nama ?? "-"
          }
        />
      </div>

      {/* Main Dialog Form */}
      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={
          editingItem ? "Ubah Transaksi Nota Dinas" : "Buat Nota Dinas Baru"
        }
        className="flex max-h-[92vh] max-w-6xl flex-col"
        bodyClassName="min-h-0 flex-1 overflow-y-auto pr-2"
      >
        <NotaDinasForm
          initialValues={editingItem}
          defaultPengirimJabatan={defaultPengirimJabatan}
          loginPenandatangan={currentNotaDinasPenandatangan}
          pegawais={pegawais}
          penandatangans={penandatangans}
          sbms={sbms}
          dipas={dipas}
          notas={items}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          onGenerateNomor={generateNomor}
          onNumberReserved={setPendingNumber}
          onFindTravelConflicts={(input) =>
            findTravelConflicts({
              ...input,
              excludeNotaDinasId: editingItem?.id,
              spts,
              sppds,
            })
          }
          onTravelConflictsDetected={handleTravelConflictsDetected}
        />
      </Dialog>

      {/* High-Fidelity Printable Document Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print-direct">
          <div
            style={templateStyle}
            className="bg-white text-black w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-2xl space-y-6 print-container relative my-auto"
          >
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
              <div className="col-span-10">
                : {formatTanggal(previewItem.tanggal)}
              </div>

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
              <div className="text-xs font-bold uppercase">
                <h4>Lampiran Rincian Personil & Anggaran</h4>
                <p className="normal-case">
                  Sumber Anggaran :{" "}
                  {dipas.find((dipa) => dipa.id === previewItem.dipaId)
                    ?.kodeDipa ?? "-"}
                </p>
              </div>
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
                      {previewCostColumns.map((column) => (
                        <th
                          key={column.key}
                          className="border border-black p-1.5 text-center"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="border border-black p-1.5 text-center w-28">
                        Total Biaya
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortByPegawaiOrder(
                      previewItem.lampiran,
                      (item) => item.pegawaiId,
                      pegawais,
                    ).map((item, idx) => (
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
                        {previewCostColumns.map((column) => {
                          const line = getLampiranCostLines(
                            item,
                            previewItem.jenis,
                          ).find((candidate) => candidate.key === column.key);
                          return (
                            <td
                              key={column.key}
                              className="border border-black p-1.5 text-right"
                            >
                              {line && line.subtotal > 0 ? (
                                <div className="space-y-0.5">
                                  <div>{formatRupiah(line.rate)}</div>
                                  <div>
                                    × {line.quantity} {line.unit}
                                  </div>
                                  <div className="font-bold">
                                    = {formatRupiah(line.subtotal)}
                                  </div>
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                        <td className="border border-black p-1.5 text-right font-bold">
                          {formatRupiah(item.total)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td
                        colSpan={3 + previewCostColumns.length}
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
                      {getPenandatanganDetail(
                        previewItem.penandatanganId,
                        previewItem,
                      )?.jabatanPenandatangan ||
                        "Kuasa Pengguna Anggaran (KPA)"}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline uppercase">
                      {getPenandatanganDetail(
                        previewItem.penandatanganId,
                        previewItem,
                      )?.nama || "Herman Monoarfa, M.Si"}
                    </p>
                    <p className="text-gray-500 font-mono text-[10px]">
                      NIP.{" "}
                      {getPenandatanganDetail(
                        previewItem.penandatanganId,
                        previewItem,
                      )?.nip || "-"}
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
            font-size: 6.5px !important;
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
      {previewItem && <PrintPageSetup printPageSize="210mm 297mm" />}
    </div>
  );
}
