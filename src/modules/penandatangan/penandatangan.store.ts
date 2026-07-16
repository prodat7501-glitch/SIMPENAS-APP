import { create } from "zustand";
import { Penandatangan } from "./penandatangan.schema";
import { penandatanganService } from "./penandatangan.service";

interface PenandatanganState {
  items: Penandatangan[];
  load: () => void;
  add: (item: Omit<Penandatangan, "id">) => void;
  update: (id: string, item: Omit<Penandatangan, "id">) => void;
  remove: (id: string) => void;
  toggleStatus: (id: string) => void;
}

export const usePenandatanganStore = create<PenandatanganState>((set) => ({
  items: [],
  load: () => {
    set({ items: penandatanganService.getAll() });
  },
  add: (newItem) => {
    set((state) => {
      const updated = [...state.items, { ...newItem, id: `pe-${Date.now()}` }];
      penandatanganService.saveAll(updated);
      return { items: updated };
    });
  },
  update: (id, updatedItem) => {
    set((state) => {
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item,
      );
      penandatanganService.saveAll(updated);
      return { items: updated };
    });
  },
  remove: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      penandatanganService.saveAll(updated);
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
      penandatanganService.saveAll(updated);
      return { items: updated };
    });
  },
}));
