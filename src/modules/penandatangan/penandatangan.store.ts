import { create } from "zustand";
import { Penandatangan } from "./penandatangan.schema";
import { penandatanganService } from "./penandatangan.service";

interface PenandatanganState {
  items: Penandatangan[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: Omit<Penandatangan, "id">) => Promise<void>;
  update: (id: string, item: Omit<Penandatangan, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

export const usePenandatanganStore = create<PenandatanganState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await penandatanganService.apiGetAll();
      set({ items, isLoading: false });
    } catch {
      set({ items: penandatanganService.getAll(), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await penandatanganService.apiCreate(newItem);
      set((state) => {
        const updated = [...state.items, created];
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = [...state.items, { ...newItem, id: `pe-${Date.now()}` }];
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await penandatanganService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedData } : item,
        );
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item,
        );
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await penandatanganService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        penandatanganService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  toggleStatus: async (id) => {
    set((state) => {
      const target = state.items.find((item) => item.id === id);
      if (!target) return state;
      const newStatus = target.status === "Aktif" ? "Nonaktif" : "Aktif";
      void penandatanganService.apiUpdate(id, { status: newStatus });
      const updated = state.items.map((item) =>
        item.id === id ? { ...item, status: newStatus as "Aktif" | "Nonaktif" } : item,
      );
      penandatanganService.saveAll(updated);
      return { items: updated };
    });
  },
}));

