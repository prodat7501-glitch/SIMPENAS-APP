"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import {
  canAccessSppdByNotaDinas,
  canAccessSptByNotaDinas,
  resolveCurrentPegawai,
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
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";

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

  const approvedSpts = spts
    .filter((item) => isApprovedSpt(item.status))
    .filter(
      (item) =>
        !scopeToNotaDinas ||
        canAccessSptByNotaDinas(currentPegawaiId, item, notaDinasItems),
    );
  const visibleSppds = scopeToNotaDinas
    ? filteredItems.filter((item) =>
        canAccessSppdByNotaDinas(
          currentPegawaiId,
          item,
          spts,
          notaDinasItems,
        ),
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
    if (scopeToNotaDinas && !approvedSpts.length) {
      addToast(
        "SPPD hanya dapat dibuat dari SPT pada Nota Dinas yang mencantumkan Anda.",
        "error",
      );
      return;
    }

    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item: Sppd) => {
    if (
      scopeToNotaDinas &&
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
    const target = items.find((item) => item.id === id);
    if (
      target &&
      scopeToNotaDinas &&
      !canAccessSppdByNotaDinas(currentPegawaiId, target, spts, notaDinasItems)
    ) {
      addToast("Anda hanya dapat menghapus SPPD dari Nota Dinas Anda", "error");
      return;
    }
    if (!canDelete) {
      addToast("Anda tidak memiliki izin untuk menghapus SPPD", "error");
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

  const handleSubmit = async (data: Omit<Sppd, "id">) => {
    try {
      await save(data, selectedItem);
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
    return dipa ? `${dipa.kodeDipa} - ${dipa.program}` : "-";
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
            nomor, personil, DIPA, approval, dan pratinjau cetak.
          </p>
        </div>
        {canCreate && (!scopeToNotaDinas || approvedSpts.length > 0) && (
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4" />
            Buat SPPD
          </Button>
        )}
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

      <SppdTable
        items={visibleSppds}
        search={filters.search}
        status={filters.status}
        canEdit={canUpdate}
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
          approvedSpts={approvedSpts}
          existingSppds={items}
          pegawais={pegawais}
          dipas={dipas}
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
