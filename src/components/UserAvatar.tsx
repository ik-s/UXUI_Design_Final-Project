import profileIcon from "../../img/profile-user-account-svgrepo-com.svg";

type UserAvatarProps = {
  size: "small" | "medium" | "large";
  src?: string;
};

export function UserAvatar({ size, src }: UserAvatarProps) {
  return (
    <span className={`user-avatar user-avatar-${size}`} aria-hidden="true">
      <img className={src ? "uploaded-avatar" : ""} src={src || profileIcon} alt="" />
    </span>
  );
}
