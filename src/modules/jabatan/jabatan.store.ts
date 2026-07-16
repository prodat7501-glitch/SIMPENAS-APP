import { create } from "zustand";
import { Jabatan } from "./jabatan.schema";
import { jabatanService } from "./jabatan.service";

interface JabatanState {
  items: Jabatan[];
  load: () => void;
  add: (item: Omit<Jabatan, "id">) => void;
  update: (id: string, item: Omit<Jabatan, "id">) => void;
  remove: (id: string) => void;
}

export const useJabatanStore = create<JabatanState>((set) => ({
  items: [],
  load: () => {
    set({ items: jabatanService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `j-${Date.now()}` }];
      jabatanService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      jabatanService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      jabatanService.saveAll(updated);
      return { items: updated };
    });
  },
}));
