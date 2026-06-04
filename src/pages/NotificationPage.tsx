import { ArrowLeft, Bell, CheckCheck, HeartHandshake, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import type { NotificationItem } from "../types";

type NotificationPageProps = {
  notifications: NotificationItem[];
  onBack: () => void;
  onMarkAllRead: () => void;
};

export function NotificationPage({
  notifications,
  onBack,
  onMarkAllRead,
}: NotificationPageProps) {
  return (
    <div className="notification-screen tab-screen">
      <header className="notification-top">
        <button aria-label="홈으로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <strong>알림</strong>
          <span>도움과 대화 흐름을 놓치지 않게 모아봤어요.</span>
        </div>
        <button aria-label="모두 읽음" onClick={onMarkAllRead}>
          <CheckCheck size={22} />
        </button>
      </header>

      {notifications.length > 0 ? (
        <section className="notification-list">
          {notifications.map((notification) => {
            const Icon = notificationIcon[notification.type];

            return (
              <article
                className={`notification-card${notification.read ? "" : " unread"}`}
                key={notification.id}
              >
                <span>
                  <Icon size={20} />
                </span>
                <div>
                  <header>
                    <strong>{notification.title}</strong>
                    <time>{formatNotificationTime(notification.createdAt)}</time>
                  </header>
                  <p>{notification.body}</p>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="notification-empty-state">
          <Bell size={48} />
          <strong>아직 새 알림이 없어요.</strong>
          <p>상태 변경, 친구 추가, 도움 완료 같은 활동이 생기면 여기에 표시돼요.</p>
        </section>
      )}
    </div>
  );
}

const notificationIcon = {
  chat: MessageCircle,
  friend: UserPlus,
  help: HeartHandshake,
  point: Sparkles,
  status: Bell,
};

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}
