import { create } from "zustand";
import { DIPA } from "./dipa.schema";
import { dipaService } from "./dipa.service";

interface DipaState {
  items: DIPA[];
  load: () => void;
  add: (item: Omit<DIPA, "id">) => void;
  update: (id: string, item: Omit<DIPA, "id">) => void;
  remove: (id: string) => void;
}

export const useDipaStore = create<DipaState>((set) => ({
  items: [],
  load: () => {
    set({ items: dipaService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `d-${Date.now()}` }];
      dipaService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      dipaService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      dipaService.saveAll(updated);
      return { items: updated };
    });
  },
}));
