import { create } from "zustand";
import {
  createDipaRecord,
  type DIPA,
  type DipaFormData,
} from "./dipa.schema";
import { deduplicateDipa, dipaService } from "./dipa.service";

interface DipaState {
  items: DIPA[];
  isLoading: boolean;
  load: () => Promise<void>;
  add: (item: DipaFormData) => Promise<void>;
  update: (id: string, item: DipaFormData) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useDipaStore = create<DipaState>((set) => ({
  items: [],
  isLoading: false,
  load: async () => {
    set({ isLoading: true });
    try {
      const items = await dipaService.apiGetAll();
      set({ items: deduplicateDipa(items), isLoading: false });
    } catch {
      set({ items: deduplicateDipa(dipaService.getAll()), isLoading: false });
    }
  },
  add: async (newItem) => {
    try {
      const created = await dipaService.apiCreate(newItem);
      set((state) => {
        const updated = deduplicateDipa([...state.items, created]);
        dipaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = deduplicateDipa([
          ...state.items,
          createDipaRecord(newItem, `d-${Date.now()}`),
        ]);
        dipaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  update: async (id, updatedItem) => {
    try {
      const updatedData = await dipaService.apiUpdate(id, updatedItem);
      set((state) => {
        const updated = deduplicateDipa(
          state.items.map((item) =>
            item.id === id ? { ...item, ...updatedData } : item,
          ),
        );
        dipaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = deduplicateDipa(
          state.items.map((item) =>
            item.id === id ? createDipaRecord(updatedItem, id) : item,
          ),
        );
        dipaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
  remove: async (id) => {
    try {
      await dipaService.apiDelete(id);
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        dipaService.saveAll(updated);
        return { items: updated };
      });
    } catch {
      set((state) => {
        const updated = state.items.filter((item) => item.id !== id);
        dipaService.saveAll(updated);
        return { items: updated };
      });
    }
  },
}));

