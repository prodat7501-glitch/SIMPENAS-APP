import { create } from "zustand";
import { Spt } from "./spt.schema";
import { sptService } from "./spt.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

interface SptState {
  items: Spt[];
  load: () => void;
  add: (item: Omit<Spt, "id">) => void;
  update: (id: string, item: Omit<Spt, "id">) => void;
  remove: (id: string) => void;
  generateNomor: (date: string) => string;
}

export const useSptStore = create<SptState>((set) => ({
  items: [],
  load: () => {
    set({ items: sptService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `st-${Date.now()}` }];
      sptService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      sptService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (
        target &&
        ["Draft", "Nomor Diambil"].includes(target.status) &&
        target.nomor
      ) {
        penomoranService.releaseNumber(
          "SPT",
          target.nomor,
          "SPT dihapus sebelum selesai.",
        );
      }
      const updated = state.items.filter((item) => item.id !== id);
      sptService.saveAll(updated);
      return { items: updated };
    });
  },
  generateNomor: (date) => {
    return sptService.generateNomor(date);
  },
}));
