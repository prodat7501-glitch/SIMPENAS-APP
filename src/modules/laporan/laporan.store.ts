import { create } from "zustand";
import type { Laporan } from "./laporan.schema";
import type { LaporanFilters, LaporanStatus } from "./laporan.types";

interface State {
  selected: Laporan | null;
  preview: Laporan | null;
  filters: LaporanFilters;
  setSelected: (item: Laporan | null) => void;
  setPreview: (item: Laporan | null) => void;
  setSearch: (search: string) => void;
  setStatus: (status: LaporanStatus | "Semua") => void;
}

export const useLaporanStore = create<State>((set) => ({
  selected: null,
  preview: null,
  filters: { search: "", status: "Semua" },
  setSelected: (selected) => set({ selected }),
  setPreview: (preview) => set({ preview }),
  setSearch: (search) =>
    set((state) => ({ filters: { ...state.filters, search } })),
  setStatus: (status) =>
    set((state) => ({ filters: { ...state.filters, status } })),
}));
