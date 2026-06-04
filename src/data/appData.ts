import type { LucideIcon } from "lucide-react";
import { Home, MapPin, MessagesSquare, User } from "lucide-react";
import type { GuideStep, NotificationItem, Screen } from "../types";

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
  { id: "profile", label: "프로필", icon: User },
];

export const statusItems = [
  {
    emoji: "😊",
    tone: "good",
    label: "괜찮아요",
    desc: "상태만 기록하고 싶어요",
  },
  {
    emoji: "🙂",
    tone: "uneasy",
    label: "조금 불안해요",
    desc: "누군가 알고만 있어도 안심돼요",
  },
  {
    emoji: "😟",
    tone: "check",
    label: "확인이 필요해요",
    desc: "조금 뒤 확인을 부탁하고 싶어요",
  },
  {
    emoji: "😣",
    tone: "help",
    label: "도움이 필요해요",
    desc: "전화나 직접 도움이 필요해요",
  },
];

export const guideSteps: GuideStep[] = [
  {
    body: "오늘의 안부를 이모지로 먼저 남기면, 직접 설명하기 어려운 순간에도 지금 상태가 전해져요.",
    id: "status",
    preview: "status",
    title: "지금 어때요?",
  },
  {
    body: "내 주변 이웃의 상태를 말풍선처럼 확인하고, 필요한 경우 프로필에서 바로 도움을 시작할 수 있어요.",
    id: "neighbors",
    preview: "neighbors",
    title: "주변 이웃을 살펴봐요",
  },
  {
    body: "위치를 직접 맞추고 반경을 정하면, 주변 의료시설과 도움 가능한 이웃을 더 정확히 확인할 수 있어요.",
    id: "map",
    preview: "map",
    title: "위치와 반경을 직접 정해요",
  },
  {
    body: "동네 게시글에서 대화하기를 누르면 1:1 대화로 이어져, 부담 없이 도움을 주고받을 수 있어요.",
    id: "community",
    preview: "community",
    title: "커뮤니티에서 연결돼요",
  },
  {
    body: "작은 도움은 포인트와 도움 온도로 기록돼요. 활동이 쌓일수록 신뢰를 보여줄 수 있어요.",
    id: "profile",
    preview: "profile",
    title: "도움이 기록으로 남아요",
  },
];

export const communityPosts = [
  {
    tag: "벌레 퇴치 요청",
    title: "벌레 잡아주세요 제발요",
    accent: "모집중",
    body: "쪽지 주세요 고고!!",
    meta: "오우우 · 화양동",
    statusEmoji: "😟",
    time: "3분 전",
    foot: "0/4명 참여",
  },
  {
    tag: "동네질문",
    title:
      "Q. 혼밥은 다들 어디서 하시나요? 뻘쭘하지 않고 사장님들께 안 미안한 곳, 어디든 리스트업해서 한번씩 가보려구요.",
    meta: "도우영 · 화양동",
    statusEmoji: "😊",
    time: "15분 전",
    foot: "궁금해요   답변 2",
  },
  {
    tag: "동네맛집",
    title: "송정동 밥집 추천 부탁드려요",
    body: "퇴근하고 뭐 해먹기 귀찮을때 먹을만한 곳이요. ... 더보기",
    meta: "카리 · 화양동",
    statusEmoji: "😣",
    time: "17분 전",
    foot: "공감하기   댓글 2",
  },
  {
    tag: "동네질문",
    title: "밤에 열려있는 편의점 앞에서 기다려도 괜찮을까요?",
    meta: "하루 · 화양동",
    statusEmoji: "🙂",
    time: "21분 전",
    foot: "궁금해요",
  },
];

export const homeStatuses = [
  {
    name: "환스",
    face: "🙂",
    state: "조금 불안해요",
    desc: "오늘 컨디션이 애매해서 누군가 알고만 있어도 안심돼요.",
    time: "방금",
    helpCount: 8,
  },
  {
    name: "오우우",
    face: "😟",
    state: "확인이 필요해요",
    desc: "조금 뒤에 한 번만 확인해주면 좋겠어요.",
    time: "12분 전",
    helpCount: 14,
  },
  {
    name: "도우영",
    face: "😊",
    state: "괜찮아요",
    desc: "기록만 남겨요. 답장하지 않아도 괜찮아요.",
    time: "24분 전",
    helpCount: 5,
  },
  {
    name: "카리",
    face: "😣",
    state: "도움이 필요해요",
    desc: "혼자 해결하기 어려워서 전화 가능한 친구를 찾고 있어요.",
    time: "31분 전",
    helpCount: 21,
  },
];

export const profileStats = {
  helpedCount: 3,
  helpTemperature: 36.8,
  receivedHelpCount: 2,
  thanksCount: 5,
};

export const recentHelpHistory = [
  {
    id: 1,
    icon: "🛒",
    point: 10,
    title: "민지님의 장보기 도움을 완료했어요",
  },
  {
    id: 2,
    icon: "☂️",
    point: 5,
    title: "승현님에게 우산을 빌려줬어요",
  },
  {
    id: 3,
    icon: "💌",
    point: 3,
    title: "지훈님에게 감사 인사를 받았어요",
  },
];

export const praiseBadges = ["친절해요", "응답이 빨라요", "약속을 잘 지켜요", "첫 도움 완료"];

export const defaultNotifications: NotificationItem[] = [
  {
    body: "이모지로 안부를 남기고 주변 이웃과 도움을 이어갈 수 있어요.",
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
    emoji: "🏪",
    id: 2,
    image: "/images/gift-cu.png",
    name: "모바일 금액권 1,000원",
    point: 1000,
  },
  {
    brand: "GS25",
    category: "편의점",
    emoji: "🥛",
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
    emoji: "🛍️",
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
    description: "현재 상태 이모지만 보여줘요.",
    label: "이모지만 공개",
    value: "emoji",
  },
  {
    description: "이모지와 짧은 상태 문구를 보여줘요.",
    label: "이모지 + 상태 메시지 공개",
    value: "status",
  },
  {
    description: "동네나 근처 장소 정도만 보여줘요.",
    label: "대략적인 위치까지 공개",
    value: "roughLocation",
  },
  {
    description: "내가 설정한 상세 위치를 친구에게 보여줘요.",
    label: "상세 주소까지 공개",
    value: "detailLocation",
  },
] as const;

export const mockFriends = [
  {
    avatar: "😊",
    currentMood: "😊",
    id: 1,
    locationLabel: "송파구 문정동 근처",
    name: "민지",
    statusMessage: "괜찮은 하루예요",
    userTag: "#minji_0421",
    visibilityLevel: "status",
  },
  {
    avatar: "😵",
    currentMood: "😵",
    id: 2,
    locationLabel: "학교 근처",
    name: "서현",
    statusMessage: "오늘은 조금 지쳤어요",
    userTag: "#seohyun_1188",
    visibilityLevel: "emoji",
  },
  {
    avatar: "😶",
    currentMood: "😶",
    id: 3,
    locationLabel: "카페 근처",
    name: "지훈",
    statusMessage: "말 걸어줘도 돼요",
    userTag: "#jihoon_2307",
    visibilityLevel: "roughLocation",
  },
  {
    avatar: "🥰",
    currentMood: "🥰",
    id: 4,
    locationLabel: "집 근처",
    name: "유진",
    statusMessage: "기분 좋은 하루!",
    userTag: "#yujin_0915",
    visibilityLevel: "detailLocation",
  },
];

export const mockSearchUsers = [
  {
    avatar: "🌷",
    currentMood: "🙂",
    id: 101,
    name: "하은",
    phone: "010-3344-1122",
    statusMessage: "무난한 하루예요",
    userTag: "#haeun_3344",
  },
  {
    avatar: "🌙",
    currentMood: "😴",
    id: 102,
    name: "도윤",
    phone: "010-7788-2211",
    statusMessage: "조금 졸려요",
    userTag: "#doyoon_7788",
  },
];

export const nearbyPlaces = [
  { name: "연세내과", type: "clinic", x: 28, y: 28 },
  { name: "봄날소아과", type: "clinic", x: 62, y: 33 },
  { name: "새빛약국", type: "pharmacy", x: 82, y: 45 },
  { name: "다솜약국", type: "pharmacy", x: 72, y: 75 },
  { name: "서울튼튼병원", type: "clinic", x: 53, y: 80 },
  { name: "건강약국", type: "pharmacy", x: 27, y: 75 },
  { name: "새빛정형외과", type: "clinic", x: 26, y: 58 },
  { name: "다솜이비인후과", type: "clinic", x: 70, y: 59 },
];
