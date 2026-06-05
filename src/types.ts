export type Screen =
  | "start"
  | "location"
  | "phone"
  | "profileSetup"
  | "guide"
  | "home"
  | "map"
  | "community"
  | "profile"
  | "chatList"
  | "chatRoom"
  | "notification";

export type ProfileView = "profile" | "pointShop" | "friends";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type ManualMapLocation = Coordinates & {
  address: string;
  detailAddress: string;
  neighborhood?: string;
  source: "manual_map";
  provider: "kakao";
};

export type SearchRadiusMeters = 500 | 1000 | 3000 | 5000;

export type ConversationSource = "home" | "community" | "friend";

export type HelpRequestStatus = "idle" | "requested" | "completionPending" | "completed";

export type ConversationPartner = {
  avatar?: string;
  helpCount?: number;
  id: string;
  locationLabel?: string;
  name: string;
  statusEmoji?: string;
  statusLabel?: string;
  userTag?: string;
};

export type ChatMessage = {
  createdAt: string;
  id: string;
  sender: "me" | "partner" | "system";
  text: string;
};

export type Conversation = {
  contextLabel?: string;
  helpStatus: HelpRequestStatus;
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  partner: ConversationPartner;
  source: ConversationSource;
  unreadCount: number;
};

export type NotificationItem = {
  body: string;
  createdAt: string;
  id: string;
  read: boolean;
  title: string;
  type: "status" | "friend" | "help" | "point" | "chat";
};

export type GuideStep = {
  body: string;
  id: string;
  preview: "status" | "neighbors" | "map" | "community" | "profile";
  title: string;
};

export type StatusHistoryItem = {
  createdAt: string;
  date: string;
  emoji: string;
  id: string;
  label: string;
  message: string;
  point: number;
};
