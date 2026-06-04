import { tabs } from "../data/appData";
import type { Screen } from "../types";

type BottomTabsProps = {
  active: Screen;
  onChange: (screen: Screen) => void;
};

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <nav className="bottom-tabs" aria-label="주요 화면">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            className={isActive ? "active" : ""}
            key={tab.id}
            onClick={() => onChange(tab.id)}
          >
            <Icon size={24} strokeWidth={isActive ? 2.6 : 2.2} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
