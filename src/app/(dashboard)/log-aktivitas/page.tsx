"use client";
import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/hooks/useAuth";
import { useActivityStore } from "@/stores/activity.store";
import { useToast } from "@/components/ui/toast";
import { formatTableDateTime } from "@/lib/formatters";
export default function LogPage() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const store = useActivityStore();
  const [search, setSearch] = useState("");
  if (!hasPermission("Log Aktivitas", "R")) return <p>Akses ditolak.</p>;
  const canClear =
    user?.role === "Administrator" && hasPermission("Log Aktivitas", "D");
  const clearActivity = () => {
    if (!user || !canClear) {
      addToast(
        "Hanya Administrator yang dapat membersihkan Log Aktivitas.",
        "error",
      );
      return;
    }
    if (
      !window.confirm(
        `Bersihkan ${store.items.length} entri Log Aktivitas? Satu catatan audit pembersihan akan tetap disimpan.`,
      )
    ) {
      return;
    }
    try {
      const total = store.clear(user.role, user.name);
      addToast(`${total} entri Log Aktivitas berhasil dibersihkan.`, "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Log Aktivitas gagal dibersihkan.",
        "error",
      );
    }
  };
  const rows = store.items.filter((x) =>
    `${x.action} ${x.module} ${x.description} ${x.user}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Log Aktivitas</h1>
          <p className="text-xs text-muted-foreground">
            Audit trail aktivitas penting pengguna.
          </p>
        </div>
        {canClear && (
          <Button
            variant="destructive"
            onClick={clearActivity}
            disabled={store.items.length === 0}
          >
            <Trash2 className="w-4 h-4" /> Bersihkan Log Aktivitas
          </Button>
        )}
      </div>
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari aktivitas..."
        leftIcon={<Search className="w-4 h-4" />}
      />
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Waktu</TableHead>
              <TableHead>Pengguna</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Modul</TableHead>
              <TableHead>Deskripsi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={x.id}>
                <TableCell>{formatTableDateTime(x.createdAt)}</TableCell>
                <TableCell>{x.user}</TableCell>
                <TableCell>
                  <Badge>{x.action}</Badge>
                </TableCell>
                <TableCell>{x.module}</TableCell>
                <TableCell>{x.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
