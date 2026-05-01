"use client";

import { useRef } from "react";
import { getSwipeTabDirection } from "../utils/mobileInteractions";

type TabItem = {
  key: string;
  label: string;
  shortLabel: string;
  description: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function IntelligenceTabs({
  tabs,
  activeTab,
  onChange,
  children,
}: {
  tabs: TabItem[];
  activeTab: number;
  onChange: (index: number) => void;
  children: React.ReactNode;
}) {
  const active = tabs[activeTab];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function focusAndSelect(nextIndex: number) {
    tabRefs.current[nextIndex]?.focus();
    onChange(nextIndex);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, tabIndex: number) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusAndSelect(Math.max(tabIndex - 1, 0));
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusAndSelect(Math.min(tabIndex + 1, tabs.length - 1));
        break;
      case "Home":
        event.preventDefault();
        focusAndSelect(0);
        break;
      case "End":
        event.preventDefault();
        focusAndSelect(tabs.length - 1);
        break;
      default:
        break;
    }
  }

  function isInteractiveTarget(target: EventTarget | null) {
    return target instanceof HTMLElement
      ? Boolean(target.closest("button, input, select, textarea, a, [role='button'], [role='checkbox'], [role='radio']"))
      : false;
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (isInteractiveTarget(event.target)) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchStartRef.current || isInteractiveTarget(event.target)) {
      touchStartRef.current = null;
      return;
    }

    const touch = event.changedTouches[0];
    const direction = getSwipeTabDirection(
      touchStartRef.current.x,
      touchStartRef.current.y,
      touch.clientX,
      touch.clientY
    );
    touchStartRef.current = null;

    if (direction === 1 && activeTab < tabs.length - 1) {
      onChange(activeTab + 1);
    }

    if (direction === -1 && activeTab > 0) {
      onChange(activeTab - 1);
    }
  }

  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-4 sm:px-6">
        <div
          role="tablist"
          aria-label="Etapas da intelligence calibration"
          className="flex flex-wrap gap-2 sm:flex-nowrap sm:overflow-x-auto"
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeTab;

            return (
              <button
                id={`intelligence-tab-${tab.key}`}
                key={tab.key}
                type="button"
                role="tab"
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                aria-selected={isActive}
                aria-controls={`intelligence-panel-${tab.key}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                className={cx(
                  "min-h-12 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition sm:px-4",
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                <span className="hidden sm:inline lg:hidden">{tab.shortLabel}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden lg:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600" aria-live="polite">
          <span className="font-semibold text-zinc-900">{active.label}</span>
          <span className="ml-2">{active.description}</span>
        </div>
      </div>

      <div
        id={`intelligence-panel-${active.key}`}
        role="tabpanel"
        aria-labelledby={`intelligence-tab-${active.key}`}
        className="px-4 pb-5 sm:px-6 sm:pb-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}