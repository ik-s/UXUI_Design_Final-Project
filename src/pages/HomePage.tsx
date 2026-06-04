import { useState } from "react";
import { Bell, HeartHandshake, Plus, UserPlus, X } from "lucide-react";
import logoText from "../../img/logo 1.svg";
import { UserAvatar } from "../components/UserAvatar";
import { homeStatuses, statusItems } from "../data/appData";
import type { ConversationPartner } from "../types";

type HomePageProps = {
  nickname: string;
  neighborhood: string;
  profileImage: string;
  statusEmoji: string;
  statusLabel: string;
  onStatusChange: (emoji: string, label: string) => void;
  onOpenConversation: (
    partner: ConversationPartner,
    contextLabel?: string,
    seedMessage?: string,
  ) => void;
  onOpenNotifications: () => void;
};

export function HomePage({
  nickname,
  neighborhood,
  profileImage,
  statusEmoji,
  statusLabel,
  onOpenConversation,
  onOpenNotifications,
  onStatusChange,
}: HomePageProps) {
  const [isStatusPickerOpen, setIsStatusPickerOpen] = useState(false);
  const [selectedNeighbor, setSelectedNeighbor] = useState<(typeof homeStatuses)[number] | null>(
    null,
  );
  const currentStatus = statusItems.find((item) => item.label === statusLabel) ?? statusItems[1];
  const [selectedStatus, setSelectedStatus] = useState(() => {
    return currentStatus;
  });

  const saveStatus = () => {
    onStatusChange(selectedStatus.emoji, selectedStatus.label);
    setIsStatusPickerOpen(false);
  };

  return (
    <div className="home-screen tab-screen">
      <header className="top-brand">
        <img src={logoText} alt="MojiDay" />
        <button aria-label="알림" onClick={onOpenNotifications}>
          <Bell size={20} />
        </button>
      </header>
      <section className="status-compose">
        <UserAvatar size="medium" src={profileImage} />
        <div>
          <span>{nickname}님의 오늘 안부</span>
          <strong>지금의 상태를 기록하세요!</strong>
        </div>
        <button
          className={
            statusLabel
              ? `add-status has-status status-face status-face-${currentStatus.tone}`
              : "add-status"
          }
          aria-label="상태 추가"
          onClick={() => {
            setSelectedStatus(currentStatus);
            setIsStatusPickerOpen(true);
          }}
        >
          {statusLabel ? statusEmoji : <Plus size={30} />}
        </button>
      </section>
      <div className="status-placeholder">
        <span className={`status-face status-face-${currentStatus.tone}`}>{statusEmoji}</span>
        <div>
          <strong>{statusLabel}</strong>
          <p>{currentStatus.desc}</p>
        </div>
      </div>
      <section className="feed-header">
        <div className="feed-location-row">
          <strong>{neighborhood || "동네명"}</strong>
          <span>주변 이웃 목록</span>
        </div>
      </section>
      <div className="home-feed">
        {homeStatuses.map((item) => (
          <article className="status-row" key={item.name}>
            <UserAvatar size="small" />
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
          </article>
        ))}
      </div>

      {isStatusPickerOpen && (
        <div className="status-picker-backdrop" role="dialog" aria-modal="true">
          <section className="status-picker-sheet">
            <header>
              <div>
                <strong>오늘의 상태를 골라주세요</strong>
                <p>이모지 하나로 지금의 안부를 남길 수 있어요.</p>
              </div>
              <button aria-label="닫기" onClick={() => setIsStatusPickerOpen(false)}>
                <X size={22} />
              </button>
            </header>

            <div className="status-picker-options">
              {statusItems.map((item) => (
                <button
                  className={selectedStatus.label === item.label ? "selected" : ""}
                  key={item.label}
                  onClick={() => setSelectedStatus(item)}
                >
                  <span className={`status-face status-face-${item.tone}`}>{item.emoji}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <button className="primary-button" onClick={saveStatus}>
              이 상태로 기록하기
            </button>
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
              남에게 도움을 준 횟수 <b>{selectedNeighbor.helpCount}회</b>
            </div>
            <div className="neighbor-profile-actions">
              <button>
                <UserPlus size={18} />
                친구추가
              </button>
              <button
                onClick={() => {
                  onOpenConversation(
                    {
                      helpCount: selectedNeighbor.helpCount,
                      id: `neighbor-${selectedNeighbor.name}`,
                      name: selectedNeighbor.name,
                      statusEmoji: selectedNeighbor.face,
                      statusLabel: selectedNeighbor.state,
                    },
                    selectedNeighbor.state,
                    selectedNeighbor.desc,
                  );
                  setSelectedNeighbor(null);
                }}
              >
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
