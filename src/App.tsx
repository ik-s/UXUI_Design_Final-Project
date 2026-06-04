import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BottomTabs } from "./components/BottomTabs";
import { HomeIndicator } from "./components/HomeIndicator";
import { StatusBar } from "./components/StatusBar";
import { onboardingOrder } from "./data/appData";
import { useLocalStorageState } from "./hooks/useLocalStorageState";
import { useConversations } from "./hooks/useConversations";
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
import { grantHelpCompletionReward } from "./utils/activityStorage";
import type { ConversationPartner, ConversationSource, ProfileView, Screen } from "./types";

const screensWithBack: Screen[] = ["location", "phone", "profileSetup", "guide"];

function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [nickname, setNickname] = useLocalStorageState("mojiday:nickname", "");
  const [phone, setPhone] = useLocalStorageState("mojiday:phone", "");
  const [neighborhood, setNeighborhood] = useLocalStorageState("mojiday:neighborhood", "");
  const [profileImage, setProfileImage] = useLocalStorageState("mojiday:profileImage", "");
  const [statusEmoji, setStatusEmoji] = useLocalStorageState("mojiday:statusEmoji", "🙂");
  const [statusLabel, setStatusLabel] = useLocalStorageState("mojiday:statusLabel", "조금 불안해요");
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [chatReturnScreen, setChatReturnScreen] = useState<Screen>("chatList");
  const [profileView, setProfileView] = useState<ProfileView>("profile");
  const {
    completeHelp,
    conversations,
    markConversationRead,
    requestHelp,
    sendMessage,
    startConversation,
  } = useConversations();
  const { addNotification, markAllRead, notifications } = useNotifications();

  const canGoBack = screensWithBack.includes(screen);

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

    completeHelp(conversationId);
    grantHelpCompletionReward(conversation.partner.name);
    addNotification({
      body: `${conversation.partner.name}님과의 도움이 완료되어 10P가 적립됐어요.`,
      title: "도움 완료가 기록됐어요",
      type: "help",
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
            nickname={nickname || "닉네임"}
            neighborhood={neighborhood}
            profileImage={profileImage}
            statusEmoji={statusEmoji}
            statusLabel={statusLabel}
            onOpenConversation={(partner, contextLabel, seedMessage) =>
              openConversation(partner, "home", contextLabel, seedMessage, "home")
            }
            onOpenNotifications={() => setScreen("notification")}
            onStatusChange={(emoji, label) => {
              setStatusEmoji(emoji);
              setStatusLabel(label);
              addNotification({
                body: `${label} 상태로 오늘의 안부를 남겼어요.`,
                title: "상태가 기록됐어요",
                type: "status",
              });
            }}
          />
        );
      case "map":
        return <MapPage neighborhood={neighborhood} />;
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
            nickname={nickname || "닉네임"}
            profileImage={profileImage}
            neighborhood={neighborhood}
            profileView={profileView}
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
            onOpenFriendConversation={(friend) => {
              setProfileView("friends");
              openConversation(friend, "friend", friend.statusLabel, undefined, "profile");
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
            onRequestHelp={requestHelp}
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
    neighborhood,
    nickname,
    notifications,
    phone,
    profileView,
    profileImage,
    screen,
    statusEmoji,
    statusLabel,
  ]);

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <StatusBar />
        {canGoBack && (
          <button className="back-button" onClick={goBack} aria-label="뒤로가기">
            <ArrowLeft size={24} />
          </button>
        )}
        <div className={`screen screen-${screen}`}>{content}</div>
        {["home", "map", "community", "profile"].includes(screen) && (
          <BottomTabs active={screen} onChange={setScreen} />
        )}
        <HomeIndicator />
      </section>
    </main>
  );
}

export default App;
