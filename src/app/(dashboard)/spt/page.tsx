"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSpt } from "@/modules/spt/useSpt";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { SptTable } from "@/modules/spt/components/SptTable";
import { SptForm } from "@/modules/spt/components/SptForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { Spt } from "@/modules/spt/spt.schema";
import { useNotificationStore } from "@/stores/notification.store";
import { useActivityStore } from "@/stores/activity.store";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import {
  canAccessSptByNotaDinas,
  isPegawaiInNotaDinas,
  resolveCurrentPegawai,
} from "@/lib/document-access";
import { TemplateFooter, useTemplateDocumentStyle } from "@/components/document/DocumentTemplate";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import { PrintExportActions } from "@/components/ui/print-export-actions";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";

const formatTanggalIndonesia = (dateStr: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));

function SptTemplateHeader() {
  const template = useDocumentTemplate();
  return (
    <header
      className="pb-3 text-center"
      style={{ textAlign: template.alignment }}
    >
      <Image
        src={template.logo}
        alt="Logo instansi"
        width={56}
        height={56}
        className="mx-auto mb-2 h-14 w-14 object-contain"
      />
      <h1 className="text-base font-black tracking-wide uppercase">
        KOMISI PEMILIHAN UMUM
      </h1>
      <p className="text-base font-black tracking-wide uppercase">
        KABUPATEN GORONTALO
      </p>
      <p className="mt-1 text-[10px] italic text-gray-500">
        {template.alamat}
      </p>
    </header>
  );
}

export default function SptPage() {
  const { user, hasPermission } = useAuth();
  const { items, add, update, remove, generateNomor } = useSpt();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const { items: pangkats } = usePangkat();
  const { items: penandatangans } = usePenandatangan();
  const { items: notaDinasItems } = useNotaDinas();
  const { addToast } = useToast();
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );
  const addActivity = useActivityStore((state) => state.add);
  const templateStyle = useTemplateDocumentStyle();
  const sptTemplateStyle = {
    ...templateStyle,
    fontFamily: "Tahoma, Geneva, sans-serif",
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Spt | null>(null);
  const [previewItem, setPreviewItem] = useState<Spt | null>(null);

  // RBAC checks
  const canRead = hasPermission("SPT", "R");
  const canCreate = hasPermission("SPT", "C");
  const canUpdate = hasPermission("SPT", "U");
  const canDelete = hasPermission("SPT", "D");
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const scopeToNotaDinas = user?.role === "Pegawai";
  const accessibleNotaDinasItems = scopeToNotaDinas
    ? notaDinasItems.filter((item) =>
        isPegawaiInNotaDinas(currentPegawaiId, item),
      )
    : notaDinasItems;
  const visibleSpts = scopeToNotaDinas
    ? items.filter((item) =>
        canAccessSptByNotaDinas(currentPegawaiId, item, notaDinasItems),
      )
    : items;
  const canCreateFromAccessibleNota =
    canCreate &&
    (!scopeToNotaDinas ||
      accessibleNotaDinasItems.some((item) => item.status === "Disetujui"));

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman transaksi Surat
          Perintah Tugas (SPT).
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: Spt) => {
    if (
      scopeToNotaDinas &&
      !canAccessSptByNotaDinas(currentPegawaiId, item, notaDinasItems)
    ) {
      addToast("Anda hanya dapat mengubah SPT dari Nota Dinas Anda", "error");
      return;
    }
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui data", "error");
      return;
    }
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    if (
      target &&
      scopeToNotaDinas &&
      !canAccessSptByNotaDinas(currentPegawaiId, target, notaDinasItems)
    ) {
      addToast("Anda hanya dapat menghapus SPT dari Nota Dinas Anda", "error");
      return;
    }
    if (!canDelete) {
      addToast("Anda tidak memiliki izin untuk menghapus data", "error");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus transaksi SPT ini?")) {
      remove(id);
      addToast("SPT berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (
    data: Omit<Spt, "id">,
    options?: { keepOpen?: boolean },
  ) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("SPT berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("SPT berhasil disimpan", "success");
    }
    if (data.status === "Menunggu Approval") {
      addNotification(
        "SPT Menunggu Approval",
        `${data.nomor} telah diajukan kepada Supervisor.`,
        "info",
      );
      addActivity({
        action: "Approval",
        module: "SPT",
        description: `Mengajukan ${data.nomor} untuk approval`,
        user: "Pengguna aktif",
      });
    }
    if (!options?.keepOpen) {
      setModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const getPegawaiNameAndNip = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    return p ? `${p.nama} / NIP. ${p.nip || "-"}` : "-";
  };

  const getPegawaiPangkatGol = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    if (!p) return "-";
    const pk = pangkats.find((x) => x.id === p.pangkatId);
    return pk ? `${pk.namaPangkat} (${pk.golongan})` : "-";
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
  const isPegawaiKomisioner = (id: string) => {
    const pegawai = pegawais.find((x) => x.id === id);
    return (
      pegawai?.kategoriPegawai === "Ketua KPU" ||
      pegawai?.kategoriPegawai === "Anggota KPU"
    );
  };
  const isSptKomisioner = (item: Spt) =>
    item.personil.length > 0 &&
    item.personil.every((person) => isPegawaiKomisioner(person.pegawaiId));
  const getSptSigningOfficial = (item: Spt): Penandatangan | null => {
    const signer = getPenandatanganDetail(item.penandatanganId);
    const signerText = `${signer?.jabatanPenandatangan ?? ""} ${signer?.peran ?? ""}`.toLowerCase();
    if (!signerText.includes("ketua kpu")) return signer;
    const ketuaPegawai = pegawais.find(
      (pegawai) => pegawai.kategoriPegawai === "Ketua KPU",
    );
    return ketuaPegawai
      ? {
          id: signer?.id,
          nama: ketuaPegawai.nama,
          nip: ketuaPegawai.nip || "-",
          jabatanPenandatangan:
            signer?.jabatanPenandatangan || "Ketua KPU Kabupaten Gorontalo",
          peran: signer?.peran || "Ketua KPU",
          status: signer?.status || "Aktif",
        }
      : signer;
  };
  const getSptSignatureTitleLines = (item: Spt) => {
    const signer = getSptSigningOfficial(item);
    const signerText =
      `${signer?.jabatanPenandatangan ?? ""} ${signer?.peran ?? ""}`.toLowerCase();

    if (isSptKomisioner(item) || signerText.includes("ketua")) {
      return ["Ketua Komisi Pemilihan Umum", "Kabupaten Gorontalo"];
    }

    if (signerText.includes("sekretaris")) {
      return ["Sekretaris Komisi Pemilihan Umum", "Kabupaten Gorontalo"];
    }

    return [signer?.jabatanPenandatangan || "Kuasa Pengguna Anggaran (KPA)"];
  };
  const getNotaDinasNumber = (id: string) =>
    notaDinasItems.find((item) => item.id === id)?.nomor ?? "-";

  return (
    <div className="space-y-6">
      {/* Hide controls during printing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Surat Perintah Tugas (SPT)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola pembuatan dan penerbitan Surat Perintah Tugas dinas pegawai
            KPU.
          </p>
        </div>
        {canCreateFromAccessibleNota && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Buat SPT
          </Button>
        )}
      </div>

      <div className="no-print">
        <SptTable
          items={visibleSpts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={(item) => setPreviewItem(item)}
          canEdit={canUpdate || canDelete}
          getNotaDinasNumber={getNotaDinasNumber}
        />
      </div>

      {/* Main Dialog Form */}
      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingItem ? "Ubah Transaksi SPT" : "Buat SPT Baru"}
        className="max-w-6xl max-h-[92vh] flex flex-col"
        bodyClassName="overflow-y-auto pr-2"
      >
        <SptForm
          initialValues={editingItem}
          existingSpts={items}
          notaDinasItems={accessibleNotaDinasItems.filter(
            (item) =>
              item.status === "Disetujui" ||
              item.id === editingItem?.notaDinasId,
          )}
          pegawais={pegawais}
          penandatangans={penandatangans}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          onGenerateNomor={generateNomor}
        />
      </Dialog>

      {/* High-Fidelity Printable Document Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print-direct">
          <div style={sptTemplateStyle} className="bg-white text-black w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-2xl space-y-6 print-container relative my-auto">
            {/* Modal Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
              <PrintExportActions
                title={`SPT ${previewItem.nomor}`}
                module="SPT"
                description={`Mencetak atau mengekspor SPT ${previewItem.nomor}`}
                printLabel="Cetak ST Resmi"
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
            <SptTemplateHeader />

            {/* Judul SPT */}
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold underline tracking-wider uppercase">
                SURAT TUGAS
              </h3>
              <p className="text-xs">Nomor: {previewItem.nomor}</p>
            </div>

            {/* Menimbang */}
            <div className="grid grid-cols-[78px_10px_1fr] gap-x-1 text-xs">
              <div className="font-bold">Menimbang</div>
              <div>:</div>
              <div className="space-y-1 text-justify">
                {previewItem.menimbang.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-[14px_1fr] gap-x-1 align-top">
                    <span className="font-bold text-right">
                      {String.fromCharCode(97 + idx)}.
                    </span>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dasar */}
            <div className="grid grid-cols-[78px_10px_1fr] gap-x-1 text-xs pt-2">
              <div className="font-bold">Dasar</div>
              <div>:</div>
              <div className="space-y-1 text-justify">
                {previewItem.dasar.map((d, idx) => (
                  <div key={idx} className="grid grid-cols-[14px_1fr] gap-x-1 align-top">
                    <span className="font-bold text-right">{idx + 1}.</span>
                    <p>{d.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Perintah Tengah */}
            <div className="text-center pt-2">
              <h4 className="text-sm font-black tracking-widest">
                Memberi Tugas :
              </h4>
            </div>

            {/* Kepada */}
            <div className="grid grid-cols-[78px_10px_1fr] gap-x-1 text-xs pt-2">
              <div className="font-bold">Kepada</div>
              <div>:</div>
              <div>
                {isSptKomisioner(previewItem) ? (
                  <table className="w-full table-fixed border-collapse text-xs">
                    <colgroup>
                      <col className="w-[10%]" />
                      <col className="w-[46%]" />
                      <col className="w-[44%]" />
                    </colgroup>
                    <thead>
                      <tr className="font-bold">
                        <th className="border-0 px-1 py-0.5 text-center">
                          No
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Nama
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Jabatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewItem.personil.map((p, idx) => {
                        const [nama] = getPegawaiNameAndNip(
                          p.pegawaiId,
                        ).split(" / NIP. ");

                        return (
                          <tr key={idx}>
                            <td className="border-0 px-1 py-0.5 text-center align-top">
                              {idx + 1}
                            </td>
                            <td className="border-0 px-1 py-0.5 text-left align-top font-extrabold">
                              {nama}
                            </td>
                            <td className="border-0 px-1 py-0.5 text-left align-top">
                              {getPegawaiJabatan(p.pegawaiId)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full table-fixed border-collapse text-xs">
                    <colgroup>
                      <col className="w-[10%]" />
                      <col className="w-[38%]" />
                      <col className="w-[24%]" />
                      <col className="w-[28%]" />
                    </colgroup>
                    <thead>
                      <tr className="font-bold">
                        <th className="border-0 px-1 py-0.5 text-center">
                          No
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Nama
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          NIP
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Pangkat
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewItem.personil.map((p, idx) => {
                        const [nama, nip = "-"] = getPegawaiNameAndNip(
                          p.pegawaiId,
                        ).split(" / NIP. ");

                        return (
                          <tr key={idx}>
                            <td className="border-0 px-1 py-0.5 text-center align-top">
                              {idx + 1}
                            </td>
                            <td className="border-0 px-1 py-0.5 text-left align-top font-extrabold">
                              {nama}
                            </td>
                            <td className="border-0 px-1 py-0.5 text-center align-top">
                              {nip}
                            </td>
                            <td className="border-0 px-1 py-0.5 text-left align-top">
                              {getPegawaiPangkatGol(p.pegawaiId)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Untuk */}
            <div className="grid grid-cols-[78px_10px_1fr] gap-x-1 text-xs pt-2">
              <div className="font-bold">Untuk</div>
              <div>:</div>
              <div className="space-y-1 text-justify">
                {previewItem.untuk.map((u, idx) => (
                  <div key={idx} className="grid grid-cols-[14px_1fr] gap-x-1 align-top">
                    <span className="font-bold text-right">{idx + 1}.</span>
                    <p>{u.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Penandatanganan & Tanggal Terbit */}
            <div className="pt-8">
              <div className="flex justify-between text-xs">
                <div className="w-1/3"></div>
                <div className="w-72 space-y-16 text-center">
                  <div className="space-y-1 text-center">
                    <p>
                      Limboto, {formatTanggalIndonesia(previewItem.tanggalMulai)}
                    </p>
                    <div className="font-bold text-center mt-2">
                      {getSptSignatureTitleLines(previewItem).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline uppercase">
                      {getSptSigningOfficial(previewItem)
                        ?.nama || "Herman Monoarfa, M.Si"}
                    </p>
                    {!isSptKomisioner(previewItem) && (
                      <p className="text-gray-500 text-xs">
                        NIP. {getSptSigningOfficial(previewItem)?.nip || "-"}
                      </p>
                    )}
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
          body * {
            visibility: hidden;
          }
          .print-direct,
          .print-direct * {
            visibility: visible;
          }
          .print-direct {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
