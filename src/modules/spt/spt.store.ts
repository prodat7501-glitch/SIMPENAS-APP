import { create } from "zustand";
import { Spt } from "./spt.schema";
import { sptService } from "./spt.service";

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
      return { items: sptService.saveAll(updated) };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      return { items: sptService.saveAll(updated) };
    });
  },
  remove: (id) => {
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (target?.nomor) {
        sptService.releaseNomor(
          target.nomor,
          `Nomor dilepas karena SPT berstatus ${target.status} dihapus oleh Administrator.`,
        );
      }
      const updated = state.items.filter((item) => item.id !== id);
      return { items: sptService.saveAll(updated) };
    });
  },
  generateNomor: (date) => {
    return sptService.generateNomor(date);
  },
}));
