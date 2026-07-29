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
  Edit2,
  Trash2,
  Search,
  Inbox,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Penandatangan } from "../penandatangan.schema";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTableDate } from "@/lib/formatters";

interface PenandatanganTableProps {
  items: Penandatangan[];
  onEdit: (item: Penandatangan) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  canEdit: boolean;
}

export function PenandatanganTable({
  items,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit,
}: PenandatanganTableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.nip.toLowerCase().includes(search.toLowerCase()) ||
      item.peran.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari nama, NIP atau peran pejabat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pejabat Penandatangan"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data pejabat penandatangan belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nama Pejabat</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Jabatan Cetak</TableHead>
                <TableHead>Peran</TableHead>
                <TableHead>Periode Berlaku</TableHead>
                <TableHead>Jenis Dokumen</TableHead>
                <TableHead className="w-24">Status</TableHead>
                {canEdit && (
                  <TableHead className="w-32 text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold">{item.nama}</TableCell>
                  <TableCell>{item.nip}</TableCell>
                  <TableCell>{item.jabatanPenandatangan}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        item.peran === "KPA"
                          ? "default"
                          : item.peran === "PPK"
                            ? "info"
                            : "outline"
                      }
                    >
                      {item.peran}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {item.berlakuMulai
                      ? formatTableDate(item.berlakuMulai)
                      : "Tanpa batas awal"}
                    {" s.d. "}
                    {item.berlakuSampai
                      ? formatTableDate(item.berlakuSampai)
                      : "Seterusnya"}
                  </TableCell>
                  <TableCell>
                    <div className="flex max-w-72 flex-wrap gap-1">
                      {item.jenisDokumen.map((jenis) => (
                        <Badge key={jenis} variant="outline">
                          {jenis}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "Aktif" ? "success" : "danger"}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onToggleStatus(item.id!)}
                          title="Ubah Status"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted cursor-pointer"
                        >
                          {item.status === "Aktif" ? (
                            <ToggleRight className="w-4 h-4 text-success" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="h-8 w-8 text-primary hover:bg-primary/10 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id!)}
                          className="h-8 w-8 text-danger hover:bg-danger/10 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
