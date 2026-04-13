import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import StatCard from "../components/dashboard/StatCard";

const recentTrades = [
  { id: 1, pair: "EUR/USD", type: "Buy", size: "1.00", openPrice: "1.0842", closePrice: "1.0891", pnl: "+$490.00", status: "Closed" },
  { id: 2, pair: "GBP/USD", type: "Sell", size: "0.50", openPrice: "1.2734", closePrice: "1.2698", pnl: "+$180.00", status: "Closed" },
  { id: 3, pair: "XAU/USD", type: "Buy", size: "0.10", openPrice: "2318.40", closePrice: "—", pnl: "+$220.00", status: "Open" },
  { id: 4, pair: "USD/JPY", type: "Sell", size: "1.00", openPrice: "154.22", closePrice: "154.88", pnl: "-$430.00", status: "Closed" },
  { id: 5, pair: "NAS100", type: "Buy", size: "0.20", openPrice: "17840.0", closePrice: "17920.0", pnl: "+$160.00", status: "Closed" },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--background-default)] text-[var(--global-text)]">
      <DashboardSidebar />

      {/* Main content */}
      <div className="ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[var(--background-default)]/95 backdrop-blur border-b border-[var(--border-normal)] px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Overview</h1>
            <p className="text-xs text-[var(--text-white-50)]">Welcome back, Trader</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Phase 1 Active
            </span>
            <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-default)] text-black hover:opacity-90 transition-opacity">
              Request Payout
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 px-8 py-8 space-y-8">

          {/* Stat cards */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Account Balance"
              value="$102,490"
              subtext="Starting balance: $100,000"
              trend="up"
              trendValue="2.49%"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
            />
            <StatCard
              label="Total Profit"
              value="$2,490"
              subtext="Target: $10,000 (8%)"
              trend="up"
              trendValue="2.49%"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
                </svg>
              }
            />
            <StatCard
              label="Daily Drawdown"
              value="1.20%"
              subtext="Limit: 5.00%"
              trend="neutral"
              trendValue="Safe"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              }
            />
            <StatCard
              label="Max Drawdown"
              value="3.50%"
              subtext="Limit: 10.00%"
              trend="neutral"
              trendValue="Safe"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              }
            />
          </section>

          {/* Progress bars */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profit target */}
            <div className="bg-[#0f0f0f] border border-[var(--border-normal)] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Profit Target</span>
                <span className="text-xs text-[var(--primary-default)] font-semibold">24.9% complete</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary-default)] rounded-full" style={{ width: "24.9%" }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-white-50)]">
                <span>Current: $2,490</span>
                <span>Target: $10,000</span>
              </div>
            </div>

            {/* Trading days */}
            <div className="bg-[#0f0f0f] border border-[var(--border-normal)] rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Minimum Trading Days</span>
                <span className="text-xs text-[var(--primary-default)] font-semibold">4 / 10 days</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--primary-default)] rounded-full" style={{ width: "40%" }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-white-50)]">
                <span>Completed: 4 days</span>
                <span>Required: 10 days</span>
              </div>
            </div>
          </section>

          {/* Recent trades */}
          <section className="bg-[#0f0f0f] border border-[var(--border-normal)] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border-normal)] flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent Trades</h2>
              <button className="text-xs text-[var(--primary-default)] hover:opacity-80 transition-opacity font-medium">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[var(--text-white-50)] uppercase tracking-wider border-b border-[var(--border-normal)]">
                    <th className="text-left px-6 py-3 font-medium">Pair</th>
                    <th className="text-left px-6 py-3 font-medium">Type</th>
                    <th className="text-left px-6 py-3 font-medium">Lot Size</th>
                    <th className="text-left px-6 py-3 font-medium">Open</th>
                    <th className="text-left px-6 py-3 font-medium">Close</th>
                    <th className="text-left px-6 py-3 font-medium">P&L</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-normal)]">
                  {recentTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-white/[0.02] transition-colors">
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
                      <td className="px-6 py-4 text-[var(--text-white-50)]">{trade.size}</td>
                      <td className="px-6 py-4 text-[var(--text-white-50)]">{trade.openPrice}</td>
                      <td className="px-6 py-4 text-[var(--text-white-50)]">{trade.closePrice}</td>
                      <td
                        className={`px-6 py-4 font-medium ${
                          trade.pnl.startsWith("+") ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {trade.pnl}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            trade.status === "Open"
                              ? "bg-[var(--primary-default)]/10 text-[var(--primary-default)]"
                              : "bg-white/5 text-[var(--text-white-50)]"
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
          <section className="bg-[#0f0f0f] border border-[var(--border-normal)] rounded-xl p-6">
            <h2 className="text-sm font-semibold mb-4">Account Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: "Daily drawdown ≤ 5%", pass: true },
                { label: "Max drawdown ≤ 10%", pass: true },
                { label: "Minimum trading days (10)", pass: false },
                { label: "Profit target reached (8%)", pass: false },
                { label: "No weekend holding", pass: true },
                { label: "No copy trading / EA violations", pass: true },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center gap-3">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      rule.pass ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-[var(--text-white-50)]"
                    }`}
                  >
                    {rule.pass ? (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1.5 6 4.5 9 10.5 3" />
                      </svg>
                    ) : (
                      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="6" cy="6" r="4" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm ${rule.pass ? "text-[var(--global-text)]" : "text-[var(--text-white-50)]"}`}>
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
