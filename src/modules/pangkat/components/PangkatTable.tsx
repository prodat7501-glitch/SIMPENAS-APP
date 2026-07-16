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
import { Pangkat } from "../pangkat.schema";
import { EmptyState } from "@/components/ui/empty-state";

interface PangkatTableProps {
  items: Pangkat[];
  onEdit: (item: Pangkat) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}

export function PangkatTable({
  items,
  onEdit,
  onDelete,
  canEdit,
}: PangkatTableProps) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (item) =>
      item.golongan.toLowerCase().includes(search.toLowerCase()) ||
      item.namaPangkat.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex items-center w-full max-w-sm">
        <Input
          placeholder="Cari golongan atau nama pangkat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pangkat/Golongan"
          description={
            search
              ? "Pencarian tidak menemukan kecocokan."
              : "Data pangkat belum terdaftar."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">No</TableHead>
                <TableHead>Golongan</TableHead>
                <TableHead>Nama Pangkat</TableHead>
                {canEdit && (
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-bold">{item.golongan}</TableCell>
                  <TableCell>{item.namaPangkat}</TableCell>
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
