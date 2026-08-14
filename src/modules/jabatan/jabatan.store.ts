import { create } from "zustand";
import { Jabatan } from "./jabatan.schema";
import { jabatanService } from "./jabatan.service";

interface JabatanState {
  items: Jabatan[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<Jabatan, "id">) => Promise<void>;
  update: (id: string, item: Omit<Jabatan, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useJabatanStore = create<JabatanState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await jabatanService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: jabatanService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await jabatanService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `j-${Date.now()}` }];
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await jabatanService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await jabatanService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        jabatanService.saveAll(updated);
        return { items: updated };
      });
    }
  },
}));

