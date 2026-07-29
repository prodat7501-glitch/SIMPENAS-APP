"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExportDataButton } from "@/components/ui/export-data-button";
import { Dialog } from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import {
  canAccessSppdByNotaDinas,
  canAccessSptByNotaDinas,
  canManageSptChain,
  resolveCurrentPegawai,
  resolveSptChainManagerId,
} from "@/lib/document-access";
import { useDipa } from "@/modules/dipa/useDipa";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { SppdForm } from "@/modules/sppd/components/SppdForm";
import { SppdPreview } from "@/modules/sppd/components/SppdPreview";
import { SppdTable } from "@/modules/sppd/components/SppdTable";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { SppdMutationPayload } from "@/modules/sppd/sppd.types";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import { formatTableDate } from "@/lib/formatters";

const isApprovedSpt = (status: string) =>
  status === "Selesai" || status === "Disetujui";

export default function SppdPage() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { items: spts } = useSpt();
  const { items: notaDinasItems } = useNotaDinas();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const { items: pangkats } = usePangkat();
  const { items: dipas } = useDipa();
  const { items: penandatangans } = usePenandatangan();
  const {
    items,
    filteredItems,
    selectedItem,
    previewItem,
    filters,
    isLoading,
    isSaving,
    isDeleting,
    error,
    setSelectedItem,
    setPreviewItem,
    setSearch,
    setStatus,
    save,
    remove,
  } = useSppd();

  const [modalOpen, setModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"page1" | "page2">("page1");

  const canRead = hasPermission("SPPD", "R");
  const canCreate = hasPermission("SPPD", "C");
  const canUpdate = hasPermission("SPPD", "U");
  const canDelete = hasPermission("SPPD", "D");
  const canPrint = hasPermission("SPPD", "P");
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const scopeToNotaDinas = user?.role === "Pegawai";
  const scopeMutationsToNotaDinas =
    user?.role !== "Administrator" && user?.role !== "Sub Bagian Keuangan";
  const isAdministrator = user?.role === "Administrator";

  const approvedSpts = spts
    .filter((item) => isApprovedSpt(item.status))
    .filter(
      (item) =>
        !scopeMutationsToNotaDinas ||
        canAccessSptByNotaDinas(currentPegawaiId, item, notaDinasItems),
    );
  const getSeriesManager = (sptId: string) =>
    items.find((item) => item.sptId === sptId && item.pengelolaPegawaiId);
  const getSeriesManagerId = (sptId: string) =>
    resolveSptChainManagerId(sptId, spts) ??
    getSeriesManager(sptId)?.pengelolaPegawaiId;
  const getSeriesManagerName = (sptId: string) =>
    pegawais.find((item) => item.id === getSeriesManagerId(sptId))?.nama ??
    getSeriesManager(sptId)?.pengelolaNama ??
    "anggota lain";
  const canManageSeries = (sptId: string) =>
    canManageSptChain(currentPegawaiId, sptId, spts, isAdministrator);
  const manageableApprovedSpts = approvedSpts.filter((item) =>
    item.id ? canManageSeries(item.id) : true,
  );
  const hasUnissuedSppd = (sptId: string) => {
    const sourceSpt = spts.find((item) => item.id === sptId);
    if (!sourceSpt) return false;
    const issuedPegawaiIds = new Set(
      items
        .filter((item) => item.sptId === sptId)
        .flatMap((item) => item.personil.map((person) => person.pegawaiId)),
    );
    return sourceSpt.personil.some(
      (person) => !issuedPegawaiIds.has(person.pegawaiId),
    );
  };
  const creatableApprovedSpts = manageableApprovedSpts.filter((item) =>
    Boolean(item.id && hasUnissuedSppd(item.id)),
  );
  const lockedSeriesCount = approvedSpts.length - manageableApprovedSpts.length;
  const visibleSppds = scopeToNotaDinas
    ? filteredItems.filter((item) =>
        canAccessSppdByNotaDinas(currentPegawaiId, item, spts, notaDinasItems),
      )
    : filteredItems;

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Surat Perintah
          Perjalanan Dinas (SPPD).
        </Alert>
      </div>
    );
  }

  const handleCreate = () => {
    if (!canCreate) {
      addToast("Anda tidak memiliki izin untuk membuat SPPD", "error");
      return;
    }
    if (!creatableApprovedSpts.length) {
      addToast(
        lockedSeriesCount > 0
          ? "Rangkaian SPPD sudah dikelola pegawai pembuat SPT pertama. Anda hanya dapat melihat statusnya."
          : "Tidak ada personel SPT yang masih memerlukan penerbitan SPPD.",
        "error",
      );
      return;
    }

    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Sppd) => {
    if (!canManageSeries(item.sptId)) {
      addToast(
        `Rangkaian SPPD ini dikelola oleh ${getSeriesManagerName(item.sptId)}. Anda hanya dapat melihat statusnya.`,
        "error",
      );
      return;
    }
    if (
      scopeMutationsToNotaDinas &&
      !canAccessSppdByNotaDinas(currentPegawaiId, item, spts, notaDinasItems)
    ) {
      addToast("Anda hanya dapat mengubah SPPD dari Nota Dinas Anda", "error");
      return;
    }
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui SPPD", "error");
      return;
    }

    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      addToast("Hanya Administrator yang dapat menghapus SPPD", "error");
      return;
    }
    const target = items.find((item) => item.id === id);
    if (
      target &&
      scopeToNotaDinas &&
      !canAccessSppdByNotaDinas(currentPegawaiId, target, spts, notaDinasItems)
    ) {
      addToast("Anda hanya dapat menghapus SPPD dari Nota Dinas Anda", "error");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus SPPD ini?")) return;

    try {
      await remove(id);
      addToast("SPPD berhasil dihapus", "success");
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "SPPD gagal dihapus";
      addToast(message, "error");
    }
  };

  const handleSubmit = async (data: SppdMutationPayload) => {
    try {
      if (!canManageSeries(data.sptId)) {
        throw new Error(
          `Rangkaian SPPD ini sudah dikelola oleh ${getSeriesManagerName(data.sptId)}.`,
        );
      }
      if (
        !selectedItem &&
        !creatableApprovedSpts.some((item) => item.id === data.sptId)
      ) {
        throw new Error(
          "Seluruh personel pada SPT ini sudah memiliki SPPD atau sumber tidak lagi tersedia.",
        );
      }
      const seriesManager = getSeriesManager(data.sptId);
      const chainManagerId = getSeriesManagerId(data.sptId);
      const chainManager = pegawais.find((item) => item.id === chainManagerId);

      await save(
        {
          ...data,
          pengelolaPegawaiId:
            seriesManager?.pengelolaPegawaiId ??
            selectedItem?.pengelolaPegawaiId ??
            chainManagerId ??
            (user?.role !== "Administrator" ? currentPegawaiId : undefined),
          pengelolaNama:
            seriesManager?.pengelolaNama ??
            selectedItem?.pengelolaNama ??
            chainManager?.nama ??
            (user?.role !== "Administrator" ? currentPegawai?.nama : undefined),
        },
        selectedItem,
      );
      addToast(
        selectedItem ? "SPPD berhasil diperbarui" : "SPPD berhasil disimpan",
        "success",
      );
      setModalOpen(false);
      setSelectedItem(null);
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "SPPD gagal disimpan";
      addToast(message, "error");
    }
  };

  const handleCancel = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const getSptNumber = (sptId: string) =>
    spts.find((item) => item.id === sptId)?.nomor ?? "-";
  const getPegawaiName = (pegawaiId: string) =>
    pegawais.find((item) => item.id === pegawaiId)?.nama ?? "-";
  const getDipaLabel = (dipaId: string) => {
    const dipa = dipas.find((item) => item.id === dipaId);
    return dipa
      ? `${dipa.kodeDipa} - ${dipa.klasifikasiRincianOutput} - ${dipa.akunPerjalananDinas}`
      : "-";
  };

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={isLoading || isSaving || isDeleting}
        message={isLoading ? "Memuat data SPPD..." : "Memproses data SPPD..."}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Surat Perintah Perjalanan Dinas (SPPD)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola SPPD berdasarkan SPT yang telah disetujui, lengkap dengan
            nomor, personil, DIPA, status dokumen otomatis, dan pratinjau cetak.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportDataButton
            title="Data Surat Perintah Perjalanan Dinas"
            module="SPPD"
            rows={visibleSppds}
            defaultFileName={`data-sppd-${new Date().toISOString().slice(0, 10)}`}
            columns={[
              {
                header: "No",
                value: (_, index) => index + 1,
                type: "number",
                width: 45,
              },
              { header: "Nomor SPPD", value: (item) => item.nomor, width: 190 },
              {
                header: "Nama",
                value: (item) =>
                  item.personil
                    .map((row) => getPegawaiName(row.pegawaiId))
                    .join(", "),
                width: 180,
              },
              {
                header: "Nomor SPT",
                value: (item) => getSptNumber(item.sptId),
                width: 190,
              },
              {
                header: "Berangkat Dari",
                value: (item) => item.tempatBerangkat,
                width: 150,
              },
              {
                header: "Tujuan",
                value: (item) => item.tempatTujuan,
                width: 170,
              },
              {
                header: "Transportasi",
                value: (item) => item.transportasi,
                width: 90,
              },
              {
                header: "Tanggal Berangkat",
                value: (item) => formatTableDate(item.tanggalBerangkat),
                width: 100,
              },
              {
                header: "Tanggal Kembali",
                value: (item) => formatTableDate(item.tanggalKembali),
                width: 100,
              },
              {
                header: "Jumlah Hari",
                value: (item) => item.lamaPerjalanan,
                type: "number",
                width: 75,
              },
              {
                header: "Akun DIPA",
                value: (item) => getDipaLabel(item.dipaId),
                width: 240,
              },
              { header: "Status", value: (item) => item.status, width: 100 },
            ]}
          />
          {canCreate && (
            <Button
              onClick={handleCreate}
              disabled={!creatableApprovedSpts.length}
              title={
                creatableApprovedSpts.length
                  ? "Buat SPPD individual berikutnya"
                  : "Tidak ada rangkaian SPPD yang dapat dilanjutkan"
              }
            >
              <Plus className="w-4 h-4" />
              Buat SPPD
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" title="Gagal Memuat Data">
          {error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data SPPD."}
        </Alert>
      )}

      {approvedSpts.length === 0 && (
        <Alert variant="warning" title="SPT Disetujui Belum Tersedia">
          SPPD hanya dapat dibuat dari SPT yang telah disetujui. Selesaikan
          approval SPT terlebih dahulu sebelum membuat SPPD.
        </Alert>
      )}

      {canCreate && !isAdministrator && lockedSeriesCount > 0 && (
        <Alert variant="info" title="Rangkaian SPPD Sedang Dikelola">
          {lockedSeriesCount} rangkaian SPT sudah dikelola pegawai pembuat SPT
          pertama pada Nota Dinas sumber. Anda tetap dapat melihat status dan
          pratinjau, tetapi tidak dapat membuat SPPD baru pada rangkaian
          tersebut.
        </Alert>
      )}

      {canCreate &&
        manageableApprovedSpts.length > 0 &&
        creatableApprovedSpts.length === 0 && (
          <Alert variant="info" title="Seluruh SPPD Telah Diterbitkan">
            Tidak ada lagi personel yang memerlukan SPPD pada rangkaian yang
            Anda kelola. Tombol Buat SPPD akan aktif kembali ketika terdapat SPT
            dari Nota Dinas baru yang telah disetujui.
          </Alert>
        )}

      <SppdTable
        items={visibleSppds}
        search={filters.search}
        status={filters.status}
        canEdit={canUpdate}
        canEditItem={(item) => canManageSeries(item.sptId)}
        canDelete={canDelete}
        canPrint={canPrint}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={(item) => {
          setPreviewMode("page1");
          setPreviewItem(item);
        }}
        onPreviewPage2={(item) => {
          setPreviewMode("page2");
          setPreviewItem(item);
        }}
        getSptNumber={getSptNumber}
        getPegawaiName={getPegawaiName}
        getDipaLabel={getDipaLabel}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={selectedItem ? "Ubah SPPD" : "Buat SPPD Baru"}
        className="max-w-6xl max-h-[calc(100vh-2rem)]"
        bodyClassName="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
      >
        <SppdForm
          initialValues={selectedItem}
          approvedSpts={
            selectedItem ? manageableApprovedSpts : creatableApprovedSpts
          }
          existingSppds={items}
          pegawais={pegawais}
          dipas={dipas}
          notaDinasItems={notaDinasItems}
          penandatangans={penandatangans}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </Dialog>

      <SppdPreview
        item={previewItem}
        mode={previewMode}
        spts={spts}
        pegawais={pegawais}
        jabatans={jabatans}
        pangkats={pangkats}
        dipas={dipas}
        penandatangans={penandatangans}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}
