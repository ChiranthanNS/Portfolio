"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "../lib/utils";

export type PillTab<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type PillTabsProps<T extends string> = {
  tabs: readonly PillTab<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  label: string;
  idPrefix: string;
};

export function PillTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  label,
  idPrefix,
}: PillTabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="border-border bg-surface mx-auto mb-8 flex w-full max-w-md flex-wrap gap-1 rounded-2xl border p-1.5 sm:w-fit sm:max-w-full sm:rounded-full sm:p-1"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={isActive}
            aria-controls={`${idPrefix}-panel-${tab.id}`}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 py-2 font-mono text-xs transition-all duration-150 sm:flex-none",
              isActive
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-surface-2",
            )}
          >
            <Icon className="size-3.5 shrink-0" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
