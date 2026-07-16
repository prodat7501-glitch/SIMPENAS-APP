import { create } from "zustand";
import type { DokumenKeuangan, Spj } from "./keuangan.schema";
interface State {
  selected: Spj | null;
  preview: DokumenKeuangan | null;
  setSelected: (x: Spj | null) => void;
  setPreview: (x: DokumenKeuangan | null) => void;
}
export const useKeuanganStore = create<State>((set) => ({
  selected: null,
  preview: null,
  setSelected: (selected) => set({ selected }),
  setPreview: (preview) => set({ preview }),
}));
