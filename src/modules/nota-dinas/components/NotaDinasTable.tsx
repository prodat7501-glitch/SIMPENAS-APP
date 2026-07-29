"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Edit2,
  Trash2,
  Search,
  Inbox,
  Printer,
} from "lucide-react";
import { NotaDinas } from "../nota-dinas.schema";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTableDate } from "@/lib/formatters";

interface NotaDinasTableProps {
  items: NotaDinas[];
  onEdit: (item: NotaDinas) => void;
  onDelete: (id: string) => void;
  onPreview: (item: NotaDinas) => void;
  canEdit: boolean;
  canEditItem?: (item: NotaDinas) => boolean;
  canDelete: boolean;
  getPegawaiName: (pegawaiId: string) => string;
}

export function NotaDinasTable({
  items,
  onEdit,
  onDelete,
  onPreview,
  canEdit,
  canEditItem,
  canDelete,
  getPegawaiName,
}: NotaDinasTableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.perihal.toLowerCase().includes(search.toLowerCase()) ||
      item.nomor.toLowerCase().includes(search.toLowerCase()) ||
      item.dari.toLowerCase().includes(search.toLowerCase()),
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const getStatusVariant = (status: NotaDinas["status"]) => {
    if (status === "Draft") return "outline";
    if (status === "Nomor Diambil") return "info";
    if (status === "Menunggu Approval") return "warning";
    if (status === "Perlu Revisi") return "danger";
    return "success";
  };

  const getConflictNames = (item: NotaDinas) =>
    Array.from(
      new Set(
        (item.travelConflicts ?? []).map((conflict) =>
          getPegawaiName(conflict.pegawaiId),
        ),
      ),
    );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari perihal atau nomor nota dinas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Nota Dinas"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data transaksi nota dinas belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead className="min-w-48">Nomor</TableHead>
                <TableHead className="min-w-72">Perihal</TableHead>
                <TableHead className="w-28">Tanggal</TableHead>
                <TableHead>Pengirim (Dari)</TableHead>
                <TableHead className="w-32">Tipe Dinas</TableHead>
                <TableHead className="w-24 text-center">Personil</TableHead>
                <TableHead className="w-32">Total Biaya</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-36 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow
                  key={item.id}
                  className={
                    getConflictNames(item).length ? "bg-danger/5" : undefined
                  }
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-mono text-[10px]">
                    {item.nomor}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground line-clamp-1">
                        {item.perihal}
                      </span>
                      {getConflictNames(item).length > 0 && (
                        <span className="mt-1 flex items-start gap-1 text-[10px] font-bold leading-tight text-danger">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          Potensi perjalanan ganda:{" "}
                          {getConflictNames(item).join(", ")}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {formatTableDate(item.tanggal)}
                  </TableCell>
                  <TableCell className="text-xs">{item.dari}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.jenis}</Badge>
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {item.lampiran.length}
                  </TableCell>
                  <TableCell className="font-bold text-primary text-xs">
                    {formatRupiah(item.totalBiaya)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <Badge variant={getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      {item.status === "Perlu Revisi" && item.catatanRevisi && (
                        <p className="max-w-64 text-[10px] font-semibold leading-relaxed text-danger">
                          Catatan: {item.catatanRevisi}
                        </p>
                      )}
                      {getConflictNames(item).length > 0 && (
                        <Badge variant="danger">Potensi Ganda</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onPreview(item)}
                        title="Pratinjau & Cetak"
                        className="h-8 w-8 text-muted-foreground hover:bg-muted cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                      {canEdit && (canEditItem?.(item) ?? true) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id!)}
                          title="Hapus"
                          className="h-8 w-8 text-danger hover:bg-danger/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
