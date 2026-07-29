"use client";

import { Edit2, FileText, Inbox, Printer, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SPPD_STATUS_OPTIONS } from "../sppd.constants";
import type { Sppd } from "../sppd.schema";
import type { SppdStatus } from "../sppd.types";
import { formatTableDate } from "@/lib/formatters";

interface SppdTableProps {
  items: Sppd[];
  search: string;
  status: SppdStatus | "Semua";
  canEdit: boolean;
  canEditItem?: (item: Sppd) => boolean;
  canDelete: boolean;
  canPrint: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: SppdStatus | "Semua") => void;
  onEdit: (item: Sppd) => void;
  onDelete: (id: string) => void;
  onPreview: (item: Sppd) => void;
  onPreviewPage2: (item: Sppd) => void;
  getSptNumber: (sptId: string) => string;
  getPegawaiName: (pegawaiId: string) => string;
  getDipaLabel: (dipaId: string) => string;
}

const getStatusVariant = (status: Sppd["status"]) => {
  if (status === "Draft") return "outline";
  if (status === "Diproses") return "warning";
  if (status === "Diarsipkan") return "info";
  return "success";
};

export function SppdTable({
  items,
  search,
  status,
  canEdit,
  canEditItem,
  canDelete,
  canPrint,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
  onPreview,
  onPreviewPage2,
  getSptNumber,
  getPegawaiName,
  getDipaLabel,
}: SppdTableProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,360px)_220px] gap-3">
        <Input
          placeholder="Cari nomor, tujuan, atau maksud..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as SppdStatus | "Semua")
          }
        >
          <option value="Semua">Semua Status Dokumen</option>
          {SPPD_STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="Tidak Ada SPPD"
          description={
            search || status !== "Semua"
              ? "Filter tidak menemukan data SPPD."
              : "Data SPPD belum dibuat."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">No</TableHead>
                <TableHead>Nomor SPPD</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Referensi SPT</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead className="w-40">Tanggal</TableHead>
                <TableHead className="w-24 text-center">Hari</TableHead>
                <TableHead>Akun DIPA</TableHead>
                <TableHead className="w-36">Status Dokumen</TableHead>
                <TableHead className="w-36 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold text-foreground font-mono text-xs">
                    {item.nomor}
                  </TableCell>
                  <TableCell className="text-xs font-bold">
                    {getPegawaiName(item.personil[0]?.pegawaiId ?? "")}
                  </TableCell>
                  <TableCell className="text-xs">
                    {getSptNumber(item.sptId)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="font-bold">
                      {item.tempatBerangkat} - {item.tempatTujuan}
                    </p>
                    <p className="text-muted-foreground line-clamp-1">
                      {item.transportasi}
                    </p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatTableDate(item.tanggalBerangkat)} s.d{" "}
                    {formatTableDate(item.tanggalKembali)}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {item.lamaPerjalanan}
                  </TableCell>
                  <TableCell className="text-xs line-clamp-2">
                    {getDipaLabel(item.dipaId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canPrint && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPreview(item)}
                            title="Pratinjau dan cetak SPPD halaman 1"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPreviewPage2(item)}
                            title="Pratinjau dan cetak SPPD halaman 2"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {canEdit && (canEditItem?.(item) ?? true) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          title="Ubah SPPD"
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      {canDelete && item.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id!)}
                          title="Hapus SPPD"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
