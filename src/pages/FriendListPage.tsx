import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  MessageCircle,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { mockFriends, mockSearchUsers, visibilityOptions } from "../data/appData";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import type { ConversationPartner } from "../types";

type VisibilityLevel = (typeof visibilityOptions)[number]["value"];

type Friend = {
  avatar: string;
  currentMood: string;
  id: number;
  locationLabel?: string;
  name: string;
  statusMessage: string;
  userTag: string;
  visibilityLevel: VisibilityLevel;
};

type SearchUser = (typeof mockSearchUsers)[number];

type FriendListState = {
  defaultFriendVisibility: VisibilityLevel;
  friends: Friend[];
};

type FriendListPageProps = {
  onFriendAdded?: (friendName: string) => void;
  onBack: () => void;
  onOpenConversation?: (friend: ConversationPartner) => void;
};

const visibilityCopy: Record<VisibilityLevel, string> = {
  detailLocation: "상세 위치까지 공개",
  emoji: "이모지만 공개",
  roughLocation: "동네 정도만 공개",
  status: "상태 메시지까지 공개",
};

export function FriendListPage({
  onBack,
  onFriendAdded,
  onOpenConversation,
}: FriendListPageProps) {
  const [friendState, setFriendState] = useLocalStorageState<FriendListState>(
    "mojiday:friendList",
    {
      defaultFriendVisibility: "status",
      friends: mockFriends as Friend[],
    },
  );
  const [query, setQuery] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [pendingAddUser, setPendingAddUser] = useState<SearchUser | null>(null);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [selectedVisibility, setSelectedVisibility] = useState<VisibilityLevel>("status");
  const [menuFriend, setMenuFriend] = useState<Friend | null>(null);
  const [deleteFriend, setDeleteFriend] = useState<Friend | null>(null);
  const [toastMessage, setToastMessage] = useState("");

  const currentVisibilityLabel = visibilityCopy[friendState.defaultFriendVisibility];

  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return mockSearchUsers;

    return mockSearchUsers.filter((user) => {
      const target = `${user.name} ${user.userTag} ${user.phone}`.toLowerCase();
      return target.includes(trimmed);
    });
  }, [query]);

  const saveToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(""), 1600);
  };

  const addFriend = () => {
    if (!pendingAddUser) return;

    const nextFriend: Friend = {
      ...pendingAddUser,
      locationLabel: "친구가 설정한 위치",
      visibilityLevel: friendState.defaultFriendVisibility,
    };

    setFriendState({
      ...friendState,
      friends: [nextFriend, ...friendState.friends],
    });
    setPendingAddUser(null);
    setShowAddPanel(false);
    setQuery("");
    onFriendAdded?.(nextFriend.name);
    saveToast("친구로 추가했어요.");
  };

  const openVisibilitySheet = (friend: Friend) => {
    setMenuFriend(null);
    setEditingFriend(friend);
    setSelectedVisibility(friend.visibilityLevel);
  };

  const saveVisibility = () => {
    if (!editingFriend) return;

    setFriendState({
      ...friendState,
      friends: friendState.friends.map((friend) =>
        friend.id === editingFriend.id
          ? { ...friend, visibilityLevel: selectedVisibility }
          : friend,
      ),
    });
    setEditingFriend(null);
    saveToast("공개 범위가 저장되었어요.");
  };

  const removeFriend = () => {
    if (!deleteFriend) return;

    setFriendState({
      ...friendState,
      friends: friendState.friends.filter((friend) => friend.id !== deleteFriend.id),
    });
    setDeleteFriend(null);
    setMenuFriend(null);
    saveToast("친구 목록에서 삭제했어요.");
  };

  const hideFriend = (friendToHide: Friend) => {
    setFriendState({
      ...friendState,
      friends: friendState.friends.filter((friend) => friend.id !== friendToHide.id),
    });
    setMenuFriend(null);
    saveToast("친구를 숨겼어요.");
  };

  const updateDefaultVisibility = () => {
    const currentIndex = visibilityOptions.findIndex(
      (option) => option.value === friendState.defaultFriendVisibility,
    );
    const nextOption = visibilityOptions[(currentIndex + 1) % visibilityOptions.length];

    setFriendState({
      ...friendState,
      defaultFriendVisibility: nextOption.value,
    });
    saveToast("기본 공개 범위가 변경되었어요.");
  };

  return (
    <div className="friend-list-screen tab-screen">
      {toastMessage && <div className="friend-toast">{toastMessage}</div>}
      <header className="friend-list-top">
        <button aria-label="프로필로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <strong>친구 목록</strong>
          <span>직접 추가한 친구에게만 더 자세한 상태를 공유할 수 있어요.</span>
        </div>
        <button aria-label="친구 추가" onClick={() => setShowAddPanel(true)}>
          <Plus size={24} />
        </button>
      </header>

      <section className="friend-privacy-card">
        <LockKeyhole size={26} />
        <div>
          <strong>내 친구 {friendState.friends.length}명</strong>
          <p>친구에게 공개 중인 정보: {currentVisibilityLabel}</p>
          <span>이웃에게는 최소 정보만, 친구에게는 내가 선택한 정보만 보여줘요.</span>
        </div>
      </section>

      <button className="default-visibility-button" onClick={updateDefaultVisibility}>
        <ShieldCheck size={18} />
        기본 공개 범위 설정 · {currentVisibilityLabel}
      </button>

      <section className="friend-search-card">
        <label>
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowAddPanel(true);
            }}
            onFocus={() => setShowAddPanel(true)}
            placeholder="닉네임, 전화번호, 유저태그로 친구를 찾아보세요"
          />
        </label>
      </section>

      <section className="friend-card-list">
        {friendState.friends.map((friend) => (
          <article className="friend-card" key={friend.id}>
            <span className="friend-avatar">{friend.avatar}</span>
            <div>
              <strong>{friend.name}</strong>
              <small>{friend.userTag}</small>
              <p>
                {friend.currentMood} {friend.statusMessage}
              </p>
              <em>공개 범위: {visibilityCopy[friend.visibilityLevel]}</em>
            </div>
            <button aria-label={`${friend.name} 친구 메뉴`} onClick={() => setMenuFriend(friend)}>
              <MoreHorizontal size={22} />
            </button>
            <button
              className="friend-chat-button"
              onClick={() =>
                onOpenConversation?.({
                  avatar: friend.avatar,
                  id: `friend-${friend.id}`,
                  locationLabel: friend.locationLabel,
                  name: friend.name,
                  statusEmoji: friend.currentMood,
                  statusLabel: friend.statusMessage,
                  userTag: friend.userTag,
                })
              }
            >
              <MessageCircle size={16} />
              대화
            </button>
          </article>
        ))}
      </section>

      {showAddPanel && (
        <div className="friend-modal-backdrop" role="presentation">
          <section className="friend-add-sheet" role="dialog" aria-modal="true">
            <header>
              <strong>친구 추가</strong>
              <button onClick={() => setShowAddPanel(false)} aria-label="친구 추가 닫기">
                <X size={20} />
              </button>
            </header>
            <label>
              <Search size={18} />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="닉네임, 전화번호, 유저태그로 검색"
              />
            </label>
            <div className="friend-search-results">
              {searchResults.length > 0 ? (
                searchResults.map((user) => {
                  const alreadyFriend = friendState.friends.some(
                    (friend) => friend.id === user.id || friend.userTag === user.userTag,
                  );

                  return (
                    <article key={user.id}>
                      <span>{user.avatar}</span>
                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.userTag}</small>
                        <p>
                          {user.currentMood} {user.statusMessage}
                        </p>
                      </div>
                      <button disabled={alreadyFriend} onClick={() => setPendingAddUser(user)}>
                        {alreadyFriend ? "이미 친구" : "친구 추가"}
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="friend-empty-state">
                  <UserPlus size={38} />
                  <strong>찾는 친구가 없어요.</strong>
                  <p>닉네임이나 유저태그를 다시 확인해 주세요.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {pendingAddUser && (
        <ConfirmDialog
          cancelLabel="취소"
          confirmLabel="친구 추가"
          description="친구가 되면 내가 설정한 범위 안에서 상태 정보를 공유할 수 있어요."
          title={`${pendingAddUser.name}님을 친구로 추가할까요?`}
          onCancel={() => setPendingAddUser(null)}
          onConfirm={addFriend}
        />
      )}

      {editingFriend && (
        <div className="friend-modal-backdrop" role="presentation">
          <section className="visibility-sheet" role="dialog" aria-modal="true">
            <header>
              <div>
                <strong>{editingFriend.name}에게 보여줄 정보</strong>
                <p>친구에게도 내가 선택한 정보만 공개돼요.</p>
              </div>
              <button aria-label="공개 범위 닫기" onClick={() => setEditingFriend(null)}>
                <X size={20} />
              </button>
            </header>
            <div className="visibility-option-list">
              {visibilityOptions.map((option) => (
                <button
                  className={selectedVisibility === option.value ? "selected" : ""}
                  key={option.value}
                  onClick={() => setSelectedVisibility(option.value)}
                >
                  <span>{selectedVisibility === option.value && <Check size={16} />}</span>
                  <div>
                    <strong>{option.label}</strong>
                    <p>{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="visibility-warning">
              상세 주소는 가까운 친구에게만 공개하는 것을 추천해요.
            </p>
            <button className="visibility-save-button" onClick={saveVisibility}>
              저장하기
            </button>
          </section>
        </div>
      )}

      {menuFriend && (
        <div className="friend-modal-backdrop" role="presentation">
          <section className="friend-menu-sheet" role="dialog" aria-modal="true">
            <strong>{menuFriend.name}</strong>
            <button
              onClick={() => {
                onOpenConversation?.({
                  avatar: menuFriend.avatar,
                  id: `friend-${menuFriend.id}`,
                  locationLabel: menuFriend.locationLabel,
                  name: menuFriend.name,
                  statusEmoji: menuFriend.currentMood,
                  statusLabel: menuFriend.statusMessage,
                  userTag: menuFriend.userTag,
                });
                setMenuFriend(null);
              }}
            >
              대화하기
            </button>
            <button onClick={() => openVisibilitySheet(menuFriend)}>공개 범위 설정</button>
            <button onClick={() => hideFriend(menuFriend)}>친구 숨기기</button>
            <button
              className="danger"
              onClick={() => {
                setDeleteFriend(menuFriend);
                setMenuFriend(null);
              }}
            >
              <Trash2 size={17} />
              친구 삭제
            </button>
            <button onClick={() => setMenuFriend(null)}>닫기</button>
          </section>
        </div>
      )}

      {deleteFriend && (
        <ConfirmDialog
          cancelLabel="취소"
          confirmLabel="삭제하기"
          description="삭제하면 친구 목록에서 더 이상 보이지 않아요."
          title="이 친구를 목록에서 삭제할까요?"
          onCancel={() => setDeleteFriend(null)}
          onConfirm={removeFriend}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  cancelLabel,
  confirmLabel,
  description,
  title,
  onCancel,
  onConfirm,
}: {
  cancelLabel: string;
  confirmLabel: string;
  description: string;
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="friend-modal-backdrop" role="presentation">
      <section className="friend-confirm-sheet" role="dialog" aria-modal="true">
        <strong>{title}</strong>
        <p>{description}</p>
        <div>
          <button onClick={onCancel}>{cancelLabel}</button>
          <button onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}
