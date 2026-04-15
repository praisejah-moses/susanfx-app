import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import StatCard from "../components/dashboard/StatCard";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../hooks/useTrades";
import { useAccount } from "../hooks/useAccount";

function fmt(n: number, decimals = 2) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { trades, loading: tradesLoading } = useTrades(user?.id);
  const { account } = useAccount(user?.id);

  const userName =
    user?.user_metadata?.first_name ||
    user?.email?.split("@")[0] ||
    "Trader";

  // Derived account metrics
  const balance      = account?.balance          ?? 0;
  const startBalance = account?.starting_balance ?? 0;
  const profit       = balance - startBalance;
  const profitPct    = startBalance > 0 ? (profit / startBalance) * 100 : 0;
  const profitTarget = account?.profit_target     ?? 10000;
  const targetPct    = startBalance > 0 ? Math.min((profit / profitTarget) * 100, 100) : 0;
  const dailyDD      = account?.daily_drawdown    ?? 0;
  const maxDD        = account?.max_drawdown      ?? 0;
  const phase        = account?.phase             ?? "Phase 1";

  // Recent trades: 5 most recent
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-(--background-default)/95 backdrop-blur border-b border-(--border-normal) px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
          {/* Hamburger (mobile only) */}
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
            <h1 className="text-base md:text-lg font-semibold">Overview</h1>
            <p className="text-xs text-(--text-white-50) hidden sm:block">
              Welcome back, {userName}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {phase} Active
            </span>
            {/* Mobile phase badge (icon only) */}
            <span className="sm:hidden w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <button className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium bg-(--primary-default) text-black hover:opacity-90 transition-opacity whitespace-nowrap">
              Request Payout
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-5 md:space-y-8">
          {/* Stat cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="animate-fadeInUp">
              <StatCard
                label="Account Balance"
                value={fmt(balance)}
                subtext={`Starting balance: ${fmt(startBalance)}`}
                trend="up"
                trendValue={`${profitPct.toFixed(2)}%`}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
            </div>
            <div className="animate-fadeInUp animate-delay-75">
              <StatCard
                label="Total Profit"
                value={fmt(profit)}
                subtext={`Target: ${fmt(profitTarget)} (8%)`}
                trend={profit >= 0 ? "up" : "down"}
                trendValue={`${profitPct.toFixed(2)}%`}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                    <polyline points="16 7 22 7 22 13" />
                  </svg>
                }
              />
            </div>
            <div className="animate-fadeInUp animate-delay-150">
              <StatCard
                label="Daily Drawdown"
                value={`${dailyDD.toFixed(2)}%`}
                subtext="Limit: 5.00%"
                trend="neutral"
                trendValue={dailyDD < 5 ? "Safe" : "Warning"}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                }
              />
            </div>
            <div className="animate-fadeInUp animate-delay-200">
              <StatCard
                label="Max Drawdown"
                value={`${maxDD.toFixed(2)}%`}
                subtext="Limit: 10.00%"
                trend="neutral"
                trendValue={maxDD < 10 ? "Safe" : "Warning"}
                icon={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                }
              />
            </div>
          </section>

          {/* Progress bars */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profit target */}
            <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit Target</span>
                <span className="text-xs text-(--primary-default) font-semibold">
                  {targetPct.toFixed(1)}% complete
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-(--primary-default) rounded-full"
                  style={{ width: `${targetPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-(--text-white-50)">
                <span>Current: {fmt(profit)}</span>
                <span>Target: {fmt(profitTarget)}</span>
              </div>
            </div>

            {/* Trading days */}
            <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Minimum Trading Days
                </span>
                <span className="text-xs text-(--primary-default) font-semibold">
                  4 / 10 days
                </span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-(--primary-default) rounded-full"
                  style={{ width: "40%" }}
                />
              </div>
              <div className="flex justify-between text-xs text-(--text-white-50)">
                <span>Completed: 4 days</span>
                <span>Required: 10 days</span>
              </div>
            </div>
          </section>

          {/* Recent trades */}
          <section className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-(--border-normal) flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Trades</h2>
              <button className="text-xs text-(--primary-default) hover:opacity-80 transition-opacity font-medium">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-(--text-white-50) uppercase tracking-wider border-b border-(--border-normal)">
                    <th className="text-left px-6 py-3 font-medium">Pair</th>
                    <th className="text-left px-6 py-3 font-medium">Type</th>
                    <th className="text-left px-6 py-3 font-medium">
                      Lot Size
                    </th>
                    <th className="text-left px-6 py-3 font-medium">Open</th>
                    <th className="text-left px-6 py-3 font-medium">Close</th>
                    <th className="text-left px-6 py-3 font-medium">P&L</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-normal)">
                  {tradesLoading ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-(--text-white-50)">Loading trades…</td></tr>
                  ) : recentTrades.length === 0 ? (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-(--text-white-50)">No trades yet</td></tr>
                  ) : recentTrades.map((trade) => (
                    <tr
                      key={trade.id}
                      className="hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{trade.pair}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            trade.type === "Buy"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-(--text-white-50)">
                        {trade.size}
                      </td>
                      <td className="px-6 py-4 text-(--text-white-50)">
                        {trade.open_price}
                      </td>
                      <td className="px-6 py-4 text-(--text-white-50)">
                        {trade.close_price ?? "—"}
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          (trade.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {trade.pnl != null ? fmt(trade.pnl) : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            trade.status === "Open"
                              ? "bg-(--primary-default)/10 text-(--primary-default)"
                              : "bg-white/5 text-(--text-white-50)"
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Rules checklist */}
          <section className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Account Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Daily drawdown ≤ 5%", pass: dailyDD < 5 },
                { label: "Max drawdown ≤ 10%", pass: maxDD < 10 },
                { label: "Minimum trading days (10)", pass: false },
                { label: `Profit target reached (8%)`, pass: profitPct >= 8 },
                { label: "No weekend holding", pass: true },
                { label: "No copy trading / EA violations", pass: true },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      rule.pass
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-white/5 text-(--text-white-50)"
                    }`}
                  >
                    {rule.pass ? (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1.5 6 4.5 9 10.5 3" />
                      </svg>
                    ) : (
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <circle cx="6" cy="6" r="4" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-sm ${rule.pass ? "text-(--global-text)" : "text-(--text-white-50)"}`}
                  >
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
