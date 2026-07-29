import { create } from "zustand";
import type { ActivityItem } from "@/stores/activity.store";
import type { UserSession } from "@/stores/auth.store";
import { dashboardService } from "./dashboard.service";
import type { DashboardData } from "./dashboard.types";

interface DashboardState {
  userId: string | null;
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  load: (user: UserSession, activities: ActivityItem[]) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  userId: null,
  data: null,
  loading: false,
  error: null,
  load: async (user, activities) => {
    set((state) => ({
      userId: user.id,
      data: state.userId === user.id ? state.data : null,
      loading: true,
      error: null,
    }));
    try {
      const data = await dashboardService.getData(user, activities);
      set((state) =>
        state.userId === user.id ? { data, loading: false } : state,
      );
    } catch (error) {
      set((state) =>
        state.userId === user.id
          ? {
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Data Dashboard gagal dimuat.",
            }
          : state,
      );
    }
  },
}));
