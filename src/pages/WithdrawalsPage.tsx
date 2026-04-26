import { useState } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import { useAuth } from "../context/AuthContext";
import { useWithdrawals } from "../hooks/useWithdrawals";
import { useAccount } from "../hooks/useAccount";
import type { WithdrawalRow } from "../types/database";

const WITHDRAWAL_METHODS = {
  BANK: {
    id: "bank",
    name: "Bank Transfer",
    label: "Bank Transfer",
  },
  BTC: {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    network: "Bitcoin Mainnet",
    address: "bc1qy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wsy",
  },
  USDT_ERC20: {
    id: "usdt_erc20",
    name: "USDT (ERC20)",
    symbol: "USDT",
    network: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f83529",
  },
  ETH: {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    network: "Ethereum Mainnet",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f83529",
  },
  SOL: {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    network: "Solana Mainnet Beta",
    address: "GJUoKbVqB3qWiTHc9KvpKLGQ9JQ5kR2z4Q7xQvqQjq9x",
  },
};

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

export default function WithdrawalsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const userName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Trader";

  const { withdrawals, loading, submit } = useWithdrawals(user?.id);
  const { account } = useAccount(user?.id);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<WithdrawalRow["method"] | "">("");

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<
    keyof typeof WITHDRAWAL_METHODS | null
  >(null);
  const [walletAddress, setWalletAddress] = useState("");

  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAmount, setBankAmount] = useState("");

  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState<{
    amount: number;
    method: string;
    network?: string;
  } | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  async function handleWalletConfirm() {
    if (!selectedCrypto || !amount || !walletAddress) {
      return;
    }

    const crypto = WITHDRAWAL_METHODS[selectedCrypto];
    const parsed = parseFloat(amount);

    if (!parsed || parsed <= 0) {
      setWithdrawError("Enter a valid amount.");
      return;
    }

    const available = account?.balance ?? 0;
    if (parsed > available) {
      setWithdrawError(`Insufficient balance. Available: ${fmt(available)}`);
      return;
    }

    setWithdrawError(null);

    const methodName =
      "name" in crypto && "symbol" in crypto
        ? `${crypto.name}`
        : WITHDRAWAL_METHODS.BANK.label;

    setProcessingWithdrawal({
      amount: parsed,
      method: methodName,
      network: "network" in crypto ? crypto.network : undefined,
    });

    setShowWalletModal(false);
    setShowProcessingModal(true);

    // Simulate processing delay
    setTimeout(async () => {
      const err = await submit(
        parsed,
        methodName as WithdrawalRow["method"],
        walletAddress,
      );

      if (!err) {
        setShowProcessingModal(false);
        setAmount("");
        setWalletAddress("");
        setSelectedCrypto(null);
        setProcessingWithdrawal(null);
      }
    }, 2000);
  }

  async function handleBankConfirm() {
    if (!bankAmount) return;
    const parsed = parseFloat(bankAmount);
    if (!parsed || parsed <= 0) {
      setWithdrawError("Enter a valid amount.");
      return;
    }

    const available = account?.balance ?? 0;
    if (parsed > available) {
      setWithdrawError(`Insufficient balance. Available: ${fmt(available)}`);
      return;
    }

    setWithdrawError(null);

    setProcessingWithdrawal({
      amount: parsed,
      method: "Bank Transfer",
    });

    setShowBankModal(false);
    setShowProcessingModal(true);

    // Simulate processing delay
    setTimeout(async () => {
      const err = await submit(parsed, "Bank Transfer");

      if (!err) {
        setShowProcessingModal(false);
        setBankAmount("");
        setMethod("");
        setProcessingWithdrawal(null);
      }
    }, 2000);
  }

  function handleMethodSelect(methodId: string) {
    if (methodId === "bank") {
      setBankAmount("");
      setShowBankModal(true);
    } else {
      const key = methodId
        .toUpperCase()
        .replace(/_/g, "_") as keyof typeof WITHDRAWAL_METHODS;
      if (key in WITHDRAWAL_METHODS) {
        setSelectedCrypto(key);
        setShowWalletModal(true);
      }
    }
  }

  const available = account?.balance ?? 0;

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Withdrawals"
          subtitle={`Welcome back, ${userName}`}
          onSidebarToggle={setSidebarOpen}
          balance={available}
        />

        <main className="flex-1 px-4 md:px-8 py-5 md:py-8 space-y-6 animate-fadeInUp">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {[
              {
                label: "Available to Withdraw",
                value: fmt(available),
                sub: "Current balance",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-(--background-card) border border-(--border-normal) rounded-xl p-5"
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

          {/* Request payout form */}
          <div className="bg-(--background-card) border border-(--border-normal) rounded-xl p-5 md:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-(--global-text)">
              Withdrawal Methods
            </h2>

            {/* Bank Transfer Card */}
            <button
              onClick={() => handleMethodSelect("bank")}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                method === "Bank Transfer"
                  ? "border-(--primary-default) bg-(--primary-default)/5"
                  : "border-(--border-normal) hover:border-(--primary-default)/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-(--primary-default)/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-(--primary-default)"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h10m4 0a1 1 0 11-2 0m2 0a1 1 0 10-2 0m-4-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-(--global-text)">
                    Bank Transfer
                  </p>
                  <p className="text-xs text-(--text-white-50)">
                    Withdraw to your bank account
                  </p>
                </div>
              </div>
            </button>

            {/* Cryptocurrency Networks */}
            <div>
              <p className="text-xs font-semibold text-(--text-white-50) mb-3 uppercase tracking-wider">
                Cryptocurrency Networks
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(WITHDRAWAL_METHODS)
                  .filter(([key]) => key !== "BANK")
                  .map(([key, crypto]) => (
                    <button
                      key={key}
                      onClick={() => handleMethodSelect(key.toLowerCase())}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedCrypto === key
                          ? "border-(--primary-default) bg-(--primary-default)/5"
                          : "border-(--border-normal) hover:border-(--primary-default)/50"
                      }`}
                    >
                      <p className="font-semibold text-sm text-(--global-text)">
                        {"symbol" in crypto ? crypto.symbol : crypto.name}
                      </p>
                      <p className="text-xs text-(--text-white-50)">
                        {"network" in crypto ? crypto.network : ""}
                      </p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Amount Input */}
          </div>

          {/* History table */}
          <div className="bg-(--background-card) border border-(--border-normal) rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-(--border-normal)">
              <h2 className="text-sm font-semibold text-(--global-text)">
                Withdrawal History
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        Loading…
                      </td>
                    </tr>
                  ) : withdrawals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-(--text-white-50)"
                      >
                        No withdrawals yet
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr
                        key={w.id}
                        className="hover:bg-white/2 transition-colors"
                      >
                        <td className="px-5 py-3 font-semibold">
                          {fmt(w.amount)}
                        </td>
                        <td className="px-5 py-3 text-(--text-white-50)">
                          {w.method}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              w.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : w.status === "Rejected"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-yellow-500/10 text-yellow-400"
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-(--text-white-50)">
                          {fmtDate(w.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Wallet Address Input Modal */}
      {showWalletModal &&
        selectedCrypto &&
        selectedCrypto in WITHDRAWAL_METHODS && (
          <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
            <div className="bg-(--foreground-default) border border-(--border-normal) rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeInUp">
              {(() => {
                const crypto = WITHDRAWAL_METHODS[selectedCrypto];
                return "address" in crypto ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-(--global-text)">
                        Withdraw {"symbol" in crypto ? crypto.symbol : ""}
                      </p>
                      <p className="text-xs text-(--text-white-50)">
                        {"network" in crypto ? crypto.network : ""}
                      </p>
                    </div>
                    {withdrawError && (
                      <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {withdrawError}
                      </p>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-(--text-white-50)">
                        Your Wallet Address
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`Enter your ${"symbol" in crypto ? crypto.symbol : ""} address`}
                        className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
                      />
                    </div>

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

                    <p className="text-xs text-(--text-white-50) bg-(--background-default) rounded-lg p-3">
                      We will send {"symbol" in crypto ? crypto.symbol : ""} to
                      the address you provide. We will process your withdrawal
                      within 24 hours.
                    </p>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setShowWalletModal(false);
                          setSelectedCrypto(null);
                          setAmount("");
                          setWalletAddress("");
                          setWithdrawError(null);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-(--border-normal) text-(--global-text) hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleWalletConfirm}
                        disabled={!amount || !walletAddress}
                        className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm
                      </button>
                    </div>
                  </>
                ) : null;
              })()}
            </div>
          </div>
        )}

      {/* Bank Withdrawal Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-(--border-normal) rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeInUp">
            <div>
              <p className="text-sm font-semibold text-(--global-text)">
                Bank Transfer Withdrawal
              </p>
              <p className="text-xs text-(--text-white-50) mt-1">
                Transfer funds to your bank account
              </p>
            </div>

            {withdrawError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {withdrawError}
              </p>
            )}

            <div className="bg-(--background-default) rounded-lg p-3 space-y-2">
              <p className="text-xs text-(--text-white-50)">
                Contact us @support.susanfxwebmailblah.co. An instant bank will
                be provided for you
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-(--text-white-50)">
                Amount (USD)
              </label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={bankAmount}
                onChange={(e) => setBankAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-(--background-default) border border-(--strokes-default) rounded-lg px-3 py-2.5 text-sm text-(--global-text) placeholder:text-(--text-white-50) outline-none focus:border-(--primary-default) transition-colors"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowBankModal(false);
                  setBankAmount("");
                  setWithdrawError(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold border border-(--border-normal) text-(--global-text) hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBankConfirm}
                disabled={!bankAmount}
                className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Modal */}
      {showProcessingModal && processingWithdrawal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowProcessingModal(false)}
        >
          <div
            className="bg-(--foreground-default) border border-(--border-normal) rounded-2xl max-w-md w-full p-6 space-y-4 animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-(--global-text)">
                  Pending Confirmation
                </p>
                <p className="text-xs text-(--text-white-50) mt-1">
                  Your withdrawal request has been submitted
                </p>
              </div>
              <button
                onClick={() => setShowProcessingModal(false)}
                className="text-(--text-white-50) hover:text-(--global-text) transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-(--background-default) rounded-lg p-4 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Amount</span>
                <span className="text-(--global-text) font-semibold">
                  {fmt(processingWithdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Method</span>
                <span className="text-(--global-text) font-semibold">
                  {processingWithdrawal.method}
                </span>
              </div>
              {processingWithdrawal.network && (
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Network</span>
                  <span className="text-(--global-text) font-semibold">
                    {processingWithdrawal.network}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
              <p className="text-xs text-emerald-400">
                ✓ Your withdrawal has been submitted and is pending processing.
                You will receive updates via email.
              </p>
            </div>

            <button
              onClick={() => setShowProcessingModal(false)}
              className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold bg-(--primary-default) text-(--primary-text) hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
