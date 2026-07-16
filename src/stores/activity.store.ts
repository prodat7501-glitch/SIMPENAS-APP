import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  add: (item: Omit<ActivityItem, "id" | "createdAt">) => void;
  clear: () => void;
}
export const useActivityStore = create<State>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((state) => ({
          items: [
            {
              ...item,
              id: `log-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...state.items,
          ],
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "simpenas-activity-log" },
  ),
);
