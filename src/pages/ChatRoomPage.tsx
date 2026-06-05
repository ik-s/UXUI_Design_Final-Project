import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { UserAvatar } from "../components/UserAvatar";
import type { Conversation } from "../types";

type ChatRoomPageProps = {
  conversation: Conversation;
  onBack: () => void;
  onCompleteHelp: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
};

export function ChatRoomPage({
  conversation,
  onBack,
  onCompleteHelp,
  onSendMessage,
}: ChatRoomPageProps) {
  const [message, setMessage] = useState("");

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    onSendMessage(conversation.id, trimmed);
    setMessage("");
  };

  const helpActionLabel = getHelpActionLabel(conversation);
  const isHelpCompleted = conversation.helpStatus === "completed";

  return (
    <div className="chat-room-screen tab-screen">
      <header className="chat-room-top">
        <button aria-label="대화 목록으로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <UserAvatar size="small" />
        <div>
          <strong>{conversation.partner.name}</strong>
          <span>{conversation.partner.statusLabel || conversation.contextLabel || "1:1 대화"}</span>
        </div>
      </header>

      <section className="chat-context-card">
        <div>
          <span>{conversation.partner.statusEmoji || "💬"}</span>
          <div>
            <strong>{conversation.contextLabel || "부담 없이 도움을 이어가요"}</strong>
            <p>{helpStatusCopy[conversation.helpStatus]}</p>
          </div>
        </div>
        <div className="chat-help-actions">
          <button
            className="help-completion-button"
            disabled={isHelpCompleted}
            onClick={() => onCompleteHelp(conversation.id)}
          >
            <CheckCircle2 size={17} />
            {helpActionLabel}
          </button>
        </div>
      </section>

      <section className="chat-message-list" aria-label="대화 메시지">
        {conversation.messages.map((chatMessage) => (
          <article className={`chat-message chat-message-${chatMessage.sender}`} key={chatMessage.id}>
            <p>{chatMessage.text}</p>
            {chatMessage.sender !== "system" && <time>{formatMessageTime(chatMessage.createdAt)}</time>}
          </article>
        ))}
      </section>

      <form className="chat-composer" onSubmit={submitMessage}>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit" aria-label="메시지 보내기">
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

const helpStatusCopy: Record<Conversation["helpStatus"], string> = {
  completed: "도움이 완료되어 포인트와 도움 온도 기록에 반영됐어요.",
  completionPending: "내가 도움 완료를 보냈어요. 이제 상대 확인을 기다리는 중이에요.",
  idle: "대화로 필요한 도움을 주고받은 뒤 완료만 기록하면 돼요.",
  requested: "이전 도움 요청 대화예요. 도움을 마쳤다면 완료를 눌러 상대 확인으로 넘겨주세요.",
};

function getHelpActionLabel(conversation: Conversation) {
  if (conversation.helpStatus === "completionPending") {
    return `${conversation.partner.name} 확인 완료`;
  }

  if (conversation.helpStatus === "completed") return "도움 완료됨";

  return "도움 완료";
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
