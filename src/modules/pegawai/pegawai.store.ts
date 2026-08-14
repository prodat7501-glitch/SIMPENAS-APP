import { create } from "zustand";
import { Pegawai } from "./pegawai.schema";
import { pegawaiService } from "./pegawai.service";

interface PegawaiState {
  items: Pegawai[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<Pegawai, "id">) => Promise<void>;
  update: (id: string, item: Omit<Pegawai, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const usePegawaiStore = create<PegawaiState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await pegawaiService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: pegawaiService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await pegawaiService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `pg-${Date.now()}` }];
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await pegawaiService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await pegawaiService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        pegawaiService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  toggleStatus: async (id) => {
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (!target) return state;
      const newStatus = target.status === "Aktif" ? "Nonaktif" : "Aktif";
      void pegawaiService.apiUpdate(id, { status: newStatus });
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, status: newStatus as "Aktif" | "Nonaktif" } : item,
      );
      pegawaiService.saveAll(updated);
      return { items: updated };
    });
  },
}));

