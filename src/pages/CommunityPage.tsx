import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, MessageCircle, PenLine, Send, ThumbsUp, X } from "lucide-react";
import { UserAvatar } from "../components/UserAvatar";
import { communityCategories, communityPosts } from "../data/appData";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import type { ConversationPartner } from "../types";

type CommunityCategory = (typeof communityCategories)[number];
type WritableCommunityCategory = Exclude<CommunityCategory, "전체" | "인기">;

type CommunityPost = {
  author: string;
  body: string;
  category: WritableCommunityCategory;
  createdAt?: string;
  foot: string;
  id?: string;
  meta: string;
  popular: boolean;
  statusEmoji: string;
  tag: WritableCommunityCategory;
  time: string;
  title: string;
};

type CommunityComment = {
  author: string;
  body: string;
  createdAt: string;
  id: number;
  postKey: string;
};

type CommunityPageProps = {
  neighborhood: string;
  onOpenChatList: () => void;
  onOpenConversation: (
    partner: ConversationPartner,
    contextLabel?: string,
    seedMessage?: string,
  ) => void;
};

const writableCategories = communityCategories.filter(
  (category): category is WritableCommunityCategory =>
    category !== "전체" && category !== "인기",
);

const baseCommunityPosts = communityPosts as readonly CommunityPost[];

export function CommunityPage({
  neighborhood,
  onOpenChatList,
  onOpenConversation,
}: CommunityPageProps) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory>("전체");
  const [comments, setComments] = useLocalStorageState<CommunityComment[]>(
    "mojiday:communityComments",
    [],
  );
  const [userPosts, setUserPosts] = useLocalStorageState<CommunityPost[]>(
    "mojiday:communityPosts",
    [],
  );
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composeCategory, setComposeCategory] =
    useState<WritableCommunityCategory>("동네얘기");
  const [composeTitle, setComposeTitle] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const currentNeighborhood = getNeighborhoodName(neighborhood);

  const allPosts = useMemo(
    () => [...userPosts, ...baseCommunityPosts],
    [userPosts],
  );

  const visiblePosts = useMemo(() => {
    if (selectedCategory === "전체") return allPosts;
    if (selectedCategory === "인기") return allPosts.filter((post) => post.popular);
    return allPosts.filter((post) => post.category === selectedCategory);
  }, [allPosts, selectedCategory]);

  const addComment = (post: CommunityPost, body: string, anonymous: boolean) => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setComments((currentComments) => [
      ...currentComments,
      {
        author: anonymous ? "익명" : "나",
        body: trimmed,
        createdAt: new Date().toISOString(),
        id: Date.now(),
        postKey: getPostKey(post),
      },
    ]);
  };

  const submitPost = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = composeTitle.trim();
    const body = composeBody.trim();
    if (!title || !body) return;

    const now = new Date().toISOString();
    const nextPost: CommunityPost = {
      author: "나",
      body,
      category: composeCategory,
      createdAt: now,
      foot: "방금 작성",
      id: `community-post-${Date.now()}`,
      meta: `나 · ${currentNeighborhood}`,
      popular: false,
      statusEmoji: "🙂",
      tag: composeCategory,
      time: "방금",
      title,
    };

    setUserPosts((currentPosts) => [nextPost, ...currentPosts]);
    setSelectedCategory("전체");
    setComposeCategory("동네얘기");
    setComposeTitle("");
    setComposeBody("");
    setIsComposerOpen(false);
  };

  if (view === "detail" && selectedPost) {
    return (
      <PostDetailView
        neighborhood={currentNeighborhood}
        onOpenChatList={onOpenChatList}
        onOpenConversation={onOpenConversation}
        post={selectedPost}
        comments={comments.filter((comment) => comment.postKey === getPostKey(selectedPost))}
        onAddComment={addComment}
        onBack={() => setView("list")}
      />
    );
  }

  return (
    <div className="community-screen tab-screen">
      <header className="community-top">
        <strong>{currentNeighborhood}</strong>
        <button aria-label="진행 중인 1:1 대화 목록" onClick={onOpenChatList}>
          <MessageCircle size={22} />
        </button>
      </header>
      <div className="category-row">
        {communityCategories.map((category) => (
          <button
            className={selectedCategory === category ? "active" : ""}
            key={category}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <section className="post-list">
        {visiblePosts.map((post) => (
          <button
            className="post-card"
            key={getPostKey(post)}
            onClick={() => {
              setSelectedPost(post);
              setView("detail");
            }}
          >
            <span className="post-tag">{post.tag}</span>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            <div className="post-meta">
              <span>{post.meta} · {post.statusEmoji}</span>
              <span>{post.time}</span>
            </div>
          </button>
        ))}
      </section>

      <button className="community-write-button" onClick={() => setIsComposerOpen(true)}>
        <PenLine size={18} />
        글쓰기
      </button>

      {isComposerOpen && (
        <div className="community-compose-backdrop" role="presentation">
          <section className="community-compose-sheet" role="dialog" aria-modal="true">
            <header>
              <div>
                <strong>동네 글 작성</strong>
                <p>제목, 내용, 카테고리를 정해서 커뮤니티에 올릴 수 있어요.</p>
              </div>
              <button aria-label="글 작성 닫기" onClick={() => setIsComposerOpen(false)}>
                <X size={20} />
              </button>
            </header>

            <form onSubmit={submitPost}>
              <label>
                <span>카테고리</span>
                <div className="community-compose-categories">
                  {writableCategories.map((category) => (
                    <button
                      className={composeCategory === category ? "active" : ""}
                      key={category}
                      type="button"
                      onClick={() => setComposeCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </label>

              <label>
                <span>제목</span>
                <input
                  value={composeTitle}
                  maxLength={42}
                  onChange={(event) => setComposeTitle(event.target.value)}
                  placeholder="예: 저녁 산책길 추천해 주세요"
                />
              </label>

              <label>
                <span>내용</span>
                <textarea
                  value={composeBody}
                  maxLength={160}
                  onChange={(event) => setComposeBody(event.target.value)}
                  placeholder="동네 이웃에게 나누고 싶은 내용을 적어주세요."
                />
              </label>

              <button className="community-compose-submit" type="submit">
                글 작성하기
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

function PostDetailView({
  comments,
  neighborhood,
  onAddComment,
  onOpenChatList,
  onOpenConversation,
  post,
  onBack,
}: {
  comments: CommunityComment[];
  neighborhood: string;
  onAddComment: (post: CommunityPost, body: string, anonymous: boolean) => void;
  onOpenChatList: () => void;
  onOpenConversation: (
    partner: ConversationPartner,
    contextLabel?: string,
    seedMessage?: string,
  ) => void;
  post: CommunityPost;
  onBack: () => void;
}) {
  const author = post.author || post.meta.split("·")[0]?.trim() || "익명";
  const [commentBody, setCommentBody] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAddComment(post, commentBody, isAnonymous);
    setCommentBody("");
  };

  return (
    <div className="community-detail-screen tab-screen">
      <header className="post-detail-top">
        <button aria-label="게시글 목록으로 돌아가기" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <strong>{post.tag}</strong>
          <span>{neighborhood}</span>
        </div>
        <button aria-label="대화 열림" onClick={onOpenChatList}>
          <MessageCircle size={22} />
        </button>
      </header>

      <article className="post-detail-body">
        <section className="post-author-row">
          <UserAvatar size="small" />
          <div>
            <strong>{author}</strong>
            <span>{post.time}</span>
          </div>
        </section>

        <strong className="post-detail-title">{post.title}</strong>
        <p>{post.body}</p>

        <div className="post-detail-actions">
          <button>
            <ThumbsUp size={18} />
            공감
          </button>
          <button>
            <MessageCircle size={18} />
            댓글
          </button>
          <button
            onClick={() =>
              onOpenConversation(
                {
                  id: `community-${author}`,
                  name: author,
                  statusEmoji: post.statusEmoji,
                  statusLabel: post.tag,
                },
                post.title,
                post.body,
              )
            }
          >
            <MessageCircle size={18} />
            대화하기
          </button>
        </div>
      </article>

      {comments.length > 0 ? (
        <section className="post-comments-list">
          {comments.map((comment) => (
            <article key={comment.id}>
              <header>
                <strong>{comment.author}</strong>
                <time>{formatCommentTime(comment.createdAt)}</time>
              </header>
              <p>{comment.body}</p>
            </article>
          ))}
        </section>
      ) : (
        <section className="post-comments-empty">
          <MessageCircle size={46} />
          <p>첫 댓글을 남겨주세요.</p>
        </section>
      )}

      <form className="comment-composer" onSubmit={submitComment}>
        <label>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => setIsAnonymous(event.target.checked)}
          />
          익명
        </label>
        <input
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          placeholder="댓글을 입력하세요"
        />
        <button type="submit" aria-label="댓글 보내기">
          <Send size={22} />
        </button>
      </form>
    </div>
  );
}

function getNeighborhoodName(neighborhood: string) {
  return neighborhood || "동네 미설정";
}

function getPostKey(post: CommunityPost) {
  return post.id || `${post.author}-${post.title}`;
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ko-KR", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
}
