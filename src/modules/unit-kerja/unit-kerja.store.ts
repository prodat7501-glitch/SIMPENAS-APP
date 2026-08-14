import { create } from "zustand";
import { UnitKerja } from "./unit-kerja.schema";
import { unitKerjaService } from "./unit-kerja.service";

interface UnitKerjaState {
  items: UnitKerja[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<UnitKerja, "id">) => Promise<void>;
  update: (id: string, item: Omit<UnitKerja, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useUnitKerjaStore = create<UnitKerjaState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await unitKerjaService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: unitKerjaService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await unitKerjaService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `u-${Date.now()}` }];
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await unitKerjaService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await unitKerjaService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        unitKerjaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
}));

