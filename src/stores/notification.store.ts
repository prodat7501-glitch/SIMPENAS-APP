import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, withApiFallback } from "@/services/api";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: Date;
  recipientPegawaiId?: string;
  eventKey?: string;
  actionUrl?: string;
}

export interface NotificationMetadata {
  recipientPegawaiId?: string;
  eventKey?: string;
  actionUrl?: string;
}

export interface NotificationUpsertInput extends NotificationMetadata {
  title: string;
  message: string;
  type?: NotificationItem["type"];
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  load: () => Promise<void>;
  addNotification: (
    title: string,
    message: string,
    type?: NotificationItem["type"],
    metadata?: NotificationMetadata,
  ) => Promise<void>;
  upsertNotification: (input: NotificationUpsertInput) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (recipientPegawaiId?: string) => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  clearAll: (recipientPegawaiId?: string) => Promise<void>;
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

export const isNotificationVisibleFor = (
  notification: NotificationItem,
  recipientPegawaiId?: string,
) =>
  !notification.recipientPegawaiId ||
  notification.recipientPegawaiId === recipientPegawaiId;

const isNotificationInRecipientScope = (
  notification: NotificationItem,
  recipientPegawaiId?: string,
) =>
  recipientPegawaiId
    ? isNotificationVisibleFor(notification, recipientPegawaiId)
    : !notification.recipientPegawaiId;

const createNotificationId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `notif-${crypto.randomUUID()}`;
  }

  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const reviveNotifications = (notifications: NotificationItem[]) =>
  notifications.map((item) => ({
    ...item,
    createdAt: new Date(item.createdAt),
  }));

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: seedNotifications,
      unreadCount: countUnread(seedNotifications),
      load: async () => {
        const loaded = await withApiFallback(
          async () => {
            const res = await apiClient.get<NotificationItem[] | { data?: NotificationItem[]; items?: NotificationItem[] }>("/api/v1/notifikasi");
            const list = Array.isArray(res) ? res : res.data || res.items || [];
            return list.length > 0 ? reviveNotifications(list) : get().notifications;
          },
          () => get().notifications
        );
        set({
          notifications: loaded,
          unreadCount: countUnread(loaded),
        });
      },
      addNotification: async (title, message, type = "info", metadata = {}) => {
        const newNotif: NotificationItem = {
          id: createNotificationId(),
          title,
          message,
          type,
          read: false,
          createdAt: new Date(),
          ...metadata,
        };
        const updated = [newNotif, ...get().notifications];
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
        await withApiFallback(
          async () => {
            await apiClient.post("/api/v1/notifikasi", newNotif);
            return newNotif;
          },
          () => newNotif
        );
      },
      upsertNotification: async ({
        title,
        message,
        type = "info",
        recipientPegawaiId,
        eventKey,
        actionUrl,
      }) => {
        const state = get();
        const existingIndex = eventKey
          ? state.notifications.findIndex(
              (item) =>
                item.eventKey === eventKey &&
                item.recipientPegawaiId === recipientPegawaiId,
            )
          : -1;

        if (existingIndex >= 0) {
          const updated = state.notifications.map((item, index) =>
            index === existingIndex
              ? {
                  ...item,
                  title,
                  message,
                  type,
                  recipientPegawaiId,
                  eventKey,
                  actionUrl,
                }
              : item,
          );
          set({
            notifications: updated,
            unreadCount: countUnread(updated),
          });
          const target = updated[existingIndex];
          if (target) {
            await withApiFallback(
              async () => {
                await apiClient.put(`/api/v1/notifikasi/${target.id}`, target);
                return target;
              },
              () => target
            );
          }
          return;
        }

        const newNotif: NotificationItem = {
          id: createNotificationId(),
          title,
          message,
          type,
          read: false,
          createdAt: new Date(),
          recipientPegawaiId,
          eventKey,
          actionUrl,
        };
        const updated = [newNotif, ...state.notifications].slice(0, 200);
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
        await withApiFallback(
          async () => {
            await apiClient.post("/api/v1/notifikasi", newNotif);
            return newNotif;
          },
          () => newNotif
        );
      },
      markAsRead: async (id) => {
        const updated = get().notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n,
        );
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
        await withApiFallback(
          async () => {
            await apiClient.put(`/api/v1/notifikasi/${id}`, { read: true });
            return true;
          },
          () => true
        );
      },
      markAllAsRead: async (recipientPegawaiId) => {
        const updated = get().notifications.map((notification) =>
          isNotificationInRecipientScope(notification, recipientPegawaiId)
            ? { ...notification, read: true }
            : notification,
        );
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
      },
      removeNotification: async (id) => {
        const updated = get().notifications.filter((item) => item.id !== id);
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
        await withApiFallback(
          async () => {
            await apiClient.delete(`/api/v1/notifikasi/${id}`);
            return true;
          },
          () => true
        );
      },
      clearAll: async (recipientPegawaiId) => {
        const updated = recipientPegawaiId
          ? get().notifications.filter(
              (notification) =>
                !isNotificationInRecipientScope(
                  notification,
                  recipientPegawaiId,
                ),
            )
          : get().notifications.filter(
              (notification) => notification.recipientPegawaiId,
            );
        set({
          notifications: updated,
          unreadCount: countUnread(updated),
        });
      },
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
