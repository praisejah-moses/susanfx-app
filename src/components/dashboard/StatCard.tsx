interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  subtext,
  trend,
  trendValue,
  icon,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
        ? "text-red-400"
        : "text-(--text-white-50)";

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "";

  return (
    <div className="bg-(--background-card) border border-(--border-normal) rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-(--text-white-50) uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-(--primary-default) opacity-80">{icon}</span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold text-(--global-text)">{value}</p>
        {trendValue && (
          <span
            className={`text-xs font-medium ${trendColor} flex items-center gap-0.5 mb-0.5`}
          >
            {trendIcon} {trendValue}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-(--text-white-50)">{subtext}</p>}
    </div>
  );
}
