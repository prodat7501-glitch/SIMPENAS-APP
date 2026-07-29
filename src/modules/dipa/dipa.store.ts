import { create } from "zustand";
import {
  createDipaRecord,
  type DIPA,
  type DipaFormData,
} from "./dipa.schema";
import { dipaService } from "./dipa.service";

interface DipaState {
  items: DIPA[];
  load: () => void;
  add: (item: DipaFormData) => void;
  update: (id: string, item: DipaFormData) => void;
  remove: (id: string) => void;
}

export const useDipaStore = create<DipaState>((set) => ({
  items: [],
  load: () => {
    set({ items: dipaService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [
        ...state.items,
        createDipaRecord(newItem, `d-${Date.now()}`),
      ];
      dipaService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? createDipaRecord(updatedItem, id) : item,
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
