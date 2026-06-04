type ManualLocationPanelProps = {
  isAddressLoading: boolean;
  isSubmitDisabled: boolean;
  onSubmit: () => void;
};

export function ManualLocationPanel({
  isAddressLoading,
  isSubmitDisabled,
  onSubmit,
}: ManualLocationPanelProps) {
  return (
    <section className="manual-location-panel" aria-label="위치 확정">
      <button
        className="primary-button set-location-button"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
      >
        {isAddressLoading ? "주소 확인 중" : "이 위치로 설정"}
      </button>
    </section>
  );
}
