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
export default function LogPage() {
  const { hasPermission } = useAuth();
  const store = useActivityStore();
  const [search, setSearch] = useState("");
  if (!hasPermission("Log Aktivitas", "R")) return <p>Akses ditolak.</p>;
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
        {hasPermission("Log Aktivitas", "D") && (
          <Button variant="ghost" onClick={store.clear}>
            <Trash2 className="w-4 h-4" /> Bersihkan
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
                <TableCell>
                  {new Date(x.createdAt).toLocaleString("id-ID")}
                </TableCell>
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
