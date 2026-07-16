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
import { Edit2, Trash2, Search, Inbox } from "lucide-react";
import { DIPA } from "../dipa.schema";
import { EmptyState } from "@/components/ui/empty-state";

interface DIPATableProps {
  items: DIPA[];
  onEdit: (item: DIPA) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export function DIPATable({
  items,
  onEdit,
  onDelete,
  canEdit,
}: DIPATableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.kodeDipa.toLowerCase().includes(search.toLowerCase()) ||
      item.program.toLowerCase().includes(search.toLowerCase()),
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari kode DIPA atau program..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Anggaran DIPA"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data anggaran DIPA belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Kode DIPA</TableHead>
                <TableHead>Program / Kegiatan</TableHead>
                <TableHead>Pagu</TableHead>
                <TableHead>Realisasi</TableHead>
                <TableHead className="w-20">Tahun</TableHead>
                {canEdit && (
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold">{item.kodeDipa}</TableCell>
                  <TableCell>{item.program}</TableCell>
                  <TableCell className="text-primary font-bold">
                    {formatRupiah(item.pagu)}
                  </TableCell>
                  <TableCell className="text-success-hover font-bold">
                    {formatRupiah(item.realisasi)}
                  </TableCell>
                  <TableCell>{item.tahunAnggaran}</TableCell>
                  {canEdit && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
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
