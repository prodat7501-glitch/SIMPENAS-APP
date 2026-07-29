import { create } from "zustand";
import { NotaDinas } from "./nota-dinas.schema";
import { notaDinasService } from "./nota-dinas.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

interface NotaDinasState {
  items: NotaDinas[];
  load: () => void;
  add: (item: Omit<NotaDinas, "id">) => void;
  update: (id: string, item: Omit<NotaDinas, "id">) => void;
  remove: (id: string) => void;
  generateNomor: (date: string) => string;
}

export const useNotaDinasStore = create<NotaDinasState>((set) => ({
  items: [],
  load: () => {
    set({ items: notaDinasService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `nd-${Date.now()}` }];
      return { items: notaDinasService.saveAll(updated) };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      return { items: notaDinasService.saveAll(updated) };
    });
  },
  remove: (id) => {
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
