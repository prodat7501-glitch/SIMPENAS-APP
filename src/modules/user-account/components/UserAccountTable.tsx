"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserAccount } from "../user-account.types";

interface UserAccountTableProps {
  items: UserAccount[];
  onEdit: (account: UserAccount) => void;
  onDelete?: (account: UserAccount) => void;
  canDelete?: boolean;
}

export function UserAccountTable({
  items,
  onEdit,
  onDelete,
  canDelete = true,
}: UserAccountTableProps) {
  const [search, setSearch] = useState("");
  const filteredItems = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return items;

    return items.filter((item) =>
      [item.name, item.username, item.email, item.role]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [items, search]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Cari nama, username, email, atau role..."
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-center">No.</th>
              <th className="px-4 py-3">Pegawai</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((item, index) => {
              const isMainAdmin =
                item.id === "user-admin" || item.username.toLowerCase() === "admin";

              return (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-center">{index + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-foreground">{item.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.pegawaiId
                        ? `ID Pegawai: ${item.pegawaiId}`
                        : "Akun sistem"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">
                    {item.username}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{item.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {item.email}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.isActive ? "success" : "danger"}>
                      {item.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        title="Ubah Akun"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Ubah
                      </Button>

                      {onDelete && canDelete && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={isMainAdmin}
                          onClick={() => !isMainAdmin && onDelete(item)}
                          title={
                            isMainAdmin
                              ? "Akun Administrator utama tidak dapat dihapus"
                              : "Hapus Akun Pengguna"
                          }
                          className="px-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Tidak ada akun yang sesuai pencarian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
