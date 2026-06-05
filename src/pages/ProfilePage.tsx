import { useRef, useState, type ReactNode } from "react";
import { Award, CalendarDays, Camera, ChevronRight, Store, Users, X } from "lucide-react";
import { UserAvatar } from "../components/UserAvatar";
import { praiseBadges, profileStats, recentHelpHistory } from "../data/appData";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import type { ConversationPartner, ProfileView, StatusHistoryItem } from "../types";
import { FriendListPage } from "./FriendListPage";
import { PointShopPage } from "./PointShopPage";

type ProfilePageProps = {
  nickname: string;
  onFriendAdded?: (friendName: string) => void;
  onNicknameChange: (value: string) => void;
  onOpenFriendConversation?: (
    friend: ConversationPartner,
    contextLabel?: string,
    seedMessage?: string,
  ) => void;
  onPointExchange?: (giftName: string, point: number) => void;
  onProfileImageChange: (value: string) => void;
  onProfileViewChange: (view: ProfileView) => void;
  profileImage: string;
  profileView: ProfileView;
  neighborhood: string;
  statusHistory: StatusHistoryItem[];
};

export function ProfilePage({
  nickname,
  onFriendAdded,
  onNicknameChange,
  onOpenFriendConversation,
  onPointExchange,
  onProfileImageChange,
  onProfileViewChange,
  profileImage,
  profileView,
  neighborhood,
  statusHistory,
}: ProfilePageProps) {
  const [helpHistory] = useLocalStorageState("mojiday:helpHistory", recentHelpHistory);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingNickname, setEditingNickname] = useState(nickname);
  const [editingProfileImage, setEditingProfileImage] = useState(profileImage);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recentStatusDays = buildRecentStatusDays(statusHistory);

  const openProfileEdit = () => {
    setEditingNickname(nickname);
    setEditingProfileImage(profileImage);
    setIsEditOpen(true);
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setEditingProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const nextNickname = editingNickname.trim();
    if (nextNickname) onNicknameChange(nextNickname);
    onProfileImageChange(editingProfileImage);
    setIsEditOpen(false);
  };

  if (profileView === "pointShop") {
    return (
      <PointShopPage
        onBack={() => onProfileViewChange("profile")}
        onPointExchange={onPointExchange}
      />
    );
  }

  if (profileView === "friends") {
    return (
      <FriendListPage
        onBack={() => onProfileViewChange("profile")}
        onFriendAdded={onFriendAdded}
        onOpenConversation={onOpenFriendConversation}
      />
    );
  }

  return (
    <div className="profile-screen tab-screen">
      <header className="profile-top">
        <h1>나의 프로필</h1>
        <Award size={27} />
      </header>
      <section className="profile-summary">
        <UserAvatar size="medium" src={profileImage} />
        <div>
          <strong>{nickname}</strong>
          <p>{neighborhood || "위치 미설정"} #상태공유</p>
        </div>
        <button className="profile-edit-trigger" aria-label="프로필 수정" onClick={openProfileEdit}>
          <ChevronRight size={28} />
        </button>
      </section>
      <div className="profile-actions">
        <ProfileAction
          icon={<Store size={36} />}
          label="포인트 상점"
          onClick={() => onProfileViewChange("pointShop")}
        />
        <ProfileAction
          icon={<Users size={36} />}
          label="친구 목록"
          onClick={() => onProfileViewChange("friends")}
        />
        <ProfileAction icon={<Award size={36} />} label="내 배지" />
      </div>
      <section className="profile-content">
        <article className="help-temperature-card">
          <div className="profile-section-heading">
            <strong>나의 도움 온도</strong>
            <span>활동 신뢰도</span>
          </div>
          <div className="temperature-main">
            <strong>{profileStats.helpTemperature.toFixed(1)}°C</strong>
            <p>도움을 주고받을수록 온도와 기록이 함께 쌓여요.</p>
          </div>
          <div className="temperature-metrics">
            <span>
              <b>{profileStats.helpedCount}회</b>
              도움 준 횟수
            </span>
            <span>
              <b>{profileStats.receivedHelpCount}회</b>
              받은 도움
            </span>
            <span>
              <b>{profileStats.thanksCount}개</b>
              받은 고마워요
            </span>
          </div>
        </article>

        <section className="help-history-section">
          <div className="profile-section-heading">
            <strong>최근 도움 내역</strong>
            <button>전체보기 &gt;</button>
          </div>
          <div className="help-history-list">
            {helpHistory.map((item) => (
              <article className="help-history-item" key={item.id}>
                <span>{item.icon}</span>
                <p>{item.title}</p>
                <strong>+{item.point}P</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="praise-badge-section">
          <div className="profile-section-heading">
            <strong>받은 칭찬</strong>
            <span>이웃들이 남긴 신뢰 표시</span>
          </div>
          <div className="praise-badge-list">
            {praiseBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </section>

        <section className="status-calendar-section">
          <div className="profile-section-heading">
            <strong>감정 기록 달력</strong>
            <span>최근 2주</span>
          </div>
          <div className="status-calendar-grid" aria-label="최근 감정 기록">
            {recentStatusDays.map((day) => (
              <article className={day.entry ? "has-entry" : ""} key={day.date}>
                <span>{day.label}</span>
                <strong>{day.entry?.emoji || "·"}</strong>
                <p>{day.entry?.label || "기록 없음"}</p>
              </article>
            ))}
          </div>
          {statusHistory[0] ? (
            <div className="latest-status-note">
              <CalendarDays size={18} />
              <p>
                최근 기록: <b>{statusHistory[0].emoji} {statusHistory[0].label}</b>
                <br />
                {statusHistory[0].message}
              </p>
            </div>
          ) : (
            <div className="latest-status-note">
              <CalendarDays size={18} />
              <p>홈에서 오늘 상태를 남기면 이곳에 기록돼요.</p>
            </div>
          )}
        </section>
      </section>

      {isEditOpen && (
        <div className="profile-edit-backdrop" role="presentation">
          <section className="profile-edit-sheet" role="dialog" aria-modal="true">
            <header>
              <div>
                <strong>프로필 수정</strong>
                <p>닉네임과 프로필 사진을 바꿀 수 있어요.</p>
              </div>
              <button aria-label="닫기" onClick={() => setIsEditOpen(false)}>
                <X size={20} />
              </button>
            </header>

            <div className="profile-edit-avatar">
              <button aria-label="프로필 사진 변경" onClick={() => fileInputRef.current?.click()}>
                <UserAvatar size="large" src={editingProfileImage} />
                <span>
                  <Camera size={22} />
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
            </div>

            <label className="profile-edit-field">
              <span>닉네임</span>
              <input
                value={editingNickname}
                onChange={(event) => setEditingNickname(event.target.value)}
                placeholder="닉네임"
              />
            </label>

            <button className="profile-edit-save" onClick={saveProfile}>
              저장하기
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function ProfileAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button onClick={onClick}>
      <span>{icon}</span>
      {label}
    </button>
  );
}

function buildRecentStatusDays(statusHistory: StatusHistoryItem[]) {
  const byDate = new Map(statusHistory.map((item) => [item.date, item]));
  const today = new Date();

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (13 - index));
    const key = toDateKey(date);

    return {
      date: key,
      entry: byDate.get(key),
      label: formatDayLabel(date),
    };
  });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayLabel(date: Date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
