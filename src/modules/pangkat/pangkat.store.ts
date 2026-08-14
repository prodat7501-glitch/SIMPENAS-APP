import { create } from "zustand";
import { Pangkat } from "./pangkat.schema";
import { pangkatService } from "./pangkat.service";

interface PangkatState {
  items: Pangkat[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<Pangkat, "id">) => Promise<void>;
  update: (id: string, item: Omit<Pangkat, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const usePangkatStore = create<PangkatState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await pangkatService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: pangkatService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await pangkatService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `p-${Date.now()}` }];
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await pangkatService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await pangkatService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        pangkatService.saveAll(updated);
        return { items: updated };
      });
    }
  },
}));

