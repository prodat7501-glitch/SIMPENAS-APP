import { create } from "zustand";
import { SBM } from "./sbm.schema";
import { sbmService } from "./sbm.service";

interface SbmState {
  items: SBM[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<SBM, "id">) => Promise<void>;
  update: (id: string, item: Omit<SBM, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSbmStore = create<SbmState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await sbmService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: sbmService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await sbmService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        sbmService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `s-${Date.now()}` }];
        sbmService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await sbmService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        sbmService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        sbmService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await sbmService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        sbmService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        sbmService.saveAll(updated);
        return { items: updated };
      });
    }
  },
}));

