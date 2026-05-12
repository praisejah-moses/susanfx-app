import { useState, useMemo } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../hooks/useTrades";
import { useAccount } from "../hooks/useAccount";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(n);
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("all");
  const [pairSort, setPairSort] = useState<"pnl" | "trades" | "winRate">("pnl");
  const [pairSortAsc, setPairSortAsc] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { trades, loading } = useTrades(user?.id);
  const { account } = useAccount(user?.id);

  const allClosed = useMemo(
    () => trades.filter((t) => t.status === "Closed" && t.pnl != null),
    [trades],
  );

  const closed = useMemo(() => {
    if (dateRange === "all") return allClosed;
    const cutoff = new Date();
    if (dateRange === "7d") cutoff.setDate(cutoff.getDate() - 7);
    else if (dateRange === "30d") cutoff.setDate(cutoff.getDate() - 30);
    else if (dateRange === "90d") cutoff.setDate(cutoff.getDate() - 90);
    return allClosed.filter((t) => new Date(t.closed_at ?? t.opened_at) >= cutoff);
  }, [allClosed, dateRange]);
  const wins = useMemo(() => closed.filter((t) => (t.pnl ?? 0) > 0), [closed]);
  const losses = useMemo(
    () => closed.filter((t) => (t.pnl ?? 0) <= 0),
    [closed],
  );

  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgProfit =
    wins.length > 0
      ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length
      : 0;
  const avgLoss =
    losses.length > 0
      ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length)
      : 0;
  const profitFactor =
    avgLoss > 0 ? (avgProfit * wins.length) / (avgLoss * losses.length) : 0;
  const expectancy =
    closed.length > 0
      ? (winRate / 100) * avgProfit - (1 - winRate / 100) * avgLoss
      : 0;
  const bestTrade = closed.reduce(
    (best, t) => ((t.pnl ?? 0) > (best?.pnl ?? -Infinity) ? t : best),
    closed[0] ?? null,
  );
  const worstTrade = closed.reduce(
    (worst, t) => ((t.pnl ?? 0) < (worst?.pnl ?? Infinity) ? t : worst),
    closed[0] ?? null,
  );

  const stats = [
    {
      label: "Win Rate",
      value: `${winRate.toFixed(0)}%`,
      sub: `Based on ${closed.length} trades`,
      positive: true,
    },
    {
      label: "Avg Profit",
      value: fmt(avgProfit),
      sub: "Per winning trade",
      positive: true,
    },
    {
      label: "Avg Loss",
      value: fmt(avgLoss),
      sub: "Per losing trade",
      positive: false,
    },
    {
      label: "Profit Factor",
      value: profitFactor.toFixed(2),
      sub: "Above 1.5 is good",
      positive: profitFactor >= 1.5,
    },
    {
      label: "Expectancy",
      value: fmt(expectancy),
      sub: "Avg $ per trade",
      positive: expectancy >= 0,
    },
    {
      label: "Best Trade",
      value: bestTrade ? fmt(bestTrade.pnl!) : "—",
      sub: bestTrade ? `${bestTrade.pair} ${bestTrade.type}` : "",
      positive: true,
    },
    {
      label: "Worst Trade",
      value: worstTrade ? fmt(worstTrade.pnl!) : "—",
      sub: worstTrade ? `${worstTrade.pair} ${worstTrade.type}` : "",
      positive: false,
    },
  ];

  const pairMap = useMemo(() => {
    const m = new Map<string, { total: number; wins: number; pnl: number }>();
    for (const t of closed) {
      const e = m.get(t.pair) ?? { total: 0, wins: 0, pnl: 0 };
      e.total++;
      if ((t.pnl ?? 0) > 0) e.wins++;
      e.pnl += t.pnl ?? 0;
      m.set(t.pair, e);
    }
    const rows = Array.from(m.entries()).map(([pair, v]) => ({
      pair,
      trades: v.total,
      winRateNum: v.total > 0 ? (v.wins / v.total) * 100 : 0,
      winRate: v.total > 0 ? `${Math.round((v.wins / v.total) * 100)}%` : "—",
      pnl: v.pnl,
    }));
    rows.sort((a, b) => {
      let diff = 0;
      if (pairSort === "pnl") diff = a.pnl - b.pnl;
      else if (pairSort === "trades") diff = a.trades - b.trades;
      else diff = a.winRateNum - b.winRateNum;
      return pairSortAsc ? diff : -diff;
    });
    return rows;
  }, [closed, pairSort, pairSortAsc]);

  const toggleSort = (col: "pnl" | "trades" | "winRate") => {
    if (pairSort === col) setPairSortAsc((v) => !v);
    else { setPairSort(col); setPairSortAsc(false); }
  };

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Analytics"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={account?.balance ?? 0}
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Date range filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {(["7d", "30d", "90d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  dateRange === r
                    ? "bg-(--primary-default) text-white"
                    : "bg-white/5 text-(--text-white-50) hover:bg-white/10"
                }`}
              >
                {r === "all" ? "All Time" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "90 Days"}
              </button>
            ))}
            <span className="text-xs text-(--text-white-50) ml-2">
              {closed.length} trade{closed.length !== 1 ? "s" : ""} in range
            </span>
          </div>
          {loading ? (
            <p className="text-xs text-(--text-white-50)">Loading analytics…</p>
          ) : (
            <>
              {/* Key stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="bg-(--background-card) border border-(--border-normal) rounded-xl p-4"
                  >
                    <p className="text-xs text-(--text-white-50) mb-1">
                      {s.label}
                    </p>
                    <p
                      className={`text-xl font-bold ${s.positive ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {s.value}
                    </p>
                    <p className="text-xs text-(--text-white-50) mt-1">
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>

              {/* Win / Loss progress bar */}
              <div className="bg-(--background-card) border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
                <h2 className="text-sm font-semibold">
                  Win / Loss Distribution
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-(--text-white-50) mb-1">
                    <span>Wins ({wins.length})</span>
                    <span>Losses ({losses.length})</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-emerald-500 rounded-l-full transition-all"
                      style={{ width: `${winRate}%` }}
                    />
                    <div
                      className="h-full bg-red-500 rounded-r-full transition-all"
                      style={{ width: `${100 - winRate}%` }}
                    />
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Wins {winRate.toFixed(0)}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      Losses {(100 - winRate).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance by pair */}
              <div className="bg-(--background-card) border border-(--border-normal) rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-(--border-normal)">
                  <h2 className="text-sm font-semibold">
                    Performance by Instrument
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[360px]">
                    <thead>
                      <tr className="border-b border-(--border-normal) text-(--text-white-50) uppercase tracking-wider">
                        <th className="text-left px-5 py-3 font-medium">Pair</th>
                        {(["trades", "winRate", "pnl"] as const).map((col) => (
                          <th
                            key={col}
                            onClick={() => toggleSort(col)}
                            className="text-left px-5 py-3 font-medium cursor-pointer hover:text-(--global-text) transition-colors select-none"
                          >
                            {col === "pnl" ? "Net P&L" : col === "winRate" ? "Win Rate" : "Trades"}
                            {pairSort === col ? (pairSortAsc ? " ↑" : " ↓") : " ↕"}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-normal)">
                      {pairMap.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-5 py-8 text-center text-(--text-white-50)"
                          >
                            No closed trades yet
                          </td>
                        </tr>
                      ) : (
                        pairMap.map((row) => (
                          <tr
                            key={row.pair}
                            className="hover:bg-white/2 transition-colors"
                          >
                            <td className="px-5 py-3 font-semibold">
                              {row.pair}
                            </td>
                            <td className="px-5 py-3 text-(--text-white-50)">
                              {row.trades}
                            </td>
                            <td className="px-5 py-3">{row.winRate}</td>
                            <td
                              className={`px-5 py-3 font-semibold ${row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {fmt(row.pnl)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
