"use client";

import { Download, FileCheck2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTableDateTime } from "@/lib/formatters";
import type { ArsipSpjRow } from "../arsip-spj.types";

interface ArsipSpjTableProps {
  rows: ArsipSpjRow[];
  canUpload: boolean;
  onUpload: (row: ArsipSpjRow) => void;
  onDownload: (row: ArsipSpjRow) => void;
}

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export function ArsipSpjTable({
  rows,
  canUpload,
  onUpload,
  onDownload,
}: ArsipSpjTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center">
        <FileCheck2 className="mx-auto mb-3 h-9 w-9 text-muted-foreground" />
        <p className="text-sm font-bold">Belum ada riwayat perjalanan dinas</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Arsip akan tersedia setelah Nota Dinas dibuat.
        </p>
      </div>
    );
  }

  return (
    <TableContainer>
      <Table className="min-w-[1120px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-14 text-center">No.</TableHead>
            <TableHead>Nomor Nota Dinas</TableHead>
            <TableHead>Nomor SPT</TableHead>
            <TableHead>Nomor SPPD</TableHead>
            <TableHead>Personil yang Ditugaskan</TableHead>
            <TableHead className="w-64 text-center">Aksi Arsip PDF</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.notaDinasId}>
              <TableCell className="text-center">{index + 1}</TableCell>
              <TableCell className="font-bold">{row.nomorNotaDinas}</TableCell>
              <TableCell>
                {row.nomorSpt.length > 0 ? row.nomorSpt.join(", ") : "-"}
              </TableCell>
              <TableCell>
                {row.nomorSppd.length > 0 ? row.nomorSppd.join(", ") : "-"}
              </TableCell>
              <TableCell>
                {row.personil.length > 0 ? (
                  <ol className="list-decimal space-y-1 pl-4">
                    {row.personil.map((nama, personilIndex) => (
                      <li key={`${nama}-${personilIndex}`}>{nama}</li>
                    ))}
                  </ol>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap justify-center gap-2">
                  {canUpload && (
                    <Button
                      size="sm"
                      variant={row.arsip ? "outline" : "default"}
                      onClick={() => onUpload(row)}
                    >
                      <FileUp />
                      {row.arsip ? "Ganti PDF" : "Upload PDF"}
                    </Button>
                  )}
                  {row.arsip && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownload(row)}
                    >
                      <Download />
                      Unduh
                    </Button>
                  )}
                </div>
                {row.arsip ? (
                  <div className="mt-2 text-center text-[10px] text-muted-foreground">
                    <p className="truncate" title={row.arsip.namaFile}>
                      {row.arsip.namaFile} · {formatSize(row.arsip.ukuranFile)}
                    </p>
                    <p>{formatTableDateTime(row.arsip.diunggahPada)}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    Belum diunggah
                  </p>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
