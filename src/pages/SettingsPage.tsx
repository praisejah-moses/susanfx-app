import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useNotificationPrefs } from "../hooks/useNotificationPrefs";
import { useAccount } from "../hooks/useAccount";
import { supabase } from "../utils/supabase";

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { account } = useAccount(user?.id);

  const {
    prefs,
    loading: prefsLoading,
    save: savePrefs,
  } = useNotificationPrefs(user?.id);

  const [firstName, setFirstName] = useState(
    user?.user_metadata?.first_name ?? "",
  );
  const [lastName, setLastName] = useState(
    user?.user_metadata?.last_name ?? "",
  );
  const [phone, setPhone] = useState(user?.user_metadata?.phone_number ?? "");
  const [country, setCountry] = useState(user?.user_metadata?.country ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  const [emailNotifs, setEmailNotifs] = useState(prefs?.email_notifs ?? true);
  const [tradeAlerts, setTradeAlerts] = useState(prefs?.trade_alerts ?? true);
  const [payoutAlerts, setPayoutAlerts] = useState(
    prefs?.payout_alerts ?? false,
  );

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        country,
      },
    });
    setProfileSaving(false);
    setProfileMsg(
      error
        ? { ok: false, text: error.message }
        : { ok: true, text: "Profile saved." },
    );
  }

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "Passwords do not match." });
      return;
    }
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (error) {
      setPwMsg({ ok: false, text: error.message });
      return;
    }
    setPwMsg({ ok: true, text: "Password updated successfully." });
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleNotifSave(
    key: "emailNotifs" | "tradeAlerts" | "payoutAlerts",
    val: boolean,
  ) {
    const next = {
      email_notifs: key === "emailNotifs" ? val : emailNotifs,
      trade_alerts: key === "tradeAlerts" ? val : tradeAlerts,
      payout_alerts: key === "payoutAlerts" ? val : payoutAlerts,
    };
    if (key === "emailNotifs") setEmailNotifs(val);
    if (key === "tradeAlerts") setTradeAlerts(val);
    if (key === "payoutAlerts") setPayoutAlerts(val);
    await savePrefs(next);
  }

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Settings"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={account?.balance ?? 0}
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp max-w-2xl">
          {/* Profile */}
          <section className="bg-(--background-card) border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold">Profile Information</h2>
            {profileMsg && (
              <p
                className={`text-xs rounded-lg px-3 py-2 border ${
                  profileMsg.ok
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}
              >
                {profileMsg.text}
              </p>
            )}
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email ?? ""}
                    disabled
                    className="bg-white/5 border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--text-white-50) outline-none cursor-not-allowed"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs text-(--text-white-50)">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          </section>

          {/* Security */}
          <section className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold">Security</h2>
            {pwMsg && (
              <p
                className={`text-xs rounded-lg px-3 py-2 border ${
                  pwMsg.ok
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}
              >
                {pwMsg.text}
              </p>
            )}
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-(--text-white-50)">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={pwSaving}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-(--border-normal) text-(--global-text) hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </form>
          </section>

          {/* Notifications */}
          <section className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <div className="space-y-3">
              {!prefsLoading &&
                [
                  {
                    label: "Email Notifications",
                    sub: "Receive account updates via email",
                    value: emailNotifs,
                    key: "emailNotifs" as const,
                  },
                  {
                    label: "Trade Alerts",
                    sub: "Get alerts on trade executions",
                    value: tradeAlerts,
                    key: "tradeAlerts" as const,
                  },
                  {
                    label: "Payout Notifications",
                    sub: "Notify when payout is processed",
                    value: payoutAlerts,
                    key: "payoutAlerts" as const,
                  },
                ].map((n) => (
                  <div
                    key={n.label}
                    className="flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-(--global-text)">
                        {n.label}
                      </p>
                      <p className="text-xs text-(--text-white-50)">{n.sub}</p>
                    </div>
                    <button
                      onClick={() => handleNotifSave(n.key, !n.value)}
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${n.value ? "bg-(--primary-default)" : "bg-white/10"}`}
                      role="switch"
                      aria-checked={n.value}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${n.value ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                ))}{" "}
            </div>
          </section>

          {/* Danger zone */}
          <section className="bg-(--background-card) border border-red-500/20 rounded-xl p-5 md:p-6 space-y-3">
            <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
            <p className="text-xs text-(--text-white-50)">
              Permanently close your account. This action cannot be undone.
            </p>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors">
              Close Account
            </button>
          </section>
        </main>
      </div>
    </div>
  );
}
