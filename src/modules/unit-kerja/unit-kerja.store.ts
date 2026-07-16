import { create } from "zustand";
import { UnitKerja } from "./unit-kerja.schema";
import { unitKerjaService } from "./unit-kerja.service";

interface UnitKerjaState {
  items: UnitKerja[];
  load: () => void;
  add: (item: Omit<UnitKerja, "id">) => void;
  update: (id: string, item: Omit<UnitKerja, "id">) => void;
  remove: (id: string) => void;
}

export const useUnitKerjaStore = create<UnitKerjaState>((set) => ({
  items: [],
  load: () => {
    set({ items: unitKerjaService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `u-${Date.now()}` }];
      unitKerjaService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      unitKerjaService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      unitKerjaService.saveAll(updated);
      return { items: updated };
    });
  },
}));
