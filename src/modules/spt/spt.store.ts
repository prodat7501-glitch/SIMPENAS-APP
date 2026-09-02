import { create } from "zustand";
import { Spt } from "./spt.schema";
import { sptService } from "./spt.service";

interface SptState {
  items: Spt[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<Spt, "id">) => Promise<void>;
  update: (id: string, item: Omit<Spt, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  generateNomor: (date: string) => string;
}

export const useSptStore = create<SptState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await sptService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: sptService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await sptService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        sptService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `st-${Date.now()}` } as Spt];
        return { items: sptService.saveAll(updated) };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updated = await sptService.apiUpdate(id, updatedItem);
      set((state) => {
        const items = state.items.map((item) =>
          item.id === id ? { ...item, ...updated } : item,
        );
        sptService.saveAll(items);
        return { items };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        return { items: sptService.saveAll(updated) };
      });
    }
  },
  remove: async (id) => {
    try {
      await sptService.apiDelete(id);
    } catch {
      // continue local remove
    }
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
