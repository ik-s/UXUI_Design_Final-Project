import logoMain from "../../img/Logo_main.png";

type StartPageProps = {
  onStart: () => void;
};

export function StartPage({ onStart }: StartPageProps) {
  return (
    <div className="start-screen">
      <div className="brand-lockup">
        <img src={logoMain} alt="MojiDay" />
        <p>혼자 아픈 순간도, 이모지 하나로 도움 걱정 없이</p>
      </div>
      <div className="start-actions">
        <button className="primary-button" onClick={onStart}>
          시작하기
        </button>
        <button className="text-button" onClick={onStart}>
          <span>이미 계정이 있나요?</span> 로그인
        </button>
      </div>
    </div>
  );
}
