import { useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../hooks/useAccount";
import { supabase } from "../utils/supabase";
import type { DepositRow } from "../types/database";

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

// ── Crypto wallet addresses ──────────────────────────────────────────────────
const CRYPTO_WALLETS: Record<
  string,
  { symbol: string; address: string; network: string }
> = {
  BTC: {
    symbol: "BTC",
    address: "bc1qy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wsy",
    network: "Bitcoin Mainnet",
  },
  "USDT (ERC20)": {
    symbol: "USDT",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f83529",
    network: "Ethereum (ERC20)",
  },
  ETH: {
    symbol: "ETH",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f83529",
    network: "Ethereum Mainnet",
  },
  SOL: {
    symbol: "SOL",
    address: "GJUoKbVqB3qWiTHc9KvpKLGQ9JQ5kR2z4Q7xQvqQjq9x",
    network: "Solana Mainnet Beta",
  },
};

export default function DepositsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { account } = useAccount(user?.id);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showWalletPopout, setShowWalletPopout] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [deposits, setDeposits] = useState<DepositRow[]>([]);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState<DepositRow | null>(null);
  const [loadingDeposits, setLoadingDeposits] = useState(true);
  const [showBankModal, setShowBankModal] = useState(false);

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Fetch deposits on mount
  useEffect(() => {
    if (!user?.id) return;
    const fetchDeposits = async () => {
      setLoadingDeposits(true);
      const { data } = await supabase
        .from("deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setDeposits(data as DepositRow[]);
      setLoadingDeposits(false);
    };
    fetchDeposits();
  }, [user?.id]);

  const handleConfirmDeposit = async () => {
    if (!user?.id || !method) return;

    setSubmitting(true);
    const parsedAmount = parseFloat(amount);

    // Insert deposit transaction with pending status
    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        amount: parsedAmount,
        method: method,
        status: "Pending",
        wallet_address: CRYPTO_WALLETS[method].address,
      })
      .select()
      .single();

    if (error) {
      setSubmitting(false);
      console.error("Failed to log deposit:", error);
      return;
    }

    // Show pending modal with deposit details
    setPendingDeposit(data as DepositRow);
    setShowPendingModal(true);

    // Add to deposits list
    setDeposits((prev) => [data as DepositRow, ...prev]);

    // Reset form after a delay
    setTimeout(() => {
      setSubmitting(false);
      setAmount("");
      setMethod("");
      setShowWalletPopout(false);
    }, 500);
  };

  const available = account?.balance ?? 0;

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Deposits"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={available}
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Deposit Methods Grid */}
          <div className="grid grid-cols-1 gap-5">
            {/* Bank Wire, Credit Card, E-wallet */}
            <div
              onClick={() => setShowBankModal(true)}
              className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-6 space-y-4 hover:border-(--primary-default)/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-(--global-text) mb-2">
                    Deposit via bank wire, credit card, and e-wallet
                  </h3>
                  <p className="text-xs text-(--text-white-50) mb-3">
                    Deposit via the following payment methods:
                  </p>
                </div>
                <svg
                  width="15"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-(--text-white-50)"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: "💳", label: "Credit/Debit" },
                  { icon: "🏦", label: "Bank Transfer" },
                  { icon: "📱", label: "E-wallet" },
                  { icon: "💰", label: "Local Methods" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex flex-col items-center gap-2 p-3 bg-white/3 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className="text-xs text-center text-(--text-white-50)">
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptocurrencies Section */}
            <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl p-6 space-y-4 hover:border-(--primary-default)/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-(--global-text) mb-2">
                    Deposit cryptocurrencies
                  </h3>
                  <p className="text-xs text-(--text-white-50) mb-3">
                    We accept the following cryptocurrencies:
                  </p>
                </div>
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-(--text-white-50)"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { symbol: "BTC", label: "Bitcoin" },
                  { symbol: "ETH", label: "Ethereum" },
                  { symbol: "USDT", label: "Tether" },
                  { symbol: "SOL", label: "Solana" },
                ].map((c) => (
                  <button
                    key={c.symbol}
                    onClick={() => {
                      setMethod(
                        c.symbol === "USDT" ? "USDT (ERC20)" : c.symbol,
                      );
                      setAmount("100");
                      setTimeout(() => setShowWalletPopout(true), 100);
                    }}
                    className="flex flex-col items-center gap-2 p-3 bg-white/3 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="text-2xl">
                      {c.symbol === "BTC" && "₿"}
                      {c.symbol === "ETH" && "Ξ"}
                      {c.symbol === "USDT" && "₮"}
                      {c.symbol === "SOL" && "◎"}
                    </span>
                    <span className="text-xs text-center text-(--text-white-50)">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deposit History */}
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
                  {loadingDeposits ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        Loading deposits...
                      </td>
                    </tr>
                  ) : deposits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        No deposits yet
                      </td>
                    </tr>
                  ) : (
                    deposits.map((d) => (
                      <tr
                        key={d.id}
                        className="hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-3 font-semibold">
                          {fmt(d.amount)}
                        </td>
                        <td className="px-5 py-3 text-(--text-white-50)">
                          {d.method}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              d.status === "Pending"
                                ? "bg-amber-500/10 text-amber-400"
                                : d.status === "Completed"
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-(--text-white-50)">
                          {fmtDate(d.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Wallet Address Popout */}
        {showWalletPopout && method && CRYPTO_WALLETS[method] && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowWalletPopout(false)}
            />

            {/* Popout Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
              <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl max-w-md w-full space-y-4 animate-fadeInUp">
                {/* Header */}
                <div className="px-6 py-4 border-b border-(--border-normal) flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-(--global-text)">
                    {CRYPTO_WALLETS[method].symbol} Wallet Address
                  </h3>
                  <button
                    onClick={() => setShowWalletPopout(false)}
                    className="text-(--text-white-50) hover:text-(--global-text) transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 space-y-4">
                  {/* Network info */}
                  <div>
                    <p className="text-xs text-(--text-white-50) mb-1">
                      Network
                    </p>
                    <p className="text-sm font-semibold text-(--global-text)">
                      {CRYPTO_WALLETS[method].network}
                    </p>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="text-xs text-(--text-white-50) mb-1 block">
                      Amount (USD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white/5 border border-(--border-normal) rounded-lg text-sm text-(--global-text) placeholder-gray-500 focus:outline-none focus:border-(--primary-default)"
                    />
                  </div>

                  {/* Wallet address card */}
                  <div className="bg-white/3 border border-(--border-normal) rounded-lg p-4 space-y-3">
                    <p className="text-xs text-(--text-white-50) uppercase font-semibold tracking-wider">
                      Send {CRYPTO_WALLETS[method].symbol} to this address
                    </p>
                    <div className="break-all font-mono text-xs text-(--global-text) bg-black/30 rounded p-3 overflow-auto max-h-20">
                      {CRYPTO_WALLETS[method].address}
                    </div>
                    <button
                      onClick={() =>
                        handleCopyAddress(CRYPTO_WALLETS[method].address)
                      }
                      className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                        copiedAddress === CRYPTO_WALLETS[method].address
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/5 text-(--text-white-50) hover:bg-white/10 border border-(--border-normal)"
                      }`}
                    >
                      {copiedAddress === CRYPTO_WALLETS[method].address
                        ? "✓ Copied to Clipboard"
                        : "Copy Address"}
                    </button>
                  </div>

                  {/* Warning */}
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <p className="text-xs text-amber-400 leading-relaxed">
                      <span className="font-semibold">⚠ Important:</span> Send
                      only {CRYPTO_WALLETS[method].symbol} to this address.
                      Sending other cryptocurrencies will result in permanent
                      loss.
                    </p>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-(--border-normal) flex gap-3">
                  <button
                    onClick={() => setShowWalletPopout(false)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white/5 text-(--text-white-50) hover:bg-white/10 transition-colors border border-(--border-normal)"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeposit}
                    disabled={submitting}
                    className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Processing…" : "Confirm Deposit"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pending Deposit Modal */}
        {showPendingModal && pendingDeposit && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setShowPendingModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
              <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl max-w-md w-full space-y-6 animate-fadeInUp">
                {/* Success Icon */}
                <div className="pt-6 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-amber-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                </div>

                {/* Header */}
                <div className="px-6 text-center">
                  <h3 className="text-lg font-semibold text-(--global-text) mb-2">
                    Deposit Pending
                  </h3>
                  <p className="text-sm text-(--text-white-50)">
                    Your deposit has been logged. Please complete the transfer
                    to continue.
                  </p>
                </div>

                {/* Deposit Details */}
                <div className="px-6 space-y-3 bg-white/3 border border-(--border-normal) rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-(--text-white-50)">
                      Amount
                    </span>
                    <span className="text-sm font-semibold text-(--global-text)">
                      {fmt(pendingDeposit.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-(--text-white-50)">
                      Cryptocurrency
                    </span>
                    <span className="text-sm font-semibold text-(--global-text)">
                      {pendingDeposit.method}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-(--text-white-50)">
                      Status
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-(--text-white-50)">
                      Deposit ID
                    </span>
                    <span className="text-xs font-mono text-(--text-white-50)">
                      {pendingDeposit.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>

                {/* Info Box */}
                <div className="px-6 space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-xs text-blue-400 leading-relaxed">
                      <span className="font-semibold">ℹ️ What's next?</span>
                      <br />
                      Send the cryptocurrency to the wallet address and your
                      balance will update automatically once confirmed on the
                      blockchain.
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-xs text-emerald-400 leading-relaxed">
                      <span className="font-semibold">
                        ✓ Confirmation time:
                      </span>
                      <br />
                      Deposits typically confirm within 10-30 minutes depending
                      on network congestion.
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setShowPendingModal(false)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity"
                  >
                    Got it, I'll send the crypto
                  </button>
                  <p className="text-xs text-center text-(--text-white-50) mt-3">
                    You can check your deposit status anytime in the history
                    below.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bank Deposit Modal */}
        {showBankModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4 animate-fadeInUp">
            <div className="bg-[#0f0f0f] border border-(--border-normal) rounded-xl max-w-sm w-full p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-(--global-text)">
                  Bank Deposit
                </h2>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Close"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-(--text-white-50)"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-(--global-text) leading-relaxed">
                  Contact us{" "}
                  <span className="font-semibold">
                    @support.susanfxwebmailblah.co
                  </span>
                  . An instant bank will be provided for you
                </p>

                <button
                  onClick={() => setShowBankModal(false)}
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-(--primary-default) text-black hover:opacity-90 transition-opacity"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
