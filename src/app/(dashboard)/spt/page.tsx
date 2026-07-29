"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSpt } from "@/modules/spt/useSpt";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { SptTable } from "@/modules/spt/components/SptTable";
import { SptForm } from "@/modules/spt/components/SptForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExportDataButton } from "@/components/ui/export-data-button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus, X } from "lucide-react";
import { Spt } from "@/modules/spt/spt.schema";
import { useNotificationStore } from "@/stores/notification.store";
import { useActivityStore } from "@/stores/activity.store";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import {
  canAccessSptByNotaDinas,
  canInitiateNotaDinasChain,
  isPegawaiInNotaDinas,
  resolveCurrentPegawai,
} from "@/lib/document-access";
import {
  TemplateFooter,
  useTemplateDocumentStyle,
} from "@/components/document/DocumentTemplate";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import { PrintExportActions } from "@/components/ui/print-export-actions";
import { PrintPageSetup } from "@/components/ui/print-preview";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import { snapshotToPenandatangan } from "@/modules/penandatangan/penandatangan.service";

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
      <h1 className="spt-kop-title text-base tracking-wide uppercase">
        KOMISI PEMILIHAN UMUM
      </h1>
      <p className="spt-kop-title text-base tracking-wide uppercase">
        KABUPATEN GORONTALO
      </p>
      <p className="mt-1 text-[10px] italic text-gray-500">{template.alamat}</p>
    </header>
  );
}

export default function SptPage() {
  const { user, hasPermission } = useAuth();
  const { items, add, update, remove, generateNomor, releaseNomor } = useSpt();
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
    fontFamily: '"Bookman Old Style", Bookman, Georgia, serif',
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Spt | null>(null);
  const [previewItem, setPreviewItem] = useState<Spt | null>(null);
  const [pendingNumber, setPendingNumber] = useState<string | null>(null);

  // RBAC checks
  const canRead = hasPermission("SPT", "R");
  const canCreate = hasPermission("SPT", "C");
  const canUpdate = hasPermission("SPT", "U");
  const canDelete = hasPermission("SPT", "D");
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const scopeToNotaDinas = user?.role === "Pegawai";
  const scopeMutationsToNotaDinas =
    user?.role !== "Administrator" && user?.role !== "Sub Bagian Keuangan";
  const isAdministrator = user?.role === "Administrator";
  const isPegawaiKomisioner = (id: string) => {
    const pegawai = pegawais.find((item) => item.id === id);
    return (
      pegawai?.kategoriPegawai === "Ketua KPU" ||
      pegawai?.kategoriPegawai === "Anggota KPU"
    );
  };
  const getSptGroup = (item: Pick<Spt, "personil">) =>
    item.personil.length > 0 &&
    item.personil.every((person) => isPegawaiKomisioner(person.pegawaiId))
      ? "Komisioner"
      : "Sekretariat";
  const hasUncreatedSptGroup = (notaDinasId: string) => {
    const nota = notaDinasItems.find((item) => item.id === notaDinasId);
    if (!nota) return false;

    const requiredGroups = new Set(
      nota.lampiran.map((item) =>
        isPegawaiKomisioner(item.pegawaiId) ? "Komisioner" : "Sekretariat",
      ),
    );
    const existingGroups = new Set(
      items.filter((item) => item.notaDinasId === notaDinasId).map(getSptGroup),
    );
    return [...requiredGroups].some((group) => !existingGroups.has(group));
  };
  const accessibleNotaDinasItems = scopeMutationsToNotaDinas
    ? notaDinasItems.filter((item) =>
        isPegawaiInNotaDinas(currentPegawaiId, item),
      )
    : notaDinasItems;
  const visibleSpts = scopeToNotaDinas
    ? items.filter((item) =>
        canAccessSptByNotaDinas(currentPegawaiId, item, notaDinasItems),
      )
    : items;
  const approvedAssignedNotaDinasItems = notaDinasItems.filter(
    (item) =>
      item.status === "Disetujui" &&
      (isAdministrator || isPegawaiInNotaDinas(currentPegawaiId, item)),
  );
  const creatableNotaDinasItems = approvedAssignedNotaDinasItems.filter(
    (item) =>
      canInitiateNotaDinasChain(
        currentPegawaiId,
        item,
        items,
        isAdministrator,
      ) && Boolean(item.id && hasUncreatedSptGroup(item.id)),
  );
  const canCreateFromAccessibleNota =
    canCreate && creatableNotaDinasItems.length > 0;
  const canManageSpt = (item: Spt) =>
    user?.role === "Administrator" ||
    (Boolean(currentPegawaiId) && item.createdByPegawaiId === currentPegawaiId);

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

  const handleCreate = () => {
    if (!canCreateFromAccessibleNota) {
      addToast(
        "Belum ada Nota Dinas Disetujui baru yang dapat Anda lanjutkan sebagai pengelola rangkaian.",
        "error",
      );
      return;
    }
    setEditingItem(null);
    setPendingNumber(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Spt) => {
    if (!canManageSpt(item)) {
      addToast(
        "SPT ini dikelola oleh pegawai pembuatnya. Anda hanya dapat melihat status dan pratinjau.",
        "error",
      );
      return;
    }
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
    setPendingNumber(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      addToast("Hanya Administrator yang dapat menghapus SPT", "error");
      return;
    }
    const target = items.find((item) => item.id === id);
    if (
      target &&
      scopeToNotaDinas &&
      !canAccessSptByNotaDinas(currentPegawaiId, target, notaDinasItems)
    ) {
      addToast("Anda hanya dapat menghapus SPT dari Nota Dinas Anda", "error");
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
    if (
      !editingItem &&
      !creatableNotaDinasItems.some((item) => item.id === data.notaDinasId)
    ) {
      addToast(
        "Rangkaian Nota Dinas ini sudah dikelola pegawai lain atau seluruh SPT-nya telah diterbitkan.",
        "error",
      );
      return;
    }
    if (
      !editingItem &&
      items.some(
        (item) =>
          item.notaDinasId === data.notaDinasId &&
          getSptGroup(item) === getSptGroup(data),
      )
    ) {
      addToast(
        `SPT ${getSptGroup(data)} untuk Nota Dinas ini sudah diterbitkan.`,
        "error",
      );
      return;
    }
    const securedData: Omit<Spt, "id"> = {
      ...data,
      createdByPegawaiId:
        editingItem?.createdByPegawaiId || currentPegawaiId || "",
      catatanRevisi: editingItem?.catatanRevisi ?? data.catatanRevisi ?? "",
    };
    if (editingItem) {
      update(editingItem.id!, securedData);
      addToast("SPT berhasil diperbarui", "success");
    } else {
      add(securedData);
      addToast("SPT berhasil disimpan", "success");
    }
    if (securedData.status === "Menunggu Approval") {
      addNotification(
        "SPT Menunggu Approval",
        `${securedData.nomor} telah diajukan kepada pejabat berwenang.`,
        "info",
      );
      addActivity({
        action: "Approval",
        module: "SPT",
        description: `Mengajukan ${data.nomor} untuk approval`,
        user: "Pengguna aktif",
      });
    }
    setPendingNumber(null);
    if (!options?.keepOpen) {
      setModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleCancel = () => {
    if (!editingItem && pendingNumber) {
      releaseNomor(pendingNumber);
    }
    setPendingNumber(null);
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
  const isSptKomisioner = (item: Spt) =>
    item.personil.length > 0 &&
    item.personil.every((person) => isPegawaiKomisioner(person.pegawaiId));
  const getSptSigningOfficial = (item: Spt): Penandatangan | null => {
    if (item.penandatanganSnapshot) {
      return snapshotToPenandatangan(item.penandatanganSnapshot);
    }
    const signer = getPenandatanganDetail(item.penandatanganId);
    const signerText =
      `${signer?.jabatanPenandatangan ?? ""} ${signer?.peran ?? ""}`.toLowerCase();
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
          berlakuMulai: signer?.berlakuMulai || "",
          berlakuSampai: signer?.berlakuSampai || "",
          jenisDokumen: signer?.jenisDokumen || ["SPT"],
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
        <div className="flex flex-wrap items-center gap-2">
          <ExportDataButton
            title="Data Surat Tugas"
            module="SPT"
            rows={visibleSpts}
            defaultFileName={`data-spt-${new Date().toISOString().slice(0, 10)}`}
            columns={[
              {
                header: "No",
                value: (_, index) => index + 1,
                type: "number",
                width: 45,
              },
              { header: "Nomor SPT", value: (item) => item.nomor, width: 190 },
              {
                header: "Nomor Nota Dinas",
                value: (item) => getNotaDinasNumber(item.notaDinasId),
                width: 180,
              },
              {
                header: "Maksud/Kegiatan",
                value: (item) => item.untuk.map((row) => row.text).join("; "),
                width: 280,
              },
              {
                header: "Tanggal Mulai",
                value: (item) => formatTanggalIndonesia(item.tanggalMulai),
                width: 100,
              },
              {
                header: "Tanggal Selesai",
                value: (item) => formatTanggalIndonesia(item.tanggalSelesai),
                width: 100,
              },
              {
                header: "Personil",
                value: (item) =>
                  item.personil
                    .map(
                      (row) =>
                        pegawais.find((pegawai) => pegawai.id === row.pegawaiId)
                          ?.nama ?? row.pegawaiId,
                    )
                    .join(", "),
                width: 240,
              },
              { header: "Status", value: (item) => item.status, width: 110 },
            ]}
          />
          {canCreate && (
            <Button
              onClick={handleCreate}
              disabled={!canCreateFromAccessibleNota}
              title={
                canCreateFromAccessibleNota
                  ? "Buat SPT dari Nota Dinas Disetujui"
                  : "Tidak ada Nota Dinas baru yang dapat dibuatkan SPT"
              }
              className="flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Buat SPT
            </Button>
          )}
        </div>
      </div>

      {canCreate && !canCreateFromAccessibleNota && (
        <Alert variant="info" title="Pembuatan SPT Baru Dinonaktifkan">
          Tidak ada Nota Dinas Disetujui baru yang dapat Anda mulai. Rangkaian
          yang sudah memiliki SPT hanya dapat dilanjutkan oleh pegawai pembuat
          SPT pertama; personel lain tetap dapat melihat status dan pratinjau
          sampai memperoleh Nota Dinas baru yang telah disetujui.
        </Alert>
      )}

      <div className="no-print">
        <SptTable
          items={visibleSpts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPreview={(item) => setPreviewItem(item)}
          canEdit={canUpdate}
          canEditItem={canManageSpt}
          canDelete={canDelete}
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
          notaDinasItems={
            editingItem
              ? accessibleNotaDinasItems.filter(
                  (item) =>
                    item.status === "Disetujui" ||
                    item.id === editingItem.notaDinasId,
                )
              : creatableNotaDinasItems
          }
          pegawais={pegawais}
          penandatangans={penandatangans}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          onGenerateNomor={generateNomor}
          onNumberReserved={setPendingNumber}
        />
      </Dialog>

      {/* High-Fidelity Printable Document Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print-direct">
          <div
            style={sptTemplateStyle}
            className="spt-print-document bg-white text-black w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-2xl space-y-6 print-container relative my-auto"
          >
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
                  <div
                    key={idx}
                    className="grid grid-cols-[14px_1fr] gap-x-1 align-top"
                  >
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
                  <div
                    key={idx}
                    className="grid grid-cols-[14px_1fr] gap-x-1 align-top"
                  >
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
                        <th className="border-0 px-1 py-0.5 text-center">No</th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Nama
                        </th>
                        <th className="border-0 px-1 py-0.5 text-center">
                          Jabatan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortByPegawaiOrder(
                        previewItem.personil,
                        (person) => person.pegawaiId,
                        pegawais,
                      ).map((p, idx) => {
                        const [nama] = getPegawaiNameAndNip(p.pegawaiId).split(
                          " / NIP. ",
                        );

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
                        <th className="border-0 px-1 py-0.5 text-center">No</th>
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
                      {sortByPegawaiOrder(
                        previewItem.personil,
                        (person) => person.pegawaiId,
                        pegawais,
                      ).map((p, idx) => {
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
                  <div
                    key={idx}
                    className="grid grid-cols-[14px_1fr] gap-x-1 align-top"
                  >
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
                      Limboto,{" "}
                      {formatTanggalIndonesia(previewItem.tanggalMulai)}
                    </p>
                    <div className="font-bold text-center mt-2">
                      {getSptSignatureTitleLines(previewItem).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-extrabold underline uppercase">
                      {getSptSigningOfficial(previewItem)?.nama ||
                        "Herman Monoarfa, M.Si"}
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
        .spt-print-document * {
          font-weight: 400 !important;
        }
        .spt-print-document .spt-kop-title {
          font-weight: 900 !important;
        }
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
      {previewItem && <PrintPageSetup printPageSize="215mm 330mm" />}
    </div>
  );
}
