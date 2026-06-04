import type {
  ChatMessage,
  Conversation,
  ConversationPartner,
  ConversationSource,
} from "../types";
import { useLocalStorageState } from "./useLocalStorageState";

const CONVERSATION_KEY = "mojiday:conversations";

type ConversationStartResult = {
  conversationId: string;
  created: boolean;
};

export function useConversations() {
  const [conversations, setConversations] = useLocalStorageState<Conversation[]>(
    CONVERSATION_KEY,
    [],
  );

  const startConversation = (
    partner: ConversationPartner,
    source: ConversationSource,
    contextLabel?: string,
    seedMessage?: string,
  ): ConversationStartResult => {
    const existing = conversations.find((conversation) => conversation.partner.id === partner.id);

    if (existing) {
      setConversations((currentConversations) =>
        currentConversations.map((conversation) =>
          conversation.id === existing.id
            ? {
                ...conversation,
                contextLabel: contextLabel ?? conversation.contextLabel,
                unreadCount: 0,
            }
            : conversation,
        ),
      );
      return { conversationId: existing.id, created: false };
    }

    const now = new Date().toISOString();
    const introMessage = createMessage(
      "system",
      `${partner.name}님과 1:1 대화가 시작됐어요. 필요한 도움을 편하게 이야기해보세요.`,
      now,
    );
    const firstPartnerMessage = seedMessage
      ? createMessage("partner", seedMessage, now)
      : undefined;
    const messages = firstPartnerMessage ? [introMessage, firstPartnerMessage] : [introMessage];
    const newConversation: Conversation = {
      contextLabel,
      helpStatus: "idle",
      id: `conversation-${Date.now()}-${partner.id}`,
      lastMessage: messages[messages.length - 1].text,
      lastMessageAt: now,
      messages,
      partner,
      source,
      unreadCount: 0,
    };

    setConversations((currentConversations) => [newConversation, ...currentConversations]);

    return { conversationId: newConversation.id, created: true };
  };

  const sendMessage = (conversationId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setConversations((currentConversations) =>
      currentConversations.map((conversation) => {
        if (conversation.id !== conversationId) return conversation;

        const message = createMessage("me", trimmed);
        return {
          ...conversation,
          lastMessage: trimmed,
          lastMessageAt: message.createdAt,
          messages: [...conversation.messages, message],
        };
      }),
    );
  };

  const requestHelp = (conversationId: string) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) => {
        if (conversation.id !== conversationId || conversation.helpStatus !== "idle") {
          return conversation;
        }

        const message = createMessage(
          "system",
          "도움 요청을 보냈어요. 상대가 부담 없이 확인할 수 있도록 대화로 상황을 남겨주세요.",
        );

        return {
          ...conversation,
          helpStatus: "requested",
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          messages: [...conversation.messages, message],
        };
      }),
    );
  };

  const completeHelp = (conversationId: string) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) => {
        if (conversation.id !== conversationId || conversation.helpStatus === "completed") {
          return conversation;
        }

        const message = createMessage(
          "system",
          "도움이 완료됐어요. 작은 도움이 포인트와 도움 온도로 기록됩니다.",
        );

        return {
          ...conversation,
          helpStatus: "completed",
          lastMessage: message.text,
          lastMessageAt: message.createdAt,
          messages: [...conversation.messages, message],
        };
      }),
    );
  };

  const markConversationRead = (conversationId: string) => {
    setConversations((currentConversations) =>
      currentConversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      ),
    );
  };

  return {
    completeHelp,
    conversations,
    markConversationRead,
    requestHelp,
    sendMessage,
    startConversation,
  };
}

function createMessage(
  sender: ChatMessage["sender"],
  text: string,
  createdAt = new Date().toISOString(),
): ChatMessage {
  return {
    createdAt,
    id: `message-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    sender,
    text,
  };
}
