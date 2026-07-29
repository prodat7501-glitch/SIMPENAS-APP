"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import {
  canAccessLaporanByNotaDinas,
  canAccessSppdByNotaDinas,
  canAccessSptByNotaDinas,
  canManageSptChain,
  resolveCurrentPegawai,
  resolveSptChainManagerId,
} from "@/lib/document-access";
import { LaporanForm } from "@/modules/laporan/components/LaporanForm";
import { LaporanPreview } from "@/modules/laporan/components/LaporanPreview";
import { LaporanTable } from "@/modules/laporan/components/LaporanTable";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { LaporanStatus } from "@/modules/laporan/laporan.types";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import { SPPD_REPORT_READY_STATUSES } from "@/modules/sppd/sppd.constants";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";

export default function LaporanPage() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { items: sppds } = useSppd();
  const { items: spts } = useSpt();
  const { items: notas } = useNotaDinas();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const laporan = useLaporan();
  const [open, setOpen] = useState(false);
  const [verifyItem, setVerifyItem] = useState<Laporan | null>(null);
  const [catatan, setCatatan] = useState("");
  const canRead = hasPermission("Laporan Perjalanan Dinas", "R");
  const canCreate = hasPermission("Laporan Perjalanan Dinas", "C");
  const canUpdate = hasPermission("Laporan Perjalanan Dinas", "U");
  const canDelete = hasPermission("Laporan Perjalanan Dinas", "D");
  const canApprove = hasPermission("Laporan Perjalanan Dinas", "A");
  const currentPegawai = resolveCurrentPegawai(user, pegawais);
  const currentPegawaiId = currentPegawai?.id;
  const scopeToNotaDinas = user?.role === "Pegawai";
  const scopeMutationsToNotaDinas =
    user?.role !== "Administrator" && user?.role !== "Sub Bagian Keuangan";
  const isAdministrator = user?.role === "Administrator";
  const canManageSeries = (sptId: string) =>
    canManageSptChain(currentPegawaiId, sptId, spts, isAdministrator);
  const getSeriesManagerName = (sptId: string) => {
    const managerId = resolveSptChainManagerId(sptId, spts);
    return (
      pegawais.find((item) => item.id === managerId)?.nama ??
      "pegawai pembuat SPT pertama"
    );
  };
  const eligibleSppds = sppds
    .filter((item) => SPPD_REPORT_READY_STATUSES.includes(item.status))
    .filter(
      (item) =>
        !scopeMutationsToNotaDinas ||
        canAccessSppdByNotaDinas(currentPegawaiId, item, spts, notas),
    );
  const eligibleSpts = spts.filter(
    (spt) =>
      ["Disetujui", "Selesai"].includes(spt.status) &&
      eligibleSppds.some((sppd) => sppd.sptId === spt.id) &&
      (!scopeMutationsToNotaDinas ||
        canAccessSptByNotaDinas(currentPegawaiId, spt, notas)),
  );
  const getLaporanSptId = (item: Laporan) =>
    item.sptId || sppds.find((sppd) => sppd.id === item.sppdId)?.sptId || "";
  const manageableEligibleSpts = eligibleSpts.filter((spt) =>
    canManageSeries(spt.id ?? ""),
  );
  const availableSpts = manageableEligibleSpts.filter(
    (spt) => !laporan.items.some((item) => getLaporanSptId(item) === spt.id),
  );
  const lockedSeriesCount = eligibleSpts.length - manageableEligibleSpts.length;
  const formSpts = laporan.selected ? eligibleSpts : availableSpts;
  const visibleReports = scopeToNotaDinas
    ? laporan.filteredItems.filter((item) =>
        canAccessLaporanByNotaDinas(currentPegawaiId, item, sppds, spts, notas),
      )
    : laporan.filteredItems;
  const getSptLabel = (item: Laporan) => {
    const sptId = getLaporanSptId(item);
    return spts.find((spt) => spt.id === sptId)?.nomor ?? item.sptId ?? "-";
  };
  const getPelaksanaLabel = (item: Laporan) => {
    const sptId = getLaporanSptId(item);
    const spt = spts.find((data) => data.id === sptId);
    const names = sortByPegawaiOrder(
      spt?.personil ?? [],
      (person) => person.pegawaiId,
      pegawais,
    )
      .map(({ pegawaiId }) => pegawais.find((p) => p.id === pegawaiId)?.nama)
      .filter(Boolean);
    if (names.length) return names.join(", ");
    return pegawais.find((x) => x.id === item.pelaksanaId)?.nama ?? "-";
  };
  if (!canRead)
    return (
      <Alert variant="error" title="Akses Ditolak">
        Anda tidak memiliki izin mengakses laporan perjalanan.
      </Alert>
    );
  const create = () => {
    if (!canCreate) {
      addToast("Anda tidak memiliki izin untuk membuat Laporan", "error");
      return;
    }
    if (!availableSpts.length) {
      addToast(
        lockedSeriesCount > 0
          ? "Rangkaian Laporan dikelola pegawai pembuat SPT pertama. Anda hanya dapat melihat statusnya."
          : "Tidak ada rangkaian SPPD lengkap yang masih memerlukan Laporan.",
        "error",
      );
      return;
    }
    laporan.setSelected(null);
    setOpen(true);
  };
  const edit = (item: Laporan) => {
    if (!canManageSeries(getLaporanSptId(item))) {
      addToast(
        `Rangkaian dokumen ini dikelola oleh ${getSeriesManagerName(getLaporanSptId(item))}. Anda hanya dapat melihat status dan pratinjau.`,
        "error",
      );
      return;
    }
    if (
      scopeMutationsToNotaDinas &&
      !canAccessLaporanByNotaDinas(currentPegawaiId, item, sppds, spts, notas)
    ) {
      addToast(
        "Anda hanya dapat mengubah laporan dari Nota Dinas Anda",
        "error",
      );
      return;
    }
    laporan.setSelected(item);
    setOpen(true);
  };
  const save = async (data: Omit<Laporan, "id">) => {
    try {
      if (!canManageSeries(data.sptId)) {
        throw new Error(
          "Anda bukan pengelola rangkaian dokumen perjalanan ini.",
        );
      }
      await laporan.save(data, laporan.selected);
      addToast("Laporan berhasil disimpan", "success");
      setOpen(false);
      laporan.setSelected(null);
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Laporan gagal disimpan",
        "error",
      );
    }
  };
  const remove = async (id: string) => {
    if (!canDelete) {
      addToast(
        "Hanya Administrator yang dapat menghapus Laporan Perjalanan",
        "error",
      );
      return;
    }
    const target = laporan.items.find((item) => item.id === id);
    if (
      target &&
      scopeToNotaDinas &&
      !canAccessLaporanByNotaDinas(currentPegawaiId, target, sppds, spts, notas)
    ) {
      addToast(
        "Anda hanya dapat menghapus laporan dari Nota Dinas Anda",
        "error",
      );
      return;
    }
    if (!confirm("Hapus laporan ini?")) return;
    await laporan.remove(id);
    addToast("Laporan berhasil dihapus", "success");
  };
  const verify = async (
    status: Extract<LaporanStatus, "Perlu Revisi" | "Terverifikasi">,
  ) => {
    if (!verifyItem?.id) return;
    try {
      await laporan.verify({ id: verifyItem.id, status, catatan });
      addToast(`Laporan ${status.toLowerCase()}`, "success");
      setVerifyItem(null);
      setCatatan("");
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Verifikasi gagal", "error");
    }
  };
  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={laporan.isLoading || laporan.isBusy}
        message="Memproses laporan perjalanan..."
      />
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Laporan Perjalanan Dinas</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Dokumentasikan hasil perjalanan, foto kegiatan, dan verifikasi
            supervisor berdasarkan Nomor SPT.
          </p>
        </div>
        {canCreate && (
          <Button onClick={create} disabled={!availableSpts.length}>
            <Plus className="w-4 h-4" /> Buat Laporan
          </Button>
        )}
      </div>
      {!availableSpts.length &&
        (lockedSeriesCount > 0 ? (
          <Alert variant="info" title="Pembuatan Laporan Dinonaktifkan">
            Rangkaian pada Nota Dinas ini sudah dikelola pegawai pembuat SPT
            pertama. Anda tetap dapat melihat status dan pratinjau Laporan,
            tetapi pembuatan baru tersedia kembali hanya untuk Nota Dinas baru
            yang telah disetujui dan mencantumkan Anda.
          </Alert>
        ) : (
          <Alert variant="warning" title="SPPD Belum Lengkap">
            Laporan hanya dapat dibuat satu kali setelah seluruh personil pada
            Nomor SPT memiliki SPPD berstatus Selesai. SPPD yang telah
            Diarsipkan tetap dikenali sebagai dokumen lengkap.
          </Alert>
        ))}
      {laporan.error && <Alert variant="error">Gagal memuat laporan.</Alert>}
      <LaporanTable
        items={visibleReports}
        search={laporan.filters.search}
        status={laporan.filters.status}
        canEdit={canUpdate}
        canEditItem={(item) => canManageSeries(getLaporanSptId(item))}
        canDelete={canDelete}
        canApprove={canApprove}
        onSearch={laporan.setSearch}
        onStatus={laporan.setStatus}
        onEdit={edit}
        onDelete={remove}
        onPreview={laporan.setPreview}
        onVerify={(item) => {
          setVerifyItem(item);
          setCatatan(item.catatanVerifikasi);
        }}
        getSpt={getSptLabel}
        getPelaksana={getPelaksanaLabel}
      />
      <Dialog
        isOpen={open}
        onClose={() => setOpen(false)}
        title={laporan.selected ? "Ubah Laporan" : "Buat Laporan Perjalanan"}
        className="max-w-6xl"
      >
        <LaporanForm
          initialValues={laporan.selected}
          spts={formSpts}
          sppds={eligibleSppds}
          pegawais={pegawais}
          isSaving={laporan.isBusy}
          onSubmit={save}
          onCancel={() => setOpen(false)}
        />
      </Dialog>
      <Dialog
        isOpen={!!verifyItem}
        onClose={() => setVerifyItem(null)}
        title="Verifikasi Laporan"
      >
        <div className="space-y-4">
          <label className="space-y-1 block">
            <span className="font-bold text-foreground">
              Catatan Supervisor
            </span>
            <Input
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Wajib untuk permintaan revisi"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => verify("Perlu Revisi")}
            >
              Perlu Revisi
            </Button>
            <Button onClick={() => verify("Terverifikasi")}>
              Terverifikasi
            </Button>
          </div>
        </div>
      </Dialog>
      <LaporanPreview
        item={laporan.preview}
        spts={spts}
        sppds={sppds}
        pegawais={pegawais}
        jabatans={jabatans}
        onClose={() => laporan.setPreview(null)}
      />
    </div>
  );
}
