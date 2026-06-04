import { useState } from "react";

type PhonePageProps = {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
};

export function PhonePage({ value, onChange, onNext }: PhonePageProps) {
  const [showToast, setShowToast] = useState(false);

  const handleChange = (nextValue: string) => {
    const digits = nextValue.replace(/\D/g, "").slice(0, 11);
    onChange(formatPhoneNumber(digits));
  };

  const handleVerify = () => {
    setShowToast(true);
    window.setTimeout(() => {
      setShowToast(false);
      onNext();
    }, 850);
  };

  return (
    <div className="form-screen phone-screen">
      {showToast && <div className="top-toast">인증이 완료되었습니다!</div>}
      <h1>휴대폰 번호를 인증해주세요.</h1>
      <p>
        MojiDay는 휴대폰 번호로 가입해요. 번호는 안전하게 보관되며 어디에도
        공개되지 않아요.
      </p>
      <input
        className="outline-input"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        inputMode="tel"
        placeholder="010-0000-0000"
        aria-label="휴대폰 번호"
      />
      <button className="primary-button" onClick={handleVerify}>
        인증문자 받기
      </button>
    </div>
  );
}

function formatPhoneNumber(value: string) {
  if (value.length <= 3) return value;
  if (value.length <= 7) return `${value.slice(0, 3)}-${value.slice(3)}`;
  return `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
}
