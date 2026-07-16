import { create } from "zustand";
import { Pegawai } from "./pegawai.schema";
import { pegawaiService } from "./pegawai.service";

interface PegawaiState {
  items: Pegawai[];
  load: () => void;
  add: (item: Omit<Pegawai, "id">) => void;
  update: (id: string, item: Omit<Pegawai, "id">) => void;
  remove: (id: string) => void;
  toggleStatus: (id: string) => void;
}

export const usePegawaiStore = create<PegawaiState>((set) => ({
  items: [],
  load: () => {
    set({ items: pegawaiService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `pg-${Date.now()}` }];
      pegawaiService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      pegawaiService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      pegawaiService.saveAll(updated);
      return { items: updated };
    });
  },
  toggleStatus: (id) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              status: (item.status === "Aktif" ? "Nonaktif" : "Aktif") as
                "Aktif" | "Nonaktif",
            }
          : item,
      );
      pegawaiService.saveAll(updated);
      return { items: updated };
    });
  },
}));
