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
  load: () => set({ items: userAccountService.getAll() }),
  update: async (id, input) => {
    await userAccountService.update(id, input);
    set({ items: userAccountService.getAll() });
  },
}));

