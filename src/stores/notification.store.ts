import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  addNotification: (
    title: string,
    message: string,
    type?: NotificationItem["type"],
    metadata?: NotificationMetadata,
  ) => void;
  upsertNotification: (input: NotificationUpsertInput) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (recipientPegawaiId?: string) => void;
  removeNotification: (id: string) => void;
  clearAll: (recipientPegawaiId?: string) => void;
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
    (set) => ({
      notifications: seedNotifications,
      unreadCount: countUnread(seedNotifications),
      addNotification: (title, message, type = "info", metadata = {}) =>
        set((state) => {
          const newNotif: NotificationItem = {
            id: createNotificationId(),
            title,
            message,
            type,
            read: false,
            createdAt: new Date(),
            ...metadata,
          };
          const updated = [newNotif, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
          };
        }),
      upsertNotification: ({
        title,
        message,
        type = "info",
        recipientPegawaiId,
        eventKey,
        actionUrl,
      }) =>
        set((state) => {
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
            return {
              notifications: updated,
              unreadCount: countUnread(updated),
            };
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
      markAllAsRead: (recipientPegawaiId) =>
        set((state) => {
          const updated = state.notifications.map((notification) =>
            isNotificationInRecipientScope(notification, recipientPegawaiId)
              ? { ...notification, read: true }
              : notification,
          );
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
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
      clearAll: (recipientPegawaiId) =>
        set((state) => {
          const updated = recipientPegawaiId
            ? state.notifications.filter(
                (notification) =>
                  !isNotificationInRecipientScope(
                    notification,
                    recipientPegawaiId,
                  ),
              )
            : state.notifications.filter(
                (notification) => notification.recipientPegawaiId,
              );
          return {
            notifications: updated,
            unreadCount: countUnread(updated),
          };
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
