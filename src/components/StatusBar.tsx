export function StatusBar() {
  return (
    <div className="status-bar" aria-hidden="true">
      <span>9:41</span>
      <div className="notch" />
      <div className="system-icons">
        <span className="signal">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="wifi" />
        <span className="battery" />
      </div>
    </div>
  );
}
