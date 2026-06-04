import { useState } from "react";
import { ChevronLeft, ChevronRight, HeartHandshake, MapPin, MessageCircle } from "lucide-react";
import { guideSteps } from "../data/appData";

type GuidePageProps = {
  onNext: () => void;
};

export function GuidePage({ onNext }: GuidePageProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = guideSteps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === guideSteps.length - 1;

  const moveNext = () => {
    if (isLastStep) {
      onNext();
      return;
    }

    setStepIndex((index) => index + 1);
  };

  return (
    <div className="guide-screen guide-carousel-screen">
      <div className="guide-title">
        <span>MojiDay 사용 설명서</span>
        <h1>{currentStep.title}</h1>
        <p>{currentStep.body}</p>
      </div>

      <GuidePreview type={currentStep.preview} />

      <div className="guide-pagination" aria-label="설명서 진행 단계">
        {guideSteps.map((step, index) => (
          <span className={index === stepIndex ? "active" : ""} key={step.id} />
        ))}
      </div>

      <div className="guide-actions">
        {!isFirstStep && (
          <button className="secondary-button" onClick={() => setStepIndex((index) => index - 1)}>
            <ChevronLeft size={18} />
            이전
          </button>
        )}
        <button className="primary-button" onClick={moveNext}>
          {isLastStep ? "시작하기" : "다음"}
          {!isLastStep && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  );
}

function GuidePreview({ type }: { type: (typeof guideSteps)[number]["preview"] }) {
  if (type === "neighbors") {
    return (
      <section className="guide-preview-card guide-neighbor-preview">
        <header>
          <strong>주변 이웃 목록</strong>
          <span>송파구 문정동</span>
        </header>
        {[
          ["🙂", "환스", "조금 불안해요", "방금"],
          ["😟", "오우우", "확인이 필요해요", "12분 전"],
        ].map(([emoji, name, status, time]) => (
          <article key={name}>
            <span>{emoji}</span>
            <div>
              <strong>{name}</strong>
              <p>{status}</p>
            </div>
            <time>{time}</time>
          </article>
        ))}
      </section>
    );
  }

  if (type === "map") {
    return (
      <section className="guide-preview-card guide-map-preview">
        <header>
          <strong>내 위치 직접 설정</strong>
          <button>1km</button>
        </header>
        <div className="guide-map-canvas">
          <span className="guide-map-radius" />
          <MapPin className="guide-map-pin" size={34} />
          <span className="guide-facility-marker">+</span>
          <span className="guide-facility-marker second">+</span>
        </div>
        <button>주변 의료 시설 확인하기</button>
      </section>
    );
  }

  if (type === "community") {
    return (
      <section className="guide-preview-card guide-community-preview">
        <header>
          <strong>커뮤니티</strong>
          <MessageCircle size={20} />
        </header>
        <article>
          <span>벌레 퇴치 요청</span>
          <strong>벌레 잡아주세요 제발요</strong>
          <p>오우우 · 화양동 · 😟</p>
        </article>
        <button>
          <MessageCircle size={17} />
          1:1 대화하기
        </button>
      </section>
    );
  }

  if (type === "profile") {
    return (
      <section className="guide-preview-card guide-profile-preview">
        <header>
          <strong>나의 도움 온도</strong>
          <span>활동 신뢰도</span>
        </header>
        <b>36.8°C</b>
        <div>
          <span>도와준 3회</span>
          <span>고마워요 5개</span>
        </div>
        <button>
          <HeartHandshake size={17} />
          포인트로 기프티콘 교환
        </button>
      </section>
    );
  }

  return (
    <section className="guide-preview-card guide-status-preview">
      <header>
        <strong>오늘의 안부</strong>
        <span>상태 추가</span>
      </header>
      <div className="guide-status-compose-mini">
        <span className="guide-face">🙂</span>
        <div>
          <strong>지금의 상태를 기록하세요!</strong>
          <p>조금 불안해요</p>
        </div>
      </div>
      <p className="guide-preview-caption">말하기 어려운 순간도 이모지로 먼저 전해요.</p>
    </section>
  );
}
