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
import { Pegawai } from "../pegawai.schema";
import { EmptyState } from "@/components/ui/empty-state";
import { Jabatan } from "@/modules/jabatan/jabatan.schema";
import { UnitKerja } from "@/modules/unit-kerja/unit-kerja.schema";
import { Pangkat } from "@/modules/pangkat/pangkat.schema";

interface PegawaiTableProps {
  items: Pegawai[];
  jabatans: Jabatan[];
  unitKerjas: UnitKerja[];
  pangkats: Pangkat[];
  onEdit: (item: Pegawai) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  canEdit: boolean;
}

export function PegawaiTable({
  items,
  jabatans,
  unitKerjas,
  pangkats,
  onEdit,
  onDelete,
  onToggleStatus,
  canEdit,
}: PegawaiTableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      (item.nip ?? "").toLowerCase().includes(search.toLowerCase()) ||
      item.kategoriPegawai.toLowerCase().includes(search.toLowerCase()) ||
      item.roleAplikasi.toLowerCase().includes(search.toLowerCase()),
  );

  const getJabatanName = (id: string) =>
    jabatans.find((j) => j.id === id)?.nama || "-";
  const getUnitKerjaName = (id: string) =>
    unitKerjas.find((u) => u.id === id)?.nama || "-";
  const getPangkatName = (id: string) => {
    const p = pangkats.find((pk) => pk.id === id);
    return p ? `${p.namaPangkat} (${p.golongan})` : "-";
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari nama atau NIP pegawai..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pegawai"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data pegawai belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Nama Pegawai</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>NIP</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Unit Kerja</TableHead>
                <TableHead>Pangkat / Golongan</TableHead>
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
                  <TableCell className="font-bold text-foreground">
                    {item.nama}
                  </TableCell>
                  <TableCell>{item.kategoriPegawai}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.roleAplikasi}</Badge>
                  </TableCell>
                  <TableCell>{item.nip || "-"}</TableCell>
                  <TableCell>{getJabatanName(item.jabatanId)}</TableCell>
                  <TableCell>{getUnitKerjaName(item.unitKerjaId)}</TableCell>
                  <TableCell>{getPangkatName(item.pangkatId)}</TableCell>
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
