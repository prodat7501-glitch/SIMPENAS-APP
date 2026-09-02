import { create } from "zustand";
import { NotaDinas } from "./nota-dinas.schema";
import { notaDinasService } from "./nota-dinas.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

interface NotaDinasState {
  items: NotaDinas[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<NotaDinas, "id">) => Promise<void>;
  update: (id: string, item: Omit<NotaDinas, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  generateNomor: (date: string) => string;
}

export const useNotaDinasStore = create<NotaDinasState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await notaDinasService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: notaDinasService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await notaDinasService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        notaDinasService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `nd-${Date.now()}` } as NotaDinas];
        return { items: notaDinasService.saveAll(updated) };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updated = await notaDinasService.apiUpdate(id, updatedItem);
      set((state) => {
        const items = state.items.map((item) =>
          item.id === id ? { ...item, ...updated } : item,
        );
        notaDinasService.saveAll(items);
        return { items };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        return { items: notaDinasService.saveAll(updated) };
      });
    }
  },
  remove: async (id) => {
    try {
      await notaDinasService.apiDelete(id);
    } catch {
      // continue local remove
    }
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (target?.nomor) {
        penomoranService.releaseNumber(
          "Nota Dinas",
          target.nomor,
          "Nomor dilepas karena Nota Dinas telah dihapus.",
        );
      }
      const updated = state.items.filter((item) => item.id !== id);
      return { items: notaDinasService.saveAll(updated) };
    });
  },
  generateNomor: (date) => {
    return notaDinasService.generateNomor(date);
  },
}));
