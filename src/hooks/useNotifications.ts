import { defaultNotifications } from "../data/appData";
import type { NotificationItem } from "../types";
import { useLocalStorageState } from "./useLocalStorageState";

const NOTIFICATION_KEY = "mojiday:notifications";

type NotificationInput = Pick<NotificationItem, "body" | "title" | "type">;

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorageState<NotificationItem[]>(
    NOTIFICATION_KEY,
    defaultNotifications,
  );

  const addNotification = ({ body, title, type }: NotificationInput) => {
    const nextNotification: NotificationItem = {
      body,
      createdAt: new Date().toISOString(),
      id: `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      read: false,
      title,
      type,
    };

    setNotifications((currentNotifications) =>
      [nextNotification, ...currentNotifications].slice(0, 20),
    );
  };

  const markAllRead = () => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  };

  return {
    addNotification,
    markAllRead,
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read).length,
  };
}
