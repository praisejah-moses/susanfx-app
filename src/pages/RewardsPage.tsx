import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useRewards } from "../hooks/useRewards";
import { useAccount } from "../hooks/useAccount";

export default function RewardsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { rewards, leaderboard, earnedPoints, loading } = useRewards(user?.id);
  const { account } = useAccount(user?.id);

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Rewards"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={account?.balance ?? 0}
          actions={
            <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-(--primary-default)/10 text-(--primary-default) border border-(--primary-default)/20 font-medium">
              ⭐ {earnedPoints.toLocaleString()} pts
            </span>
          }
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Badges / Achievements */}
          <div>
            <h2 className="text-sm font-semibold mb-4">Achievements</h2>
            {loading ? (
              <p className="text-xs text-(--text-white-50)">Loading…</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`bg-(--background-card) border rounded-xl p-5 flex items-start gap-4 transition-colors ${
                      reward.earned
                        ? "border-(--primary-default)/30"
                        : "border-(--border-normal) opacity-60"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${
                        reward.earned
                          ? "bg-(--primary-default)/10"
                          : "bg-white/5"
                      }`}
                    >
                      {reward.earned ? "🏆" : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-(--global-text)">
                        {reward.title}
                      </p>
                      <p className="text-xs text-(--text-white-50) mt-0.5">
                        {reward.description}
                      </p>
                      <p
                        className={`text-xs font-medium mt-2 ${reward.earned ? "text-(--primary-default)" : "text-(--text-white-50)"}`}
                      >
                        {reward.points.toLocaleString()} pts{" "}
                        {reward.earned ? "· Earned" : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-(--background-card) border border-(--border-normal) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border-normal)">
              <h2 className="text-sm font-semibold">Top Traders This Month</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-(--border-normal) text-(--text-white-50) uppercase tracking-wider">
                    {["Rank", "Trader", "Profit %", "Points"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-normal)">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : leaderboard.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        No data yet
                      </td>
                    </tr>
                  ) : (
                    leaderboard.map((entry, i) => {
                      const isMe = entry.user_id === user?.id;
                      const displayName = isMe
                        ? "You"
                        : entry.first_name
                          ? `${entry.first_name} ${entry.last_name?.[0] ?? ""}.`.trim()
                          : "Trader";
                      return (
                        <tr
                          key={entry.user_id}
                          className={`transition-colors ${isMe ? "bg-(--primary-default)/5" : "hover:bg-white/2"}`}
                        >
                          <td className="px-5 py-3 font-bold text-(--primary-default)">
                            #{i + 1}
                          </td>
                          <td className="px-5 py-3 font-medium">
                            {displayName}
                          </td>
                          <td className="px-5 py-3 text-emerald-400 font-semibold">
                            +{entry.profit_pct.toFixed(2)}%
                          </td>
                          <td className="px-5 py-3 text-(--text-white-50)">
                            {entry.points.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
