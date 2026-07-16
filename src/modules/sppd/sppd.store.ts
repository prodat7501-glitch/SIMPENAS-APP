import { create } from "zustand";

import type { Sppd } from "./sppd.schema";
import type { SppdListFilters, SppdStatus } from "./sppd.types";

interface SppdState {
  selectedItem: Sppd | null;
  previewItem: Sppd | null;
  filters: SppdListFilters;
  setSelectedItem: (item: Sppd | null) => void;
  setPreviewItem: (item: Sppd | null) => void;
  setSearch: (search: string) => void;
  setStatus: (status: SppdStatus | "Semua") => void;
}

export const useSppdStore = create<SppdState>((set) => ({
  selectedItem: null,
  previewItem: null,
  filters: {
    search: "",
    status: "Semua",
  },
  setSelectedItem: (item) => set({ selectedItem: item }),
  setPreviewItem: (item) => set({ previewItem: item }),
  setSearch: (search) =>
    set((state) => ({
      filters: {
        ...state.filters,
        search,
      },
    })),
  setStatus: (status) =>
    set((state) => ({
      filters: {
        ...state.filters,
        status,
      },
    })),
}));
