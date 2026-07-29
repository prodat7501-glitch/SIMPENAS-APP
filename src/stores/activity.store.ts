import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserRole } from "./auth.store";
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
  clear: (role: UserRole, user: string) => number;
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
      add: (item) =>
        set((state) => ({
          items: [createActivity(item), ...state.items],
        })),
      clear: (role, user) => {
        if (role !== "Administrator") {
          throw new Error(
            "Hanya Administrator yang dapat membersihkan Log Aktivitas.",
          );
        }
        const total = get().items.length;
        set({
          items: [
            createActivity({
              action: "Delete",
              module: "Log Aktivitas",
              description: `Membersihkan ${total} entri Log Aktivitas`,
              user,
            }),
          ],
        });
        return total;
      },
    }),
    { name: "simpenas-activity-log" },
  ),
);
