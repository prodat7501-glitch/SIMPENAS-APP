"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Upload } from "@/components/ui/upload";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { MAX_ARSIP_SPJ_SIZE_MB } from "../arsip-spj.schema";
import type { ArsipSpjRow } from "../arsip-spj.types";

interface ArsipSpjUploadDialogProps {
  isOpen: boolean;
  row: ArsipSpjRow | null;
  isUploading: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
}

export function ArsipSpjUploadDialog({
  isOpen,
  row,
  isUploading,
  onClose,
  onUpload,
}: ArsipSpjUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const closeDialog = () => {
    setFile(null);
    setError("");
    onClose();
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Pilih satu file PDF terlebih dahulu.");
      return;
    }
    try {
      setError("");
      await onUpload(file);
      setFile(null);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Upload arsip SPJ gagal.",
      );
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={closeDialog}
      title={
        row?.arsip ? "Ganti Dokumen Fisik SPJ" : "Upload Dokumen Fisik SPJ"
      }
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-[10px] font-bold uppercase text-muted-foreground">
            Nomor Nota Dinas
          </p>
          <p className="mt-1 text-sm font-bold text-foreground">
            {row?.nomorNotaDinas ?? "-"}
          </p>
        </div>
        {row?.arsip && (
          <Alert variant="warning" title="Arsip sudah tersedia">
            Upload baru akan menimpa arsip PDF sebelumnya untuk Nota Dinas ini.
          </Alert>
        )}
        <Upload
          accept="application/pdf,.pdf"
          maxSizeMb={MAX_ARSIP_SPJ_SIZE_MB}
          description={`PDF hasil pemindaian dokumen fisik yang telah ditandatangani (maksimal ${MAX_ARSIP_SPJ_SIZE_MB} MB)`}
          onFileSelect={(files) => {
            setFile(files[0] ?? null);
            setError("");
          }}
        />
        {error && <Alert variant="error">{error}</Alert>}
        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={closeDialog}>
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            <FileUp />
            {isUploading ? "Menyimpan..." : "Simpan PDF"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
