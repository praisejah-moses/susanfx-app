import React from "react";

interface DashboardTopBarProps {
  title: string;
  subtitle?: string;
  onSidebarToggle: (open: boolean) => void;
  balance?: number;
  actions?: React.ReactNode;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}

export default function DashboardTopBar({
  title,
  subtitle,
  onSidebarToggle,
  balance = 0,
  actions,
}: DashboardTopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-(--background-default)/95 backdrop-blur border-b border-(--border-normal) px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
      {/* Mobile menu button */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-1 shrink-0"
        onClick={() => onSidebarToggle(true)}
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
        <span className="block w-5 h-0.5 bg-white" />
      </button>

      {/* Page title and subtitle */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base md:text-lg font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-xs text-(--text-white-50) hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right section: Balance, Notification, Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Balance display */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-xs text-(--text-white-50) hidden sm:inline">
            Balance
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-400">
            {fmt(balance)}
          </span>
        </div>

        {/* Notification bell */}
        <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-(--text-white-50) hover:text-(--global-text)"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
        </button>

        {/* Custom actions */}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
