import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomTabs } from "./components/BottomTabs";
import { onboardingOrder, statusHistorySeed } from "./data/appData";
import { useConversations } from "./hooks/useConversations";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useNotifications } from "./hooks/useNotifications";
import { ChatListPage } from "./pages/ChatListPage";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { CommunityPage } from "./pages/CommunityPage";
import { GuidePage } from "./pages/GuidePage";
import { HomePage } from "./pages/HomePage";
import { LocationPage } from "./pages/LocationPage";
import { MapPage } from "./pages/MapPage";
import { NotificationPage } from "./pages/NotificationPage";
import { PhonePage } from "./pages/PhonePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProfileSetupPage } from "./pages/ProfileSetupPage";
import { StartPage } from "./pages/StartPage";
import { grantHelpCompletionReward, grantStatusCheckInReward } from "./utils/activityStorage";
import type {
  ConversationPartner,
  ConversationSource,
  ProfileView,
  Screen,
  StatusHistoryItem,
} from "./types";

const screensWithBack: Screen[] = ["location", "phone", "profileSetup", "guide"];

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [nickname, setNickname] = useLocalStorageState("mojiday:nickname", "");
  const [phone, setPhone] = useLocalStorageState("mojiday:phone", "");
  const [neighborhood, setNeighborhood] = useLocalStorageState("mojiday:neighborhood", "");
  const [profileImage, setProfileImage] = useLocalStorageState("mojiday:profileImage", "");
  const [statusEmoji, setStatusEmoji] = useLocalStorageState("mojiday:statusEmoji", "😟");
  const [statusLabel, setStatusLabel] = useLocalStorageState("mojiday:statusLabel", "조금 불안해요");
  const [statusMessage, setStatusMessage] = useLocalStorageState(
    "mojiday:statusMessage",
    "누군가 알고만 있어도 안심될 것 같아요.",
  );
  const [statusHistory, setStatusHistory] = useLocalStorageState<StatusHistoryItem[]>(
    "mojiday:statusHistory",
    statusHistorySeed,
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatReturnScreen, setChatReturnScreen] = useState<Screen>("chatList");
  const [profileView, setProfileView] = useState<ProfileView>("profile");
  const {
    completeHelp,
    conversations,
    markConversationRead,
    sendMessage,
    startConversation,
  } = useConversations();
  const { addNotification, markAllRead, notifications } = useNotifications();

  const canGoBack = screensWithBack.includes(screen);
  const todayKey = getTodayKey();
  const hasStatusEntryToday = statusHistory.some((item) => item.date === todayKey);

  const goNext = () => {
    const currentIndex = onboardingOrder.indexOf(screen);
    if (currentIndex >= 0) {
      setScreen(onboardingOrder[currentIndex + 1] ?? "home");
    }
  };

  const goBack = () => {
    const currentIndex = onboardingOrder.indexOf(screen);
    if (currentIndex > 0) setScreen(onboardingOrder[currentIndex - 1]);
  };

  const openConversation = (
    partner: ConversationPartner,
    source: ConversationSource,
    contextLabel?: string,
    seedMessage?: string,
    returnScreen: Screen = "chatList",
  ) => {
    const result = startConversation(partner, source, contextLabel, seedMessage);
    setActiveConversationId(result.conversationId);
    setChatReturnScreen(returnScreen);
    if (!result.created) {
      markConversationRead(result.conversationId);
    }
    setScreen("chatRoom");

    if (result.created) {
      addNotification({
        body: `${partner.name}님과 도움을 이어갈 수 있는 대화방이 열렸어요.`,
        title: "1:1 대화가 시작됐어요",
        type: "chat",
      });
    }
  };

  const openConversationById = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setChatReturnScreen("chatList");
    markConversationRead(conversationId);
    setScreen("chatRoom");
  };

  const completeConversationHelp = (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (!conversation || conversation.helpStatus === "completed") return;

    const shouldGrantReward = conversation.helpStatus === "completionPending";
    completeHelp(conversationId);

    if (shouldGrantReward) {
      grantHelpCompletionReward(conversation.partner.name);
      addNotification({
        body: `${conversation.partner.name}님과의 도움 완료가 확인되어 10P가 적립됐어요.`,
        title: "도움 완료가 기록됐어요",
        type: "help",
      });
      return;
    }

    addNotification({
      body: `${conversation.partner.name}님 확인이 끝나면 포인트와 도움 온도에 기록돼요.`,
      title: "상대 확인을 기다리고 있어요",
      type: "help",
    });
  };

  const saveStatus = (emoji: string, label: string, message: string) => {
    const now = new Date().toISOString();
    const alreadyRecordedToday = statusHistory.some((item) => item.date === todayKey);

    setStatusEmoji(emoji);
    setStatusLabel(label);
    setStatusMessage(message);
    setStatusHistory((currentHistory) => {
      const hasToday = currentHistory.some((item) => item.date === todayKey);
      const nextEntry: StatusHistoryItem = {
        createdAt: now,
        date: todayKey,
        emoji,
        id: `status-${todayKey}`,
        label,
        message,
        point: hasToday ? 0 : 10,
      };
      const withoutToday = currentHistory.filter((item) => item.date !== todayKey);
      return [nextEntry, ...withoutToday].slice(0, 60);
    });

    if (!alreadyRecordedToday) {
      grantStatusCheckInReward(10);
    }

    addNotification({
      body: alreadyRecordedToday
        ? `${label} 상태로 오늘의 기록을 업데이트했어요.`
        : `${label} 상태를 기록해 10P가 적립됐어요.`,
      title: "상태가 기록됐어요",
      type: "status",
    });
  };

  const activeConversation = conversations.find((item) => item.id === activeConversationId);

  const content = useMemo(() => {
    switch (screen) {
      case "start":
        return <StartPage onStart={goNext} />;
      case "location":
        return (
          <LocationPage
            value={neighborhood}
            onChange={setNeighborhood}
            onNext={goNext}
          />
        );
      case "phone":
        return <PhonePage value={phone} onChange={setPhone} onNext={goNext} />;
      case "profileSetup":
        return (
          <ProfileSetupPage
            value={nickname}
            profileImage={profileImage}
            onChange={setNickname}
            onProfileImageChange={setProfileImage}
            onNext={goNext}
          />
        );
      case "guide":
        return <GuidePage onNext={goNext} />;
      case "home":
        return (
          <HomePage
            nickname={nickname || "모지님"}
            neighborhood={neighborhood}
            profileImage={profileImage}
            shouldPromptStatus={!hasStatusEntryToday}
            statusEmoji={statusEmoji}
            statusLabel={statusLabel}
            statusMessage={statusMessage}
            onOpenConversation={(partner, contextLabel, seedMessage) =>
              openConversation(partner, "home", contextLabel, seedMessage, "home")
            }
            onOpenNotifications={() => setScreen("notification")}
            onStatusChange={saveStatus}
          />
        );
      case "map":
        return <MapPage neighborhood={neighborhood} onNeighborhoodChange={setNeighborhood} />;
      case "community":
        return (
          <CommunityPage
            neighborhood={neighborhood}
            onOpenChatList={() => setScreen("chatList")}
            onOpenConversation={(partner, contextLabel, seedMessage) =>
              openConversation(partner, "community", contextLabel, seedMessage, "community")
            }
          />
        );
      case "profile":
        return (
          <ProfilePage
            nickname={nickname || "모지님"}
            profileImage={profileImage}
            neighborhood={neighborhood}
            profileView={profileView}
            statusHistory={statusHistory}
            onNicknameChange={setNickname}
            onProfileImageChange={setProfileImage}
            onProfileViewChange={setProfileView}
            onFriendAdded={(friendName) =>
              addNotification({
                body: `${friendName}님을 친구 목록에 추가했어요.`,
                title: "친구가 추가됐어요",
                type: "friend",
              })
            }
            onOpenFriendConversation={(friend, contextLabel, seedMessage) => {
              setProfileView("friends");
              openConversation(
                friend,
                "friend",
                contextLabel ?? friend.statusLabel,
                seedMessage,
                "profile",
              );
            }}
            onPointExchange={(giftName, point) =>
              addNotification({
                body: `${giftName} 교환으로 ${point.toLocaleString()}P가 차감됐어요.`,
                title: "기프티콘 교환 완료",
                type: "point",
              })
            }
          />
        );
      case "chatList":
        return (
          <ChatListPage
            conversations={conversations}
            onBack={() => setScreen("community")}
            onOpenConversation={openConversationById}
          />
        );
      case "chatRoom":
        return activeConversation ? (
          <ChatRoomPage
            conversation={activeConversation}
            onBack={() => setScreen(chatReturnScreen)}
            onCompleteHelp={completeConversationHelp}
            onSendMessage={sendMessage}
          />
        ) : (
          <ChatListPage
            conversations={conversations}
            onBack={() => setScreen("home")}
            onOpenConversation={openConversationById}
          />
        );
      case "notification":
        return (
          <NotificationPage
            notifications={notifications}
            onBack={() => setScreen("home")}
            onMarkAllRead={markAllRead}
          />
        );
    }
  }, [
    activeConversation,
    chatReturnScreen,
    conversations,
    hasStatusEntryToday,
    neighborhood,
    nickname,
    notifications,
    phone,
    profileImage,
    profileView,
    screen,
    statusEmoji,
    statusHistory,
    statusLabel,
    statusMessage,
  ]);

  return (
    <main className="app-shell">
      <section className="phone-frame">
        {canGoBack && (
          <button className="back-button" onClick={goBack} aria-label="뒤로가기">
            <ArrowLeft size={24} />
          </button>
        )}
        <div className={`screen screen-${screen}`}>{content}</div>
        {["home", "map", "community", "profile"].includes(screen) && (
          <BottomTabs active={screen} onChange={setScreen} />
        )}
      </section>
    </main>
  );
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

export default App;
