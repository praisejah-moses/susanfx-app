import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../hooks/useAccount";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DepositsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { account } = useAccount(user?.id);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setFormError("Enter a valid amount.");
      return;
    }
    if (!method) {
      setFormError("Select a deposit method.");
      return;
    }
    setSubmitting(true);
    // TODO: Implement deposit submission
    setTimeout(() => {
      setSubmitting(false);
      setFormSuccess(true);
      setAmount("");
      setMethod("");
    }, 500);
  }

  const available = account?.balance ?? 0;

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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
            <h1 className="text-base md:text-lg font-semibold">Deposits</h1>
            <p className="text-xs text-(--text-white-50) hidden sm:block">
              Welcome back, {userName}
            </p>
          </div>
          <button className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity whitespace-nowrap">
            Make a Deposit
          </button>
        </header>

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                label: "Account Balance",
                value: fmt(available),
                sub: "Current balance",
              },
              {
                label: "Total Deposits",
                value: fmt(available),
                sub: "All time",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5"
              >
                <p className="text-xs text-(--text-white-50) mb-1">
                  {card.label}
                </p>
                <p className="text-2xl font-bold text-(--global-text)">
                  {card.value}
                </p>
                <p className="text-xs text-(--text-white-50) mt-1">
                  {card.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Make deposit form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4"
          >
            <h2 className="text-sm font-semibold text-(--global-text)">
              Make a Deposit
            </h2>
            {formError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            {formSuccess && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                Deposit initiated successfully.
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-(--text-white-50)">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-(--text-white-50)">
                  Deposit Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) outline-none focus:border-(--primary-default) transition-colors"
                >
                  <option value="">Select method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Crypto (USDT)">Crypto (USDT)</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing…" : "Deposit Now"}
            </button>
          </form>

          {/* History table */}
          <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border-normal)">
              <h2 className="text-sm font-semibold text-(--global-text)">
                Deposit History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-(--border-normal) text-(--text-white-50) uppercase tracking-wider">
                    {["Amount", "Method", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--border-normal)">
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-(--text-white-50)"
                    >
                      No deposits yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
