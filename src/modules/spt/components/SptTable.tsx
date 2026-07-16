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
import { Edit2, Trash2, Search, Inbox, Printer } from "lucide-react";
import { Spt } from "../spt.schema";
import { EmptyState } from "@/components/ui/empty-state";

interface SptTableProps {
  items: Spt[];
  onEdit: (item: Spt) => void;
  onDelete: (id: string) => void;
  onPreview: (item: Spt) => void;
  canEdit: boolean;
  getNotaDinasNumber: (notaDinasId: string) => string;
}

export function SptTable({
  items,
  onEdit,
  onDelete,
  onPreview,
  canEdit,
  getNotaDinasNumber,
}: SptTableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.nomor.toLowerCase().includes(search.toLowerCase()) ||
      item.untuk.some((u) =>
        u.text.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const getStatusVariant = (status: Spt["status"]) => {
    if (status === "Draft") return "outline";
    if (status === "Nomor Diambil") return "info";
    if (status === "Menunggu Approval") return "warning";
    if (status === "Perlu Revisi") return "danger";
    return "success";
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari nomor SPT atau kegiatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada SPT"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data transaksi SPT belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nomor SPT</TableHead>
                <TableHead>Nota Dinas</TableHead>
                <TableHead>Maksud Tugas / Kegiatan</TableHead>
                <TableHead className="w-48">Tanggal Tugas</TableHead>
                <TableHead className="w-24 text-center">Personil</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-36 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold text-foreground font-mono text-xs">
                    {item.nomor}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {getNotaDinasNumber(item.notaDinasId)}
                  </TableCell>
                  <TableCell className="text-xs">
                    <p className="line-clamp-2">{item.untuk[0]?.text || "-"}</p>
                  </TableCell>
                  <TableCell className="text-xs">
                    {item.tanggalMulai} s.d {item.tanggalSelesai}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    {item.personil.length}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(item.status)}>
                      {item.status}
                    </Badge>
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
                      {canEdit && (
                        <>
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
                        </>
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
