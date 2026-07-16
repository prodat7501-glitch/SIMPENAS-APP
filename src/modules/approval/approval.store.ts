import { create } from "zustand";
import type { ApprovalItem } from "./approval.service";
interface State {
  selected: ApprovalItem | null;
  search: string;
  setSelected: (item: ApprovalItem | null) => void;
  setSearch: (value: string) => void;
}
export const useApprovalStore = create<State>((set) => ({
  selected: null,
  search: "",
  setSelected: (selected) => set({ selected }),
  setSearch: (search) => set({ search }),
}));
