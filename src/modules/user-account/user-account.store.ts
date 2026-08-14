import { create } from "zustand";
import type { UserAccountFormInput } from "./user-account.schema";
import { userAccountService } from "./user-account.service";
import type { UserAccount } from "./user-account.types";

interface UserAccountState {
  items: UserAccount[];
  load: () => void;
  update: (id: string, input: UserAccountFormInput) => Promise<void>;
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
}));

