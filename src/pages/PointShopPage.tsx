import { useMemo, useState } from "react";
import { ArrowLeft, Gift, History, Sparkles } from "lucide-react";
import { defaultUserPoint, pointShopItems } from "../data/appData";
import { useLocalStorageState } from "../hooks/useLocalStorageState";

type PointShopItem = (typeof pointShopItems)[number];

type ExchangeHistoryItem = {
  brand: string;
  date: string;
  id: number;
  name: string;
  point: number;
  status: "교환 완료";
};

type PointShopState = {
  exchangeHistory: ExchangeHistoryItem[];
  userPoint: number;
};

type PointShopPageProps = {
  onBack: () => void;
  onPointExchange?: (giftName: string, point: number) => void;
};

const pointShopCategories = ["전체", "카페", "편의점", "간식", "생활"];

export function PointShopPage({ onBack, onPointExchange }: PointShopPageProps) {
  const [shopState, setShopState] = useLocalStorageState<PointShopState>(
    "mojiday:pointShop",
    {
      exchangeHistory: [],
      userPoint: defaultUserPoint,
    },
  );
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [confirmItem, setConfirmItem] = useState<PointShopItem | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const filteredItems = useMemo(() => {
    if (selectedCategory === "전체") return pointShopItems;
    return pointShopItems.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const exchangeItem = () => {
    if (!confirmItem || shopState.userPoint < confirmItem.point) return;

    setShopState({
      exchangeHistory: [
        {
          brand: confirmItem.brand,
          date: formatToday(),
          id: Date.now(),
          name: confirmItem.name,
          point: confirmItem.point,
          status: "교환 완료",
        },
        ...shopState.exchangeHistory,
      ],
      userPoint: shopState.userPoint - confirmItem.point,
    });
    setConfirmItem(null);
    onPointExchange?.(`${confirmItem.brand} ${confirmItem.name}`, confirmItem.point);
    setToastMessage("교환이 완료되었어요!");
    window.setTimeout(() => setToastMessage(""), 1800);
  };

  return (
    <div className="point-shop-screen tab-screen">
      {toastMessage && <div className="point-shop-toast">{toastMessage}</div>}
      <header className="point-shop-top">
        <button aria-label="프로필로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <strong>포인트 상점</strong>
          <span>도움을 주고받으며 모은 포인트를 기프티콘으로 교환해보세요.</span>
        </div>
        <button aria-label="교환 내역" onClick={() => setShowHistory(true)}>
          <History size={22} />
        </button>
      </header>

      <section className="point-balance-card">
        <div>
          <span>나의 포인트</span>
          <strong>{shopState.userPoint.toLocaleString()}P</strong>
          <p>도움을 완료하거나 고마워요를 받으면 포인트가 쌓여요.</p>
        </div>
        <Gift size={42} />
      </section>

      <nav className="point-category-row" aria-label="기프티콘 카테고리">
        {pointShopCategories.map((category) => (
          <button
            className={selectedCategory === category ? "active" : ""}
            key={category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="point-shop-grid" aria-label="기프티콘 상품 목록">
        {filteredItems.map((item) => {
          const canExchange = shopState.userPoint >= item.point;

          return (
            <article className={`gift-card${canExchange ? "" : " disabled"}`} key={item.id}>
              <div className="gift-image-box">{item.emoji}</div>
              <span>{item.brand}</span>
              <strong>{item.name}</strong>
              <p>{item.point.toLocaleString()}P</p>
              <button disabled={!canExchange} onClick={() => setConfirmItem(item)}>
                {canExchange ? "교환하기" : "포인트 부족"}
              </button>
            </article>
          );
        })}
      </section>

      {confirmItem && (
        <div className="point-modal-backdrop" role="presentation">
          <section className="point-confirm-sheet" role="dialog" aria-modal="true">
            <Sparkles size={34} />
            <strong>정말 교환할까요?</strong>
            <p>
              {confirmItem.brand} {confirmItem.name}
              <br />
              <b>{confirmItem.point.toLocaleString()}P</b>가 차감됩니다.
            </p>
            <div>
              <button onClick={() => setConfirmItem(null)}>취소</button>
              <button onClick={exchangeItem}>교환하기</button>
            </div>
          </section>
        </div>
      )}

      {showHistory && (
        <div className="point-modal-backdrop" role="presentation">
          <section className="exchange-history-sheet" role="dialog" aria-modal="true">
            <header>
              <strong>교환 내역</strong>
              <button onClick={() => setShowHistory(false)}>닫기</button>
            </header>
            {shopState.exchangeHistory.length > 0 ? (
              <div className="exchange-history-list">
                {shopState.exchangeHistory.map((item) => (
                  <article key={item.id}>
                    <strong>
                      {item.brand} {item.name}
                    </strong>
                    <p>
                      {item.point.toLocaleString()}P · {item.date}
                    </p>
                    <span>{item.status}</span>
                  </article>
                ))}
              </div>
            ) : (
              <div className="exchange-empty-state">
                <Gift size={42} />
                <strong>아직 교환한 기프티콘이 없어요.</strong>
                <p>도움을 주고 포인트를 모아 첫 기프티콘을 교환해보세요.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function formatToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");

  return `${year}.${month}.${date}`;
}
