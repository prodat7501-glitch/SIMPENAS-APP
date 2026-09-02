import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useAuthStore } from "@/stores/auth.store";
import { useUserAccountStore } from "./user-account.store";

export function useUserAccounts() {
  const items = useUserAccountStore((state) => state.items);
  const load = useUserAccountStore((state) => state.load);
  const updateAccount = useUserAccountStore((state) => state.update);
  const removeAccount = useUserAccountStore((state) => state.remove);
  const activeUserName = useAuthStore((state) => state.user?.name);
  const log = useActivityStore((state) => state.add);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    update: async (...args: Parameters<typeof updateAccount>) => {
      await updateAccount(...args);
      log({
        action: "Update",
        module: "Master Akun Pengguna",
        description: "Memperbarui akun pengguna atau kata sandi mock",
        user: activeUserName ?? "Administrator",
      });
    },
    remove: async (id: string, accountName?: string) => {
      await removeAccount(id);
      log({
        action: "Delete",
        module: "Master Akun Pengguna",
        description: `Menghapus akun pengguna ${accountName ? `(${accountName})` : ""}`,
        user: activeUserName ?? "Administrator",
      });
    },
  };
}

