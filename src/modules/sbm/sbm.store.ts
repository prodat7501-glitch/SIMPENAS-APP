import { create } from "zustand";
import { SBM } from "./sbm.schema";
import { sbmService } from "./sbm.service";

interface SbmState {
  items: SBM[];
  load: () => void;
  add: (item: Omit<SBM, "id">) => void;
  update: (id: string, item: Omit<SBM, "id">) => void;
  remove: (id: string) => void;
}

export const useSbmStore = create<SbmState>((set) => ({
  items: [],
  load: () => {
    set({ items: sbmService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `s-${Date.now()}` }];
      sbmService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      sbmService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      sbmService.saveAll(updated);
      return { items: updated };
    });
  },
}));
