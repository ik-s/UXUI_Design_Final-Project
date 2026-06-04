import { ArrowLeft, MessageCircle } from "lucide-react";
import { UserAvatar } from "../components/UserAvatar";
import type { Conversation } from "../types";

type ChatListPageProps = {
  conversations: Conversation[];
  onBack: () => void;
  onOpenConversation: (conversationId: string) => void;
};

export function ChatListPage({
  conversations,
  onBack,
  onOpenConversation,
}: ChatListPageProps) {
  const sortedConversations = [...conversations].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  return (
    <div className="chat-list-screen tab-screen">
      <header className="chat-page-top">
        <button aria-label="이전 화면으로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <strong>진행 중인 1:1 대화</strong>
          <span>도움이 필요할 때 이어서 이야기해요.</span>
        </div>
      </header>

      {sortedConversations.length > 0 ? (
        <section className="chat-thread-list">
          {sortedConversations.map((conversation) => (
            <button
              className="chat-thread-card"
              key={conversation.id}
              onClick={() => onOpenConversation(conversation.id)}
            >
              <UserAvatar size="small" />
              <div>
                <header>
                  <strong>{conversation.partner.name}</strong>
                  <time>{formatChatTime(conversation.lastMessageAt)}</time>
                </header>
                <p>{conversation.lastMessage}</p>
                <span>{sourceLabel[conversation.source]}</span>
              </div>
              {conversation.unreadCount > 0 && <em>{conversation.unreadCount}</em>}
            </button>
          ))}
        </section>
      ) : (
        <section className="chat-empty-state">
          <MessageCircle size={48} />
          <strong>진행 중인 대화가 없어요.</strong>
          <p>게시물, 친구 목록, 주변 이웃에서 대화하기를 누르면 여기에 표시돼요.</p>
        </section>
      )}
    </div>
  );
}

const sourceLabel: Record<Conversation["source"], string> = {
  community: "커뮤니티에서 시작",
  friend: "친구 목록에서 시작",
  home: "주변 이웃에서 시작",
};

function formatChatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}
