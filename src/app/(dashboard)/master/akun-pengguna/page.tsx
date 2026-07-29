"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { UserAccountForm } from "@/modules/user-account/components/UserAccountForm";
import { UserAccountTable } from "@/modules/user-account/components/UserAccountTable";
import type { UserAccountFormInput } from "@/modules/user-account/user-account.schema";
import { DEFAULT_MOCK_PASSWORD } from "@/modules/user-account/user-account.service";
import type { UserAccount } from "@/modules/user-account/user-account.types";
import { useUserAccounts } from "@/modules/user-account/useUserAccounts";

export default function UserAccountPage() {
  const { hasPermission } = useAuth();
  const { items, update } = useUserAccounts();
  const { addToast } = useToast();
  const [editingAccount, setEditingAccount] = useState<UserAccount | null>(
    null,
  );

  const canRead = hasPermission("Master Akun Pengguna", "R");
  const canUpdate = hasPermission("Master Akun Pengguna", "U");

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">
          Master Akun Pengguna
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Kelola username, status akun, dan kata sandi untuk setiap pegawai.
          Role tetap mengikuti Master Pegawai.
        </p>
      </div>

      <Alert variant="info" title="Akun Mock Individual">
        Akun dibuat otomatis untuk setiap data Master Pegawai. Kata sandi awal
        akun baru adalah <strong>{DEFAULT_MOCK_PASSWORD}</strong>. Gunakan menu
        Ubah untuk mengganti username atau menetapkan kata sandi baru.
      </Alert>

      <UserAccountTable
        items={items}
        onEdit={(account) => {
          if (canUpdate) setEditingAccount(account);
        }}
      />

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
    </div>
  );
}

