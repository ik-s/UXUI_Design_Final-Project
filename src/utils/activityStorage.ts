import { defaultUserPoint, recentHelpHistory } from "../data/appData";

const POINT_SHOP_KEY = "mojiday:pointShop";
const HELP_HISTORY_KEY = "mojiday:helpHistory";

type StoredPointShopState = {
  exchangeHistory: unknown[];
  userPoint: number;
};

type HelpHistoryItem = (typeof recentHelpHistory)[number];

export function grantHelpCompletionReward(partnerName: string, point = 10) {
  try {
    addPoint(point);

    const nextHelpItem: HelpHistoryItem = {
      icon: "✅",
      id: Date.now(),
      point,
      title: `${partnerName}님과의 도움을 완료했어요.`,
    };
    const history = readHelpHistory();
    window.localStorage.setItem(HELP_HISTORY_KEY, JSON.stringify([nextHelpItem, ...history]));
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 현재 세션 상태만 유지합니다.
  }
}

export function grantStatusCheckInReward(point = 10) {
  try {
    addPoint(point);
  } catch {
    // localStorage를 사용할 수 없는 환경에서는 보상을 건너뜁니다.
  }
}

function addPoint(point: number) {
  const pointState = readPointState();
  window.localStorage.setItem(
    POINT_SHOP_KEY,
    JSON.stringify({
      ...pointState,
      userPoint: pointState.userPoint + point,
    }),
  );
}

function readPointState(): StoredPointShopState {
  const stored = window.localStorage.getItem(POINT_SHOP_KEY);
  if (!stored) {
    return {
      exchangeHistory: [],
      userPoint: defaultUserPoint,
    };
  }

  const parsed = JSON.parse(stored) as Partial<StoredPointShopState>;
  return {
    exchangeHistory: Array.isArray(parsed.exchangeHistory) ? parsed.exchangeHistory : [],
    userPoint: typeof parsed.userPoint === "number" ? parsed.userPoint : defaultUserPoint,
  };
}

function readHelpHistory(): HelpHistoryItem[] {
  const stored = window.localStorage.getItem(HELP_HISTORY_KEY);
  if (!stored) return recentHelpHistory;

  const parsed = JSON.parse(stored);
  return Array.isArray(parsed) ? (parsed as HelpHistoryItem[]) : recentHelpHistory;
}
