import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "./auth.store";
import { apiClient, withApiFallback } from "@/services/api";

export type ActivityAction =
  | "Login"
  | "Logout"
  | "Create"
  | "Update"
  | "Delete"
  | "Approval"
  | "Generate"
  | "Print"
  | "Export";

export interface ActivityItem {
  id: string;
  action: ActivityAction;
  module: string;
  description: string;
  user: string;
  createdAt: string;
}

interface State {
  items: ActivityItem[];
  load: () => Promise<void>;
  add: (item: Omit<ActivityItem, "id" | "createdAt">) => Promise<void>;
  clear: (role: UserRole, user: string) => Promise<number>;
}

const createActivityId = () =>
  `log-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;

const createActivity = (
  item: Omit<ActivityItem, "id" | "createdAt">,
): ActivityItem => ({
  ...item,
  id: createActivityId(),
  createdAt: new Date().toISOString(),
});

export const useActivityStore = create<State>()(
  persist(
    (set, get) => ({
      items: [],
      load: async () => {
        const items = await withApiFallback(
          async () => {
            const res = await apiClient.get<ActivityItem[] | { data?: ActivityItem[]; items?: ActivityItem[] }>("/api/v1/log-aktivitas");
            const list = Array.isArray(res) ? res : res.data || res.items || [];
            return list.length > 0 ? list : get().items;
          },
          () => get().items,
        );
        set({ items });
      },
      add: async (item) => {
        const newItem = createActivity(item);
        set((state) => ({
          items: [newItem, ...state.items],
        }));
        await withApiFallback(
          async () => {
            await apiClient.post("/api/v1/log-aktivitas", newItem);
            return newItem;
          },
          () => newItem,
        );
      },
      clear: async (role, user) => {
        if (role !== "Administrator") {
          throw new Error(
            "Hanya Administrator yang dapat membersihkan Log Aktivitas.",
          );
        }
        const total = get().items.length;
        const clearItem = createActivity({
          action: "Delete",
          module: "Log Aktivitas",
          description: `Membersihkan ${total} entri Log Aktivitas`,
          user,
        });
        set({
          items: [clearItem],
        });
        await withApiFallback(
          async () => {
            await apiClient.post("/api/v1/log-aktivitas", clearItem);
            return total;
          },
          () => total,
        );
        return total;
      },
    }),
    { name: "simpenas-activity-log" },
  ),
);
