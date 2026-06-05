import type { LucideIcon } from "lucide-react";
import { Home, MapPin, MessagesSquare, User } from "lucide-react";
import type { GuideStep, NotificationItem, Screen, StatusHistoryItem } from "../types";

export const onboardingOrder: Screen[] = [
  "start",
  "location",
  "phone",
  "profileSetup",
  "guide",
  "home",
];

export const tabs: Array<{ id: Screen; label: string; icon: LucideIcon }> = [
  { id: "home", label: "홈", icon: Home },
  { id: "map", label: "내 근처", icon: MapPin },
  { id: "community", label: "커뮤니티", icon: MessagesSquare },
  { id: "profile", label: "마이", icon: User },
];

export const statusItems = [
  {
    emoji: "🙂",
    tone: "good",
    label: "괜찮아요",
    desc: "상태만 기록하고 넘어갈게요.",
  },
  {
    emoji: "😟",
    tone: "uneasy",
    label: "조금 불안해요",
    desc: "누군가 알고만 있어도 안심될 것 같아요.",
  },
  {
    emoji: "🫶",
    tone: "check",
    label: "확인이 필요해요",
    desc: "잠깐 안부 확인을 부탁하고 싶어요.",
  },
  {
    emoji: "📞",
    tone: "help",
    label: "전화가 필요해요",
    desc: "혼자 해결하기 어려워서 전화 가능한 친구를 찾고 있어요.",
  },
];

export const guideSteps: GuideStep[] = [
  {
    body: "오늘의 감정을 이모지와 짧은 말로 먼저 남기면 친구와 이웃이 지금 상태를 더 빨리 이해할 수 있어요.",
    id: "status",
    preview: "status",
    title: "지금 기분을 먼저 남겨요",
  },
  {
    body: "홈에서는 친구 상태를 먼저 보고, 주변 이웃 상태는 탭으로 범위를 바꿔 확인할 수 있어요.",
    id: "neighbors",
    preview: "neighbors",
    title: "친구의 상태를 먼저 살펴요",
  },
  {
    body: "위치 공개 범위를 직접 정하고, 필요한 순간 가까운 병원이나 도움 장소를 찾아 알려줄 수 있어요.",
    id: "map",
    preview: "map",
    title: "위치와 도움 장소를 안전하게 공유해요",
  },
  {
    body: "커뮤니티에서는 동네 이야기, 맛집과 장소, 안부 나눔을 가볍게 이어갈 수 있어요.",
    id: "community",
    preview: "community",
    title: "동네 이야기를 나눠요",
  },
  {
    body: "도움 완료와 감정 체크인은 포인트와 온도로 기록되어 나의 돌봄 기록으로 남아요.",
    id: "profile",
    preview: "profile",
    title: "기록을 모아 확인해요",
  },
];

export const communityCategories = ["전체", "인기", "동네얘기", "맛집·장소", "안부 나눔"] as const;

export const communityPosts = [
  {
    category: "동네얘기",
    popular: true,
    tag: "동네얘기",
    title: "Q. 저녁에 산책하기 괜찮은 길 추천해 주세요",
    body: "요즘 해가 늦게 져서 사람 많은 길 위주로 걷고 싶어요.",
    meta: "서우 · 모지동",
    author: "서우",
    statusEmoji: "🙂",
    time: "15분 전",
    foot: "궁금해요 · 댓글 2",
  },
  {
    category: "맛집·장소",
    popular: false,
    tag: "맛집·장소",
    title: "혼자 가도 편한 카페 추천 부탁드려요",
    body: "콘센트 있고 오래 앉아 있어도 부담 없는 곳이면 좋아요.",
    meta: "카리 · 모지동",
    author: "카리",
    statusEmoji: "🫶",
    time: "17분 전",
    foot: "공감하기 · 댓글 2",
  },
  {
    category: "안부 나눔",
    popular: true,
    tag: "안부 나눔",
    title: "오늘 하루 어땠는지 한 줄만 남겨요",
    body: "저는 비가 와서 조금 가라앉았지만 따뜻한 차 마시고 나아졌어요.",
    meta: "환스 · 모지동",
    author: "환스",
    statusEmoji: "😟",
    time: "21분 전",
    foot: "봤어요 8",
  },
  {
    category: "동네얘기",
    popular: false,
    tag: "동네얘기",
    title: "주말에 문 여는 약국 아시는 분 있나요?",
    body: "가벼운 감기약을 사야 하는데 늦게까지 여는 곳이면 좋겠어요.",
    meta: "민지 · 모지동",
    author: "민지",
    statusEmoji: "📞",
    time: "28분 전",
    foot: "정보 3",
  },
];

export const homeStatuses = [
  {
    avatar: "😟",
    scope: "friends",
    name: "환스",
    face: "😟",
    state: "조금 불안해요",
    desc: "혼자 해결하기 어려워서 전화 가능한 친구 찾고 있어요.",
    time: "방금",
    helpCount: 8,
    reactionCount: 3,
    locationShared: true,
    locationLabel: "문정역 2번 출구 근처",
    nearbyCare: {
      name: "문정온가정의학과",
      distance: "도보 6분",
      phone: "02-000-1188",
    },
  },
  {
    avatar: "🫶",
    scope: "friends",
    name: "서우",
    face: "🫶",
    state: "확인이 필요해요",
    desc: "조금 후에 한 번만 안부 확인해주면 좋겠어요.",
    time: "12분 전",
    helpCount: 14,
    reactionCount: 5,
    locationShared: false,
    locationLabel: "친구가 위치를 숨겼어요",
    nearbyCare: undefined,
  },
  {
    avatar: "🙂",
    scope: "neighbors",
    name: "유진",
    face: "🙂",
    state: "괜찮아요",
    desc: "기록만 남겨요. 걱정하지 않아도 괜찮아요.",
    time: "24분 전",
    helpCount: 5,
    reactionCount: 11,
    locationShared: false,
    locationLabel: "모지동 근처",
    nearbyCare: undefined,
  },
  {
    avatar: "📞",
    scope: "neighbors",
    name: "카리",
    face: "📞",
    state: "전화가 필요해요",
    desc: "전화로 같이 정리해줄 사람이 있으면 좋겠어요.",
    time: "31분 전",
    helpCount: 21,
    reactionCount: 2,
    locationShared: true,
    locationLabel: "모지동 주민센터 근처",
    nearbyCare: {
      name: "모지365의원",
      distance: "도보 9분",
      phone: "02-000-3650",
    },
  },
] as const;

export const profileStats = {
  helpedCount: 3,
  helpTemperature: 36.8,
  receivedHelpCount: 2,
  thanksCount: 5,
};

export const statusHistorySeed: StatusHistoryItem[] = [
  {
    createdAt: "2026-06-04T09:10:00.000Z",
    date: "2026-06-04",
    emoji: "🙂",
    id: "status-2026-06-04",
    label: "괜찮아요",
    message: "어제보다 컨디션이 안정적이에요.",
    point: 10,
  },
  {
    createdAt: "2026-06-03T09:20:00.000Z",
    date: "2026-06-03",
    emoji: "😟",
    id: "status-2026-06-03",
    label: "조금 불안해요",
    message: "누군가 알고만 있어도 안심될 것 같았어요.",
    point: 10,
  },
  {
    createdAt: "2026-06-02T20:30:00.000Z",
    date: "2026-06-02",
    emoji: "🫶",
    id: "status-2026-06-02",
    label: "확인이 필요해요",
    message: "늦은 시간에 안부 확인이 필요했어요.",
    point: 10,
  },
];

export const recentHelpHistory = [
  {
    id: 1,
    icon: "🧡",
    point: 10,
    title: "민지의 장보기 도움을 완료했어요.",
  },
  {
    id: 2,
    icon: "☂️",
    point: 5,
    title: "서현에게 우산을 빌려줬어요.",
  },
  {
    id: 3,
    icon: "💬",
    point: 3,
    title: "지훈님께 감사 인사를 받았어요.",
  },
];

export const praiseBadges = ["친절해요", "응답이 빨라요", "약속을 지켜요", "첫 도움 완료"];

export const defaultNotifications: NotificationItem[] = [
  {
    body: "이모지로 기분을 남기고 주변 이웃과 도움을 이어갈 수 있어요.",
    createdAt: new Date().toISOString(),
    id: "welcome-notification",
    read: false,
    title: "MojiDay에 오신 걸 환영해요",
    type: "status",
  },
];

export const defaultUserPoint = 1250;

export const pointShopItems = [
  {
    brand: "스타벅스",
    category: "카페",
    emoji: "☕",
    id: 1,
    image: "/images/gift-starbucks.png",
    name: "아이스 아메리카노 Tall",
    point: 900,
  },
  {
    brand: "CU",
    category: "편의점",
    emoji: "🥛",
    id: 2,
    image: "/images/gift-cu.png",
    name: "모바일 금액권 1,000원",
    point: 1000,
  },
  {
    brand: "GS25",
    category: "편의점",
    emoji: "🍌",
    id: 3,
    image: "/images/gift-banana-milk.png",
    name: "바나나우유",
    point: 800,
  },
  {
    brand: "메가커피",
    category: "카페",
    emoji: "🥤",
    id: 4,
    image: "/images/gift-mega-coffee.png",
    name: "아이스 아메리카노",
    point: 700,
  },
  {
    brand: "올리브영",
    category: "생활",
    emoji: "🧴",
    id: 5,
    image: "/images/gift-oliveyoung.png",
    name: "모바일 금액권 3,000원",
    point: 3000,
  },
  {
    brand: "파리바게뜨",
    category: "간식",
    emoji: "🥐",
    id: 6,
    image: "/images/gift-bread.png",
    name: "소금빵 교환권",
    point: 1500,
  },
];

export const visibilityOptions = [
  {
    description: "친구에게 현재 이모지만 보여줘요.",
    label: "이모지만 공개",
    value: "emoji",
  },
  {
    description: "이모지와 짧은 상태 메시지를 친구에게 보여줘요.",
    label: "이모지 + 상태 메시지 공개",
    value: "status",
  },
  {
    description: "동네나 가까운 장소 정도만 친구에게 보여줘요.",
    label: "대략적인 위치까지 공개",
    value: "roughLocation",
  },
  {
    description: "내가 선택한 상세 위치를 가까운 친구에게 보여줘요.",
    label: "상세 위치까지 공개",
    value: "detailLocation",
  },
] as const;

export const mockFriends = [
  {
    avatar: "🙂",
    currentMood: "🙂",
    id: 1,
    locationLabel: "문정역 근처",
    name: "민지",
    nearbyCare: "문정온가정의학과 · 도보 6분",
    statusMessage: "괜찮은 하루예요",
    userTag: "#minji_0421",
    visibilityLevel: "status",
  },
  {
    avatar: "😟",
    currentMood: "😟",
    id: 2,
    locationLabel: "송파구청 근처",
    name: "서현",
    nearbyCare: "송파365의원 · 도보 8분",
    statusMessage: "오늘은 조금 지쳤어요",
    userTag: "#seohyun_1188",
    visibilityLevel: "roughLocation",
  },
  {
    avatar: "🫶",
    currentMood: "🫶",
    id: 3,
    locationLabel: "카페거리 근처",
    name: "지훈",
    nearbyCare: "모지약국 · 도보 4분",
    statusMessage: "말 걸어줘도 돼요",
    userTag: "#jihoon_2307",
    visibilityLevel: "detailLocation",
  },
  {
    avatar: "📞",
    currentMood: "📞",
    id: 4,
    locationLabel: "위치 비공개",
    name: "유진",
    statusMessage: "전화 가능한 친구가 필요해요",
    userTag: "#yujin_0915",
    visibilityLevel: "emoji",
  },
];

export const mockSearchUsers = [
  {
    avatar: "🌱",
    currentMood: "😟",
    id: 101,
    name: "하은",
    phone: "010-3344-1122",
    statusMessage: "무난한 하루예요",
    userTag: "#haeun_3344",
  },
  {
    avatar: "🌙",
    currentMood: "🫶",
    id: 102,
    name: "도윤",
    phone: "010-7788-2211",
    statusMessage: "조금 조용해요",
    userTag: "#doyoon_7788",
  },
];

export const nearbyPlaces = [
  { name: "연세내과", type: "clinic", x: 28, y: 28 },
  { name: "봄날소아과", type: "clinic", x: 62, y: 33 },
  { name: "햇빛약국", type: "pharmacy", x: 82, y: 45 },
  { name: "다솔약국", type: "pharmacy", x: 72, y: 75 },
  { name: "서울튼튼병원", type: "clinic", x: 53, y: 80 },
  { name: "건강약국", type: "pharmacy", x: 27, y: 75 },
  { name: "햇빛정형외과", type: "clinic", x: 26, y: 58 },
  { name: "다솔이비인후과", type: "clinic", x: 70, y: 59 },
];
