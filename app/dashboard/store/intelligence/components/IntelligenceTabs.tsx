"use client";

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
}: {
  tabs: TabItem[];
  activeTab: number;
  onChange: (index: number) => void;
}) {
  const active = tabs[activeTab];

  return (
    <div className="rounded-[2rem] border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-4 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab, index) => {
            const isActive = index === activeTab;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onChange(index)}
                className={cx(
                  "rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition",
                  isActive
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                )}
              >
                <span className="hidden lg:inline">{tab.label}</span>
                <span className="lg:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          <span className="font-semibold text-zinc-900">{active.label}</span>
          <span className="ml-2">{active.description}</span>
        </div>
      </div>
    </div>
  );
}