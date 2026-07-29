import { useEffect } from "react";
import type { UserSession } from "@/stores/auth.store";
import { useActivityStore } from "@/stores/activity.store";
import { useDashboardStore } from "./dashboard.store";

export function useDashboard(user: UserSession | null) {
  const data = useDashboardStore((state) => state.data);
  const loading = useDashboardStore((state) => state.loading);
  const error = useDashboardStore((state) => state.error);
  const load = useDashboardStore((state) => state.load);
  const activities = useActivityStore((state) => state.items);

  useEffect(() => {
    if (user) void load(user, activities);
  }, [activities, load, user]);

  return {
    data,
    loading,
    error,
    refresh: () => (user ? load(user, activities) : Promise.resolve()),
  };
}

