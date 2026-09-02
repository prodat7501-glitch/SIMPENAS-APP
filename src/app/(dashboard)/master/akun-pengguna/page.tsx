"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { UserAccountForm } from "@/modules/user-account/components/UserAccountForm";
import { UserAccountTable } from "@/modules/user-account/components/UserAccountTable";
import type { UserAccountFormInput } from "@/modules/user-account/user-account.schema";
import { DEFAULT_MOCK_PASSWORD } from "@/modules/user-account/user-account.service";
import type { UserAccount } from "@/modules/user-account/user-account.types";
import { useUserAccounts } from "@/modules/user-account/useUserAccounts";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function UserAccountPage() {
  const { hasPermission } = useAuth();
  const { items, update, remove } = useUserAccounts();
  const { addToast } = useToast();
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<UserAccount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canRead = hasPermission("Master Akun Pengguna", "R");
  const canUpdate = hasPermission("Master Akun Pengguna", "U");
  const canDelete = hasPermission("Master Akun Pengguna", "D");

  if (!canRead) {
    return (
      <Alert variant="error" title="Akses Ditolak">
        Hanya Administrator yang dapat mengelola akun pengguna.
      </Alert>
    );
  }

  const handleUpdate = async (input: UserAccountFormInput) => {
    if (!editingAccount || !canUpdate) return;

    try {
      await update(editingAccount.id, input);
      setEditingAccount(null);
      addToast("Akun pengguna berhasil diperbarui.", "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Akun pengguna gagal diperbarui.",
        "error",
      );
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount || !canDelete) return;

    if (
      deletingAccount.id === "user-admin" ||
      deletingAccount.username.toLowerCase() === "admin"
    ) {
      addToast("Akun Administrator utama tidak dapat dihapus.", "error");
      setDeletingAccount(null);
      return;
    }

    setIsDeleting(true);
    try {
      await remove(deletingAccount.id, deletingAccount.name);
      addToast(
        `Akun pengguna "${deletingAccount.name}" (@${deletingAccount.username}) berhasil dihapus.`,
        "success",
      );
      setDeletingAccount(null);
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Gagal menghapus akun pengguna.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">
          Master Akun Pengguna
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Kelola username, status akun, kata sandi, dan hapus akun pengguna.
          Role tetap mengikuti Master Pegawai.
        </p>
      </div>

      <Alert variant="info" title="Akun Individual">
        Akun dibuat otomatis untuk setiap data Master Pegawai. Kata sandi awal
        akun baru adalah <strong>{DEFAULT_MOCK_PASSWORD}</strong>. Gunakan tombol
        Ubah untuk mengganti username/password, atau tombol Hapus untuk menghapus akun yang sudah tidak digunakan.
      </Alert>

      <UserAccountTable
        items={items}
        canDelete={canDelete}
        onEdit={(account) => {
          if (canUpdate) setEditingAccount(account);
        }}
        onDelete={(account) => {
          if (canDelete) setDeletingAccount(account);
        }}
      />

      {/* Edit Account Modal */}
      {editingAccount && (
        <Dialog
          isOpen
          onClose={() => setEditingAccount(null)}
          title="Ubah Akun Pengguna"
          className="max-w-2xl"
          bodyClassName="max-h-[75vh] overflow-y-auto pr-1"
        >
          <UserAccountForm
            account={editingAccount}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAccount(null)}
          />
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAccount && (
        <Dialog
          isOpen
          onClose={() => !isDeleting && setDeletingAccount(null)}
          title="Konfirmasi Hapus Akun"
          className="max-w-md"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Peringatan Penghapusan Akun</p>
                <p className="mt-0.5 text-foreground/80">
                  Apakah Anda yakin ingin menghapus akun pengguna berikut?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/60 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nama Pegawai:</span>
                <span className="font-bold text-foreground">{deletingAccount.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-mono font-semibold text-foreground">@{deletingAccount.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-semibold text-foreground">{deletingAccount.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground">{deletingAccount.email}</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Tindakan ini akan menghapus akses login untuk pengguna ini. Data riwayat dokumen dan transaksi pegawai tetap tersimpan aman.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setDeletingAccount(null)}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
                className="gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Menghapus..." : "Ya, Hapus Akun"}</span>
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
