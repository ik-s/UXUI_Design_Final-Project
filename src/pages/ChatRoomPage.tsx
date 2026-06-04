import { FormEvent, useState } from "react";
import { ArrowLeft, CheckCircle2, HeartHandshake, Send } from "lucide-react";
import { UserAvatar } from "../components/UserAvatar";
import type { Conversation } from "../types";

type ChatRoomPageProps = {
  conversation: Conversation;
  onBack: () => void;
  onCompleteHelp: (conversationId: string) => void;
  onRequestHelp: (conversationId: string) => void;
  onSendMessage: (conversationId: string, text: string) => void;
};

export function ChatRoomPage({
  conversation,
  onBack,
  onCompleteHelp,
  onRequestHelp,
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
          <span>{conversation.partner.statusEmoji || "🙂"}</span>
          <strong>{conversation.contextLabel || "부담 없이 도움을 이어가요"}</strong>
          <p>{helpStatusCopy[conversation.helpStatus]}</p>
        </div>
        <div className="chat-help-actions">
          <button
            disabled={conversation.helpStatus !== "idle"}
            onClick={() => onRequestHelp(conversation.id)}
          >
            <HeartHandshake size={17} />
            도움 요청
          </button>
          <button
            disabled={conversation.helpStatus === "completed"}
            onClick={() => onCompleteHelp(conversation.id)}
          >
            <CheckCircle2 size={17} />
            도움 완료
          </button>
        </div>
      </section>

      <section className="chat-message-list" aria-label="대화 메시지">
        {conversation.messages.filter(shouldShowMessage).map((chatMessage) => (
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
          placeholder="메시지를 입력하세요."
        />
        <button type="submit" aria-label="메시지 보내기">
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

function shouldShowMessage(message: Conversation["messages"][number]) {
  if (message.sender !== "partner") return true;

  return !/님과 대화를 시작했어요\.$/.test(message.text);
}

const helpStatusCopy: Record<Conversation["helpStatus"], string> = {
  completed: "도움이 완료되어 포인트와 활동 내역에 기록됐어요.",
  idle: "상황을 먼저 이야기한 뒤 도움 요청을 보낼 수 있어요.",
  requested: "도움 요청이 전송됐어요. 대화로 필요한 내용을 이어가세요.",
};

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
