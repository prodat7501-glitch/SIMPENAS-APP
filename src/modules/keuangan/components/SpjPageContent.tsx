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
import {
  canAccessSpjByNotaDinas,
  isFinanceUnitUser,
  resolveCurrentPegawai,
} from "@/lib/document-access";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import { useUnitKerja } from "@/modules/unit-kerja/useUnitKerja";
import type { Spj } from "../keuangan.schema";
import { useKeuangan } from "../useKeuangan";

const steps = [
  { label: "SPJ Diterima" },
  { label: "Validasi SPJ" },
  { label: "Validasi Selesai" },
];
const step = (status: Spj["status"]) =>
  status === "SPJ Diterima" ? 0 : status === "Validasi SPJ Selesai" ? 2 : 1;
export function SpjPageContent() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { items: reports } = useLaporan();
  const { items: sppds } = useSppd();
  const { items: spts } = useSpt();
  const { items: notas } = useNotaDinas();
  const { items: pegawais } = usePegawai();
  const { items: unitKerja } = useUnitKerja();
  const data = useKeuangan(reports);
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
  const openValidation = (item: Spj) => {
    setSelected(item);
    setChecklist(item.checklist);
    setCatatan(item.catatan);
  };
  if (!hasPermission("Validasi SPJ", "R"))
    return <Alert variant="error">Akses ditolak.</Alert>;
  const act = async (action: "mulai" | "revisi" | "selesai") => {
    if (!selected) return;
    if (!canValidateSpj) {
      addToast(
        "Validasi SPJ hanya dapat diproses oleh pegawai Unit Sub Bagian Keuangan.",
        "error",
      );
      return;
    }
    try {
      await data.validate({ id: selected.id, checklist, catatan, action });
      addToast("Status SPJ berhasil diperbarui", "success");
      setSelected(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : "Validasi gagal", "error");
    }
  };
  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={data.isLoading || data.isBusy}
        message="Memproses validasi SPJ..."
      />
      <div>
        <h1 className="text-xl font-extrabold">Validasi SPJ</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Periksa kelengkapan laporan terverifikasi sebelum proses dokumen
          keuangan.
        </p>
      </div>
      <Stepper
        steps={steps}
        currentStep={
          visibleItems.length
            ? Math.min(...visibleItems.map((x) => step(x.status)))
            : 0
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SPPD</TableHead>
              <TableHead>Tanggal Diterima</TableHead>
              <TableHead>Kelengkapan</TableHead>
              <TableHead>Status</TableHead>
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
                <TableCell>{item.tanggalDiterima}</TableCell>
                <TableCell>
                  {Object.values(item.checklist).filter(Boolean).length}/4
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "Validasi SPJ Selesai"
                        ? "success"
                        : item.status === "SPJ Perlu Dilengkapi"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell>{item.dokumen.length}/4</TableCell>
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
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
      >
        <div className="space-y-5">
          <Stepper
            steps={steps}
            currentStep={selected ? step(selected.status) : 0}
          />
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
                  disabled={!canValidateSpj}
                  onChange={(e) =>
                    setChecklist((x) => ({ ...x, [key]: e.target.checked }))
                  }
                />{" "}
                {label}
              </label>
            ))}
          </div>
          <label className="block space-y-1">
            <span className="font-bold text-foreground">
              Catatan Pemeriksaan
            </span>
            <Input
              value={catatan}
              disabled={!canValidateSpj}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </label>
          {canValidateSpj ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="outline" onClick={() => act("mulai")}>
                <ClipboardCheck className="w-4 h-4" /> Mulai Validasi
              </Button>
              <Button variant="destructive" onClick={() => act("revisi")}>
                Perlu Dilengkapi
              </Button>
              <Button onClick={() => act("selesai")}>Validasi Selesai</Button>
            </div>
          ) : (
            <Alert variant="info">
              Mode lihat saja. Perubahan status validasi hanya dapat dilakukan
              oleh Unit Sub Bagian Keuangan.
            </Alert>
          )}
        </div>
      </Dialog>
    </div>
  );
}
