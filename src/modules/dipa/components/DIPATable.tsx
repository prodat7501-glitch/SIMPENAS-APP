"use client";

import { useState } from "react";
import { Edit2, Inbox, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DIPA } from "../dipa.schema";

interface DIPATableProps {
  items: DIPA[];
  onEdit: (item: DIPA) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

const getSearchText = (item: DIPA) =>
  [
    item.kodeDipa,
    item.kodeKro,
    item.klasifikasiRincianOutput,
    item.kodeAkun,
    item.akunPerjalananDinas,
    item.tahunAnggaran,
  ]
    .join(" ")
    .toLocaleLowerCase("id-ID");

export function DIPATable({
  items,
  onEdit,
  onDelete,
  canEdit,
}: DIPATableProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLocaleLowerCase("id-ID");
  const filtered = items.filter((item) =>
    getSearchText(item).includes(normalizedSearch),
  );

  return (
    <div className="space-y-4">
      <div className="flex w-full max-w-sm items-center">
        <Input
          placeholder="Cari KRO atau akun perjalanan dinas..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
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
          icon={<Inbox className="h-6 w-6" />}
        />
      ) : (
        <TableContainer>
          <Table className="min-w-[1100px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">No Urut</TableHead>
                <TableHead className="w-52">Kode Akun</TableHead>
                <TableHead className="w-64">
                  Klasifikasi Rincian Output (KRO)
                </TableHead>
                <TableHead>Akun Perjalanan Dinas</TableHead>
                <TableHead className="w-44">Pagu Anggaran</TableHead>
                <TableHead className="w-44">Realisasi Pembayaran</TableHead>
                <TableHead className="w-32">Tahun Anggaran</TableHead>
                {canEdit && (
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="break-words align-top font-bold">
                    {item.kodeDipa}
                  </TableCell>
                  <TableCell className="break-words align-top font-bold">
                    {item.klasifikasiRincianOutput}
                  </TableCell>
                  <TableCell className="min-w-80 break-words align-top">
                    {item.akunPerjalananDinas}
                  </TableCell>
                  <TableCell className="align-top font-bold text-primary">
                    {formatRupiah(item.pagu)}
                  </TableCell>
                  <TableCell className="align-top font-bold text-success-hover">
                    {formatRupiah(item.realisasi)}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.tahunAnggaran}
                  </TableCell>
                  {canEdit && (
                    <TableCell className="align-top text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(item)}
                          className="text-primary hover:bg-primary/10"
                          aria-label={`Ubah DIPA ${item.kodeDipa}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(item.id)}
                          className="text-danger hover:bg-danger/10"
                          aria-label={`Hapus DIPA ${item.kodeDipa}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
