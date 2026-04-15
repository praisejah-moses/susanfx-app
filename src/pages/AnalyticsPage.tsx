import { useState, useMemo } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../hooks/useTrades";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
}

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Trader";

  const { trades, loading } = useTrades(user?.id);

  const closed = useMemo(() => trades.filter((t) => t.status === "Closed" && t.pnl != null), [trades]);
  const wins   = useMemo(() => closed.filter((t) => (t.pnl ?? 0) > 0), [closed]);
  const losses = useMemo(() => closed.filter((t) => (t.pnl ?? 0) <= 0), [closed]);

  const winRate     = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;
  const avgProfit   = wins.length   > 0 ? wins.reduce((s, t)   => s + (t.pnl ?? 0), 0) / wins.length   : 0;
  const avgLoss     = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length) : 0;
  const profitFactor = avgLoss > 0 ? (avgProfit * wins.length) / (avgLoss * losses.length) : 0;
  const bestTrade   = closed.reduce((best, t) => ((t.pnl ?? 0) > (best?.pnl ?? -Infinity) ? t : best), closed[0] ?? null);
  const worstTrade  = closed.reduce((worst, t) => ((t.pnl ?? 0) < (worst?.pnl ?? Infinity) ? t : worst), closed[0] ?? null);

  const stats = [
    { label: "Win Rate",      value: `${winRate.toFixed(0)}%`,          sub: `Based on ${closed.length} trades`, positive: true  },
    { label: "Avg Profit",    value: fmt(avgProfit),                     sub: "Per winning trade",                positive: true  },
    { label: "Avg Loss",      value: fmt(avgLoss),                       sub: "Per losing trade",                 positive: false },
    { label: "Profit Factor", value: profitFactor.toFixed(2),            sub: "Above 1.5 is good",                positive: profitFactor >= 1.5 },
    { label: "Best Trade",    value: bestTrade  ? fmt(bestTrade.pnl!)  : "—", sub: bestTrade  ? `${bestTrade.pair} ${bestTrade.type}`  : "", positive: true  },
    { label: "Worst Trade",   value: worstTrade ? fmt(worstTrade.pnl!) : "—", sub: worstTrade ? `${worstTrade.pair} ${worstTrade.type}` : "", positive: false },
  ];

  // Group by pair
  const pairMap = useMemo(() => {
    const m = new Map<string, { total: number; wins: number; pnl: number }>();
    for (const t of closed) {
      const e = m.get(t.pair) ?? { total: 0, wins: 0, pnl: 0 };
      e.total++;
      if ((t.pnl ?? 0) > 0) e.wins++;
      e.pnl += t.pnl ?? 0;
      m.set(t.pair, e);
    }
    return Array.from(m.entries())
      .map(([pair, v]) => ({ pair, trades: v.total, winRate: v.total > 0 ? `${Math.round((v.wins / v.total) * 100)}%` : "—", pnl: v.pnl }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [closed]);

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-(--background-default)/95 backdrop-blur border-b border-(--border-normal) px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
          <button
            className="md:hidden flex flex-col gap-1.5 p-1 shrink-0"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
            <span className="block w-5 h-0.5 bg-white" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base md:text-lg font-semibold">Analytics</h1>
            <p className="text-xs text-(--text-white-50) hidden sm:block">
              Welcome back, {userName}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {closed.length} Trades
          </span>
        </header>

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {loading ? (
            <p className="text-xs text-(--text-white-50)">Loading analytics…</p>
          ) : (
          <>
          {/* Key stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-4">
                <p className="text-xs text-(--text-white-50) mb-1">{s.label}</p>
                <p className={`text-xl font-bold ${s.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {s.value}
                </p>
                <p className="text-xs text-(--text-white-50) mt-1">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Win / Loss progress bar */}
          <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold">Win / Loss Distribution</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-(--text-white-50) mb-1">
                <span>Wins ({wins.length})</span>
                <span>Losses ({losses.length})</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                <div className="h-full bg-emerald-500 rounded-l-full transition-all" style={{ width: `${winRate}%` }} />
                <div className="h-full bg-red-500 rounded-r-full transition-all" style={{ width: `${100 - winRate}%` }} />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Wins {winRate.toFixed(0)}%</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Losses {(100 - winRate).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Performance by pair */}
          <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border-normal)">
              <h2 className="text-sm font-semibold">Performance by Instrument</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-(--border-normal) text-(--text-white-50) uppercase tracking-wider">
                    {["Pair", "Trades", "Win Rate", "Net P&L"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-normal)">
                  {pairMap.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-(--text-white-50)">No closed trades yet</td></tr>
                  ) : pairMap.map((row) => (
                    <tr key={row.pair} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 font-semibold">{row.pair}</td>
                      <td className="px-5 py-3 text-(--text-white-50)">{row.trades}</td>
                      <td className="px-5 py-3">{row.winRate}</td>
                      <td className={`px-5 py-3 font-semibold ${row.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {fmt(row.pnl)}
                      </td>
                    </tr>
                  ))}
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
