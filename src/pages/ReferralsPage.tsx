import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useReferral } from "../hooks/useReferral";
import { useAccount } from "../hooks/useAccount";

export default function ReferralsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const {
    referralCode,
    referrals,
    referralCount,
    totalEarned,
    loading,
    error,
  } = useReferral(user?.id);
  const { account } = useAccount(user?.id);

  const copyReferralCode = async () => {
    if (referralCode) {
      try {
        await navigator.clipboard.writeText(referralCode);
        // You could add a toast notification here
      } catch (err) {
        console.error("Failed to copy referral code:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Referrals"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={account?.balance ?? 0}
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Referral Code Section */}
          <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Your Referral Code</h2>
            {loading ? (
              <p className="text-xs text-(--text-white-50)">Loading...</p>
            ) : error ? (
              <p className="text-sm text-red-500">{error}</p>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-(--text-white-50) mb-2">
                    Share this code with friends
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-[var(--background-secondary)] px-3 py-2 rounded text-sm font-mono">
                      {referralCode || "Loading..."}
                    </code>
                    <button
                      onClick={copyReferralCode}
                      className="px-4 py-2 bg-[var(--primary-default)] text-[var(--primary-text)] rounded hover:bg-[var(--primary-default)]/80 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-(--text-white-50) mb-2">
                Total Referrals
              </h3>
              <p className="text-2xl font-bold text-(--global-text)">
                {referralCount}
              </p>
            </div>
            <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-(--text-white-50) mb-2">
                Total Earned
              </h3>
              <p className="text-2xl font-bold text-(--global-text)">
                ${totalEarned.toFixed(2)}
              </p>
            </div>
            <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
              <h3 className="text-sm font-medium text-(--text-white-50) mb-2">
                Commission Rate
              </h3>
              <p className="text-2xl font-bold text-(--global-text)">
                $100 per referral
              </p>
            </div>
          </div>

          {/* Referrals List */}
          <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Your Referrals</h2>
            {loading ? (
              <p className="text-xs text-(--text-white-50)">
                Loading referrals...
              </p>
            ) : referrals.length === 0 ? (
              <p className="text-sm text-(--text-white-50)">
                No referrals yet. Share your code to start earning!
              </p>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-[var(--background-secondary)] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--global-text)">
                        Referral #{referral.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-(--text-white-50)">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-(--global-text)">
                        ${referral.bonus_amount.toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${referral.bonus_awarded ? "text-green-500" : "text-yellow-500"}`}
                      >
                        {referral.bonus_awarded ? "Awarded" : "Pending"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className="bg-(--background-card) border border-[var(--border-normal)] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">How Referrals Work</h2>
            <div className="space-y-3 text-sm text-(--text-white-50)">
              <p>1. Share your unique referral code with friends and family</p>
              <p>
                2. When they sign up using your code, they'll be linked to your
                account
              </p>
              <p>
                3. Earn $100 instantly when they complete their account setup
              </p>
              <p>4. Track your referrals and earnings in this dashboard</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
