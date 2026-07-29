"use client";

import { useMemo, useState } from "react";
import { Archive, Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { useSpt } from "@/modules/spt/useSpt";
import { useSppd } from "@/modules/sppd/useSppd";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import { useArsipSpj } from "@/modules/arsip-spj/useArsipSpj";
import type { ArsipSpjRow } from "@/modules/arsip-spj/arsip-spj.types";
import { ArsipSpjTable } from "@/modules/arsip-spj/components/ArsipSpjTable";
import { ArsipSpjUploadDialog } from "@/modules/arsip-spj/components/ArsipSpjUploadDialog";

export default function ArsipSpjPage() {
  const { user, hasPermission } = useAuth();
  const { items: notaDinasItems } = useNotaDinas();
  const { items: spts } = useSpt();
  const { items: sppds, isLoading: isSppdLoading } = useSppd();
  const { items: pegawais } = usePegawai();
  const {
    items: archives,
    isLoading,
    error,
    isUploading,
    upload,
    download,
  } = useArsipSpj();
  const { addToast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState<ArsipSpjRow | null>(null);

  const canRead = hasPermission("Arsip SPJ", "R");
  const canUpload =
    (user?.role === "Administrator" ||
      user?.role === "Sub Bagian Keuangan") &&
    hasPermission("Arsip SPJ", "U");

  const rows = useMemo<ArsipSpjRow[]>(() => {
    const archiveByNota = new Map(
      archives.map((archive) => [archive.notaDinasId, archive]),
    );
    return notaDinasItems
      .filter((nota) => Boolean(nota.id))
      .map((nota) => {
        const relatedSpts = spts.filter((spt) => spt.notaDinasId === nota.id);
        const relatedSptIds = new Set(
          relatedSpts.map((spt) => spt.id).filter(Boolean),
        );
        const relatedSppds = sppds.filter((sppd) =>
          relatedSptIds.has(sppd.sptId),
        );
        const personilIds = Array.from(
          new Set(nota.lampiran.map((item) => item.pegawaiId)),
        );
        return {
          notaDinasId: nota.id!,
          nomorNotaDinas: nota.nomor,
          nomorSpt: Array.from(
            new Set(relatedSpts.map((item) => item.nomor).filter(Boolean)),
          ),
          nomorSppd: Array.from(
            new Set(relatedSppds.map((item) => item.nomor).filter(Boolean)),
          ),
          personil: sortByPegawaiOrder(
            personilIds,
            (id) => id,
            pegawais,
          ).map(
            (id) => pegawais.find((pegawai) => pegawai.id === id)?.nama ?? id,
          ),
          arsip: archiveByNota.get(nota.id!),
        };
      })
      .reverse();
  }, [archives, notaDinasItems, pegawais, sppds, spts]);

  const filteredRows = rows.filter((row) => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return [
      row.nomorNotaDinas,
      ...row.nomorSpt,
      ...row.nomorSppd,
      ...row.personil,
    ].some((value) => value.toLowerCase().includes(needle));
  });

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk melihat Arsip SPJ.
        </Alert>
      </div>
    );
  }

  const handleUpload = async (file: File) => {
    if (!selectedRow || !canUpload) return;
    await upload({
      notaDinasId: selectedRow.notaDinasId,
      file,
      diunggahOleh: user?.name ?? "Bagian Keuangan",
    });
    addToast("Dokumen fisik SPJ berhasil disimpan", "success");
    setSelectedRow(null);
  };

  const handleDownload = async (row: ArsipSpjRow) => {
    try {
      await download(row.notaDinasId);
    } catch (downloadError) {
      addToast(
        downloadError instanceof Error
          ? downloadError.message
          : "Dokumen arsip gagal diunduh",
        "error",
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black">Arsip SPJ</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Arsip PDF dokumen fisik perjalanan dinas yang telah ditandatangani.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nomor atau personil..."
            className="pl-9"
          />
        </div>
      </div>

      {!canUpload && (
        <Alert variant="info" title="Akses baca">
          Upload atau penggantian PDF hanya dapat dilakukan oleh Administrator
          atau akun Sub Bagian Keuangan.
        </Alert>
      )}
      {error && (
        <Alert variant="error" title="Arsip tidak dapat dimuat">
          {error instanceof Error ? error.message : "Terjadi kesalahan."}
        </Alert>
      )}
      {isLoading || isSppdLoading ? (
        <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          Memuat riwayat Arsip SPJ...
        </div>
      ) : (
        <ArsipSpjTable
          rows={filteredRows}
          canUpload={canUpload}
          onUpload={setSelectedRow}
          onDownload={handleDownload}
        />
      )}

      <ArsipSpjUploadDialog
        isOpen={Boolean(selectedRow)}
        row={selectedRow}
        isUploading={isUploading}
        onClose={() => setSelectedRow(null)}
        onUpload={handleUpload}
      />
    </div>
  );
}
