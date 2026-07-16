import { create } from "zustand";
import { Pangkat } from "./pangkat.schema";
import { pangkatService } from "./pangkat.service";

interface PangkatState {
  items: Pangkat[];
  load: () => void;
  add: (item: Omit<Pangkat, "id">) => void;
  update: (id: string, item: Omit<Pangkat, "id">) => void;
  remove: (id: string) => void;
}

export const usePangkatStore = create<PangkatState>((set) => ({
  items: [],
  load: () => {
    set({ items: pangkatService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `p-${Date.now()}` }];
      pangkatService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      pangkatService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      pangkatService.saveAll(updated);
      return { items: updated };
    });
  },
}));
