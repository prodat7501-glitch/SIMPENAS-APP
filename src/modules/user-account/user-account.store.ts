import { create } from "zustand";
import type { UserAccountFormInput } from "./user-account.schema";
import { userAccountService } from "./user-account.service";
import type { UserAccount } from "./user-account.types";

interface UserAccountState {
  items: UserAccount[];
  load: () => void;
  update: (id: string, input: UserAccountFormInput) => Promise<void>;
  reset2FA: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useUserAccountStore = create<UserAccountState>((set) => ({
  items: [],
  load: async () => {
    try {
      const items = await userAccountService.apiGetAll();
      set({ items });
    } catch {
      set({ items: userAccountService.getAll() });
    }
  },
  update: async (id, input) => {
    try {
      await userAccountService.apiUpdate(id, input);
      set({ items: await userAccountService.apiGetAll() });
    } catch {
      await userAccountService.update(id, input);
      set({ items: userAccountService.getAll() });
    }
  },
  reset2FA: async (id) => {
    try {
      await userAccountService.reset2FA(id);
      set({ items: await userAccountService.apiGetAll() });
    } catch {
      const items = userAccountService.getAll();
      const updated = items.map((acc) =>
        acc.id === id ? { ...acc, totpSecret: "", isTotpActive: false } : acc,
      );
      userAccountService.saveAccounts(updated);
      set({ items: updated });
    }
  },
  remove: async (id) => {
    try {
      await userAccountService.apiDelete(id);
      set({ items: await userAccountService.apiGetAll() });
    } catch {
      const items = userAccountService.getAll();
      userAccountService.saveAccounts(items.filter((item) => item.id !== id));
      set({ items: userAccountService.getAll() });
    }
  },
}));
