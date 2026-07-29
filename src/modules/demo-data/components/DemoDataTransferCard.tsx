"use client";

import { useRef, useState } from "react";
import { DatabaseBackup, Download, Upload } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { demoDataService } from "../demo-data.service";
import type { DemoDataSummary } from "../demo-data.schema";

interface DemoDataTransferCardProps {
  administratorName: string;
}

const formatBytes = (value: number) => {
  if (value <= 0) return "0 KB";
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

const importConfirmation = (summary: DemoDataSummary) =>
  [
    "Impor akan MENGGANTI seluruh data demo pada browser ini.",
    "",
    `Sumber ekspor: ${summary.exportedBy}`,
    `Waktu ekspor: ${new Date(summary.exportedAt).toLocaleString("id-ID")}`,
    `Data lokal: ${summary.storageEntries} kelompok`,
    `Laporan perjalanan: ${summary.reportFiles} dokumen`,
    `Arsip SPJ: ${summary.archiveFiles} PDF (${formatBytes(summary.archiveBytes)})`,
    "",
    "Setelah berhasil, Anda akan keluar dan harus login memakai akun dari paket impor. Lanjutkan?",
  ].join("\n");

export function DemoDataTransferCard({
  administratorName,
}: DemoDataTransferCardProps) {
  const [busyAction, setBusyAction] = useState<"export" | "import" | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleExport = async () => {
    setBusyAction("export");
    try {
      const data = await demoDataService.createPackage(administratorName);
      demoDataService.downloadPackage(data);
      const summary = demoDataService.summarize(data);
      addToast(
        `Paket demo berhasil diekspor (${summary.storageEntries} kelompok data, ${summary.reportFiles} laporan, ${summary.archiveFiles} arsip PDF).`,
        "success",
      );
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Ekspor data demo gagal.",
        "error",
      );
    } finally {
      setBusyAction(null);
    }
  };

  const handleImport = async (file: File) => {
    try {
      const inspection = await demoDataService.inspectFile(file);
      if (!window.confirm(importConfirmation(inspection.summary))) return;

      setBusyAction("import");
      await demoDataService.restorePackage(inspection.data);
      addToast(
        "Data demo berhasil diimpor. Sesi akan dialihkan ke halaman login.",
        "success",
        2_000,
      );
      window.setTimeout(() => window.location.replace("/login"), 700);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Impor data demo gagal.",
        "error",
        5_000,
      );
      setBusyAction(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <DatabaseBackup className="h-4 w-4" />
          Transfer Data Demo Antarperangkat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning" title="Fitur sementara — khusus lingkungan demo">
          Gunakan paket ini untuk memindahkan salinan data browser ke perangkat
          lain selama backend dan database terpusat belum tersedia. Fitur ini
          wajib dinonaktifkan saat SIMPENAS masuk produksi.
        </Alert>

        <div className="grid gap-3 text-xs md:grid-cols-2">
          <div className="rounded-xl border p-4">
            <p className="font-bold">Export Paket Data Demo</p>
            <p className="mt-1 text-muted-foreground">
              Mengunduh master data, akun mock, transaksi, pengaturan,
              notifikasi, audit log, dan PDF Arsip SPJ. Sesi login aktif tidak
              disertakan.
            </p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="font-bold">Import Paket Data Demo</p>
            <p className="mt-1 text-muted-foreground">
              Mengganti data demo pada browser ini. Sistem memvalidasi paket dan
              membuat cadangan rollback sebelum penggantian data.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={() => void handleExport()}
            disabled={busyAction !== null}
          >
            <Download className="h-4 w-4" />
            {busyAction === "export" ? "Menyiapkan Paket..." : "Export Data Demo"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={busyAction !== null}
          >
            <Upload className="h-4 w-4" />
            {busyAction === "import" ? "Mengimpor Data..." : "Import Data Demo"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onClick={(event) => {
              event.currentTarget.value = "";
            }}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImport(file);
            }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Perangkat yang menerima paket tetap bekerja sebagai salinan mandiri;
          perubahan setelah impor tidak tersinkron otomatis ke perangkat lain.
          Simpan file paket dengan aman karena berisi data operasional dan akun
          demo.
        </p>
      </CardContent>
    </Card>
  );
}
