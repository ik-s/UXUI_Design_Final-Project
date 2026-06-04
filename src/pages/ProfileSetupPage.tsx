import { Camera } from "lucide-react";
import { useRef } from "react";
import { UserAvatar } from "../components/UserAvatar";

type ProfileSetupPageProps = {
  value: string;
  profileImage: string;
  onChange: (value: string) => void;
  onProfileImageChange: (value: string) => void;
  onNext: () => void;
};

export function ProfileSetupPage({
  value,
  profileImage,
  onChange,
  onProfileImageChange,
  onNext,
}: ProfileSetupPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onProfileImageChange(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="form-screen profile-setup-screen">
      <h1>프로필을 설정해주세요.</h1>
      <p>나를 나타내는 프로필 사진과 닉네임으로 등록하면 이웃들이 안심할 수 있어요.</p>
      <div className="thin-line" />
      <div className="avatar-edit">
        <button className="avatar-upload-target" onClick={openFilePicker} aria-label="프로필 사진 선택">
          <UserAvatar size="large" src={profileImage} />
        </button>
        <button className="avatar-camera-button" onClick={openFilePicker} aria-label="프로필 사진 선택">
          <Camera size={28} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event.target.files?.[0])}
        />
      </div>
      <input
        className="outline-input nickname-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="닉네임"
        aria-label="닉네임"
      />
      <p className="input-help">닉네임을 입력해주세요.</p>
      <button className="primary-button sticky-next" onClick={onNext}>
        다음
      </button>
    </div>
  );
}
