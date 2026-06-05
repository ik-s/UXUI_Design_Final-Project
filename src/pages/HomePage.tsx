import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  HeartHandshake,
  Hospital,
  MapPin,
  Plus,
  ShieldCheck,
  ThumbsUp,
  UserPlus,
  X,
} from "lucide-react";
import logoText from "../../img/logo 1.svg";
import { UserAvatar } from "../components/UserAvatar";
import { homeStatuses, statusItems } from "../data/appData";
import type { ConversationPartner } from "../types";

type FeedScope = (typeof homeStatuses)[number]["scope"];

type HomePageProps = {
  hasStatusEntryToday: boolean;
  nickname: string;
  neighborhood: string;
  profileImage: string;
  shouldPromptStatus: boolean;
  statusEmoji: string;
  statusLabel: string;
  statusMessage: string;
  onStatusChange: (emoji: string, label: string, message: string) => void;
  onOpenConversation: (
    partner: ConversationPartner,
    contextLabel?: string,
    seedMessage?: string,
  ) => void;
  onOpenNotifications: () => void;
};

const feedScopeTabs: Array<{ id: FeedScope; label: string }> = [
  { id: "friends", label: "친구" },
  { id: "neighbors", label: "주변 이웃" },
];

export function HomePage({
  hasStatusEntryToday,
  nickname,
  neighborhood,
  profileImage,
  shouldPromptStatus,
  statusEmoji,
  statusLabel,
  statusMessage,
  onOpenConversation,
  onOpenNotifications,
  onStatusChange,
}: HomePageProps) {
  const currentStatus =
    statusItems.find((item) => item.label === statusLabel) ??
    statusItems.find((item) => item.emoji === statusEmoji) ??
    statusItems[1];
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [statusPromptDismissed, setStatusPromptDismissed] = useState(false);
  const [statusToast, setStatusToast] = useState("");
  const [selectedFeedScope, setSelectedFeedScope] = useState<FeedScope>("friends");
  const [selectedNeighbor, setSelectedNeighbor] = useState<(typeof homeStatuses)[number] | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [customMessage, setCustomMessage] = useState(statusMessage || currentStatus.desc);
  const [reactionState, setReactionState] = useState(() =>
    homeStatuses.reduce<Record<string, { count: number; reacted: boolean }>>((acc, item) => {
      acc[item.name] = { count: item.reactionCount, reacted: false };
      return acc;
    }, {}),
  );

  useEffect(() => {
    if (shouldPromptStatus && !statusPromptDismissed) {
      setSelectedStatus(currentStatus);
      setCustomMessage(statusMessage || currentStatus.desc);
      setIsStatusPickerOpen(true);
    }
  }, [currentStatus, shouldPromptStatus, statusMessage, statusPromptDismissed]);

  const filteredStatuses = useMemo(
    () => homeStatuses.filter((item) => item.scope === selectedFeedScope),
    [selectedFeedScope],
  );

  const saveStatus = () => {
    const message = customMessage.trim() || selectedStatus.desc;
    const alreadyClaimedPoint = hasStatusEntryToday;
    onStatusChange(selectedStatus.emoji, selectedStatus.label, message);
    setStatusPromptDismissed(true);
    setIsStatusPickerOpen(false);
    setStatusToast(
      alreadyClaimedPoint
        ? "오늘 상태 포인트는 이미 획득했어요."
        : "오늘 상태 기록으로 10P를 획득했어요.",
    );
    window.setTimeout(() => setStatusToast(""), 1800);
  };

  const skipStatus = () => {
    setStatusPromptDismissed(true);
    setIsStatusPickerOpen(false);
  };

  const toggleReaction = (name: string) => {
    setReactionState((current) => {
      const currentItem = current[name] ?? { count: 0, reacted: false };
      const reacted = !currentItem.reacted;
      return {
        ...current,
        [name]: {
          reacted,
          count: Math.max(0, currentItem.count + (reacted ? 1 : -1)),
        },
      };
    });
  };

  const openHelpConversation = (item: (typeof homeStatuses)[number]) => {
    onOpenConversation(
      {
        avatar: item.avatar,
        helpCount: item.helpCount,
        id: `${item.scope}-${item.name}`,
        locationLabel: item.locationLabel,
        name: item.name,
        statusEmoji: item.face,
        statusLabel: item.state,
      },
      item.state,
      item.desc,
    );
    setSelectedNeighbor(null);
  };

  const openCareConversation = (item: (typeof homeStatuses)[number]) => {
    if (!item.nearbyCare) return;

    onOpenConversation(
      {
        avatar: item.avatar,
        helpCount: item.helpCount,
        id: `${item.scope}-${item.name}`,
        locationLabel: item.locationLabel,
        name: item.name,
        statusEmoji: item.face,
        statusLabel: item.state,
      },
      `${item.name}님 주변 도움 장소`,
      undefined,
    );
    setSelectedNeighbor(null);
  };

  return (
    <div className="home-screen tab-screen">
      {statusToast && <div className="status-toast">{statusToast}</div>}
      <header className="top-brand">
        <img src={logoText} alt="MojiDay" />
        <button aria-label="알림" onClick={onOpenNotifications}>
          <Bell size={20} />
        </button>
      </header>
      <section className="status-compose">
        <UserAvatar size="medium" src={profileImage} />
        <div>
          <span>{nickname}님의 오늘 상태</span>
          <strong>감정을 남기면 10P가 쌓여요</strong>
        </div>
        <button
          className={
            hasStatusEntryToday && statusLabel
              ? `add-status has-status status-face status-face-${currentStatus.tone}`
              : "add-status"
          }
          aria-label="상태 추가"
          onClick={() => {
            setSelectedStatus(currentStatus);
            setCustomMessage(statusMessage || currentStatus.desc);
            setIsStatusPickerOpen(true);
          }}
        >
          {hasStatusEntryToday && statusLabel ? statusEmoji : <Plus size={30} />}
        </button>
      </section>
      <div className="status-placeholder">
        <span className={`status-face status-face-${currentStatus.tone}`}>{statusEmoji}</span>
        <div>
          <strong>{statusLabel}</strong>
          <p>{statusMessage || currentStatus.desc}</p>
        </div>
      </div>
      <section className="feed-header">
        <div className="feed-location-row">
          <strong>{neighborhood || "동네 미설정"}</strong>
        </div>
        <nav className="feed-scope-tabs" aria-label="상태 피드 범위">
          {feedScopeTabs.map((tab) => (
            <button
              className={selectedFeedScope === tab.id ? "active" : ""}
              key={tab.id}
              onClick={() => setSelectedFeedScope(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>
      <div className="home-feed">
        {filteredStatuses.length > 0 ? (
          filteredStatuses.map((item) => {
            const reaction = reactionState[item.name] ?? {
              count: item.reactionCount,
              reacted: false,
            };

            return (
              <article className="status-row" key={`${item.scope}-${item.name}`}>
                <UserAvatar size="small" />
                <div className="status-row-body">
                  <button className="status-bubble" onClick={() => setSelectedNeighbor(item)}>
                    <header>
                      <strong>{item.name}</strong>
                      <time>{item.time}</time>
                    </header>
                    <p>
                      <span>{item.face}</span>
                      <b>{item.state}</b>
                      {item.desc}
                    </p>
                  </button>
                  <button
                    className={`status-reaction-button${reaction.reacted ? " active" : ""}`}
                    onClick={() => toggleReaction(item.name)}
                  >
                    <ThumbsUp size={15} />
                    봤어요 {reaction.count}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <section className="home-feed-empty">
            <ThumbsUp size={36} />
            <p>아직 볼 수 있는 상태가 없어요.</p>
          </section>
        )}
      </div>

      {isStatusPickerOpen && (
        <div className="status-picker-backdrop" role="dialog" aria-modal="true">
          <section className="status-picker-sheet">
            <header>
              <div>
                <strong>
                  {shouldPromptStatus ? "오늘 상태를 먼저 남겨볼까요?" : "오늘의 상태를 고르세요"}
                </strong>
                <p>이모지를 고르고 짧은 메시지를 직접 남길 수 있어요. 오늘 첫 기록은 10P가 지급돼요.</p>
              </div>
              <button aria-label="닫기" onClick={skipStatus}>
                <X size={22} />
              </button>
            </header>

            <div className="status-picker-options">
              {statusItems.map((item) => (
                <button
                  className={selectedStatus.label === item.label ? "selected" : ""}
                  key={item.label}
                  onClick={() => {
                    setSelectedStatus(item);
                    setCustomMessage(item.desc);
                  }}
                >
                  <span className={`status-face status-face-${item.tone}`}>{item.emoji}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <label className="status-picker-text">
              <span>짧은 메시지</span>
              <textarea
                maxLength={54}
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                placeholder="예: 전화 가능한 친구 찾고 있어요"
              />
            </label>

            <div className="status-picker-footer">
              <button className="text-button" onClick={skipStatus}>
                나중에 입력하기
              </button>
              <button className="primary-button" onClick={saveStatus}>
                상태 기록하고 10P 받기
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedNeighbor && (
        <div className="neighbor-profile-backdrop" role="dialog" aria-modal="true">
          <section className="neighbor-profile-sheet">
            <button
              className="neighbor-profile-close"
              aria-label="닫기"
              onClick={() => setSelectedNeighbor(null)}
            >
              <X size={22} />
            </button>
            <UserAvatar size="large" />
            <strong>{selectedNeighbor.name}</strong>
            <p>
              <span>{selectedNeighbor.face}</span>
              {selectedNeighbor.state}
            </p>
            <div className="neighbor-help-count">
              <HeartHandshake size={22} />
              도움 횟수 <b>{selectedNeighbor.helpCount}회</b>
            </div>
            <div className="neighbor-location-card">
              {selectedNeighbor.locationShared ? <MapPin size={18} /> : <ShieldCheck size={18} />}
              <span>{selectedNeighbor.locationLabel}</span>
            </div>
            {selectedNeighbor.nearbyCare && (
              <button
                className="neighbor-care-button"
                onClick={() => openCareConversation(selectedNeighbor)}
              >
                <Hospital size={18} />
                {selectedNeighbor.nearbyCare.name} · {selectedNeighbor.nearbyCare.distance} 알려주기
              </button>
            )}
            <div className="neighbor-profile-actions">
              <button>
                <UserPlus size={18} />
                친구추가
              </button>
              <button onClick={() => openHelpConversation(selectedNeighbor)}>
                <HeartHandshake size={18} />
                도움주기
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
