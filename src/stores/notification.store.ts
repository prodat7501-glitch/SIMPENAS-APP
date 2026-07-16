import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    title: string,
    message: string,
    type?: NotificationItem["type"],
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const seedNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "SPT Baru Diterbitkan",
    message:
      "SPT Nomor SPT/04/2026 telah dibuat dan siap untuk proses approval.",
    type: "info",
    read: false,
    createdAt: new Date(),
  },
  {
    id: "notif-2",
    title: "SBM Update",
    message:
      "Master Standar Biaya Masukan Akun Perjalanan Dinas telah diperbarui.",
    type: "success",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

const countUnread = (notifications: NotificationItem[]) =>
  notifications.filter((item) => !item.read).length;

const reviveNotifications = (notifications: NotificationItem[]) =>
  notifications.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: seedNotifications,
      unreadCount: countUnread(seedNotifications),
      addNotification: (title, message, type = "info") =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title,
            message,
            type,
            read: false,
            createdAt: new Date(),
          };
          const updated = [newNotif, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
          };
        }),
      markAsRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          );
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
          };
        }),
      markAllAsRead: () =>
        set((state) => {
          const updated = state.notifications.map((n) => ({
            ...n,
            read: true,
          }));
          return {
            notifications: updated,
            unreadCount: 0,
          };
        }),
      removeNotification: (id) =>
        set((state) => {
          const updated = state.notifications.filter((item) => item.id !== id);
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
          };
        }),
      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),
    }),
    {
      name: "simpenas-notifications",
      merge: (persisted, current) => {
        const saved = persisted as Partial<NotificationState>;
        const notifications = saved.notifications?.length
          ? reviveNotifications(saved.notifications)
          : current.notifications;

        return {
          ...current,
          ...saved,
          notifications,
          unreadCount: countUnread(notifications),
        };
      },
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    },
  ),
);
