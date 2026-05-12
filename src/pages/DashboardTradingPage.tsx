import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopBar from "../components/dashboard/DashboardTopBar";
import FxChart from "../components/dashboard/FxChart";
import { useAuth } from "../context/AuthContext";
import { useTrades } from "../hooks/useTrades";
import { useAccount } from "../hooks/useAccount";
import { useToast, ToastContainer } from "../components/ui/Toast";

// ── Symbol catalogue ─────────────────────────────────────────────────────────
const SYMBOLS = [
  { label: "EUR/USD", category: "Forex" },
  { label: "GBP/USD", category: "Forex" },
  { label: "USD/JPY", category: "Forex" },
  { label: "XAU/USD", category: "Metals" },
  { label: "NAS100", category: "Indices" },
  { label: "US30", category: "Indices" },
  { label: "BTC/USD", category: "Crypto" },
];

// ── Base prices (kept in sync with FxChart) ──────────────────────────────────
const BASE_PRICES: Record<string, number> = {
  "EUR/USD": 1.0842,
  "GBP/USD": 1.2734,
  "USD/JPY": 154.22,
  "XAU/USD": 2318.4,
  NAS100: 17840,
  US30: 38500,
  "BTC/USD": 62400,
};

// ── Volatility — max % move per 500ms tick ───────────────────────────────────
const VOLATILITY: Record<string, number> = {
  "EUR/USD": 0.00015,
  "GBP/USD": 0.0002,
  "USD/JPY": 0.00015,
  "XAU/USD": 0.0004,
  NAS100: 0.0006,
  US30: 0.0005,
  "BTC/USD": 0.0012,
};

// ── Price decimal places for display ─────────────────────────────────────────
const PRICE_DECIMALS: Record<string, number> = {
  "EUR/USD": 5,
  "GBP/USD": 5,
  "USD/JPY": 3,
  "XAU/USD": 2,
  NAS100: 2,
  US30: 2,
  "BTC/USD": 2,
};

// ── Contract sizes & P&L computation ─────────────────────────────────────────
// P&L is always expressed in USD.
function calcPnl(
  pair: string,
  type: "Buy" | "Sell",
  size: number,
  openPrice: number,
  currentPrice: number,
): number {
  const direction = type === "Buy" ? 1 : -1;
  const diff = currentPrice - openPrice;
  if (pair === "EUR/USD" || pair === "GBP/USD") {
    return direction * diff * size * 100000;
  }
  if (pair === "USD/JPY") {
    // convert JPY profit to USD
    return (direction * diff * size * 100000) / currentPrice;
  }
  if (pair === "XAU/USD") {
    return direction * diff * size * 100;
  }
  // NAS100, US30, BTC/USD — 1 lot = 1 unit
  return direction * diff * size;
}

// ── Fee schedule ─────────────────────────────────────────────────────────────
const FEES: Record<
  string,
  {
    spread: string;
    commission: string;
    swap_long: string;
    swap_short: string;
    minLot: string;
    maxLot: string;
    spreadPips: number;
  }
> = {
  "EUR/USD": {
    spread: "0.1 pips",
    commission: "$3.50/lot",
    swap_long: "-0.52",
    swap_short: "0.18",
    minLot: "0.01",
    maxLot: "50",
    spreadPips: 0.00001,
  },
  "GBP/USD": {
    spread: "0.3 pips",
    commission: "$3.50/lot",
    swap_long: "-0.84",
    swap_short: "0.32",
    minLot: "0.01",
    maxLot: "50",
    spreadPips: 0.00003,
  },
  "USD/JPY": {
    spread: "0.2 pips",
    commission: "$3.50/lot",
    swap_long: "0.42",
    swap_short: "-0.76",
    minLot: "0.01",
    maxLot: "50",
    spreadPips: 0.002,
  },
  "XAU/USD": {
    spread: "0.20 pips",
    commission: "$5.00/lot",
    swap_long: "-4.20",
    swap_short: "1.80",
    minLot: "0.01",
    maxLot: "20",
    spreadPips: 0.02,
  },
  NAS100: {
    spread: "0.8 pts",
    commission: "$0.00/lot",
    swap_long: "-7.40",
    swap_short: "3.20",
    minLot: "0.10",
    maxLot: "100",
    spreadPips: 0.8,
  },
  US30: {
    spread: "1.0 pts",
    commission: "$0.00/lot",
    swap_long: "-8.10",
    swap_short: "3.50",
    minLot: "0.10",
    maxLot: "100",
    spreadPips: 1.0,
  },
  "BTC/USD": {
    spread: "12 pts",
    commission: "$0.00/lot",
    swap_long: "-22.00",
    swap_short: "-22.00",
    minLot: "0.01",
    maxLot: "10",
    spreadPips: 12,
  },
};

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function fmtPrice(symbol: string, price: number) {
  return price.toFixed(PRICE_DECIMALS[symbol] ?? 5);
}

export default function DashboardTradingPage() {
  const { user } = useAuth();
  const { trades, openTrade, closeTrade } = useTrades(user?.id);
  const { account, updateBalance } = useAccount(user?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [orderType, setOrderType] = useState<"Buy" | "Sell">("Buy");
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [activeTab, setActiveTab] = useState<"positions" | "history" | "fees">(
    "positions",
  );
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  // ── Live price simulation ─────────────────────────────────────────────────
  const [prices, setPrices] = useState<Record<string, number>>({
    ...BASE_PRICES,
  });
  const pricesRef = useRef<Record<string, number>>({ ...BASE_PRICES });

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        for (const sym of SYMBOLS) {
          const vol = VOLATILITY[sym.label] ?? 0.0002;
          const change = (Math.random() - 0.5) * 2 * vol * prev[sym.label];
          next[sym.label] = Math.max(0.0001, prev[sym.label] + change);
        }
        pricesRef.current = next;
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll when order sheet is open on mobile
  useEffect(() => {
    document.body.style.overflow = orderSheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [orderSheetOpen]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const openPositions = trades.filter((t) => t.status === "Open");
  const closedTrades = trades.filter((t) => t.status === "Closed");
  const currentPrice = prices[activeSymbol] ?? BASE_PRICES[activeSymbol];

  // Unrealized P&L across all open positions
  const totalUnrealizedPnl = openPositions.reduce((sum, t) => {
    return (
      sum +
      calcPnl(
        t.pair,
        t.type,
        t.size,
        t.open_price,
        prices[t.pair] ?? t.open_price,
      )
    );
  }, 0);

  const balance = account?.balance ?? 0;
  const equity = balance + totalUnrealizedPnl;

  // ── Live risk calculation ─────────────────────────────────────────────────
  const feeInfo = FEES[activeSymbol];
  const lotSize = parseFloat(lots) || 0;
  const entryPrice = useMemo(() =>
    orderType === "Buy"
      ? currentPrice + feeInfo.spreadPips
      : currentPrice - feeInfo.spreadPips,
  [orderType, currentPrice, feeInfo.spreadPips]);

  const spreadCostUsd = useMemo(() => {
    if (lotSize <= 0) return 0;
    return Math.abs(calcPnl(activeSymbol, orderType, lotSize, entryPrice, entryPrice - feeInfo.spreadPips));
  }, [activeSymbol, orderType, lotSize, entryPrice, feeInfo.spreadPips]);

  const riskUsd = useMemo(() => {
    if (!sl || lotSize <= 0) return null;
    const slPrice = parseFloat(sl);
    if (isNaN(slPrice)) return null;
    return calcPnl(activeSymbol, orderType, lotSize, entryPrice, slPrice);
  }, [sl, lotSize, activeSymbol, orderType, entryPrice]);

  const rewardUsd = useMemo(() => {
    if (!tp || lotSize <= 0) return null;
    const tpPrice = parseFloat(tp);
    if (isNaN(tpPrice)) return null;
    return calcPnl(activeSymbol, orderType, lotSize, entryPrice, tpPrice);
  }, [tp, lotSize, activeSymbol, orderType, entryPrice]);

  // ── Order handlers ────────────────────────────────────────────────────────
  // Step 1: validate and open confirmation modal
  const handlePlaceOrder = useCallback(() => {
    setOrderError(null);
    const size = parseFloat(lots);
    if (isNaN(size) || size <= 0) {
      setOrderError("Invalid lot size.");
      return;
    }
    if (
      size < parseFloat(feeInfo.minLot) ||
      size > parseFloat(feeInfo.maxLot)
    ) {
      setOrderError(
        `Lot size must be between ${feeInfo.minLot} and ${feeInfo.maxLot}.`,
      );
      return;
    }
    if (balance <= 0) {
      setOrderError("Insufficient balance to place a trade.");
      return;
    }
    setShowConfirmModal(true);
  }, [lots, feeInfo, balance]);

  // Step 2: confirmed — actually execute the order
  const handleConfirmOrder = useCallback(async () => {
    const size = parseFloat(lots);
    setSubmitting(true);
    const { error } = await openTrade({
      pair: activeSymbol,
      type: orderType,
      size,
      openPrice: entryPrice,
      sl: sl ? parseFloat(sl) : null,
      tp: tp ? parseFloat(tp) : null,
    });
    setSubmitting(false);
    setShowConfirmModal(false);

    if (error) {
      setOrderError(error);
      return;
    }
    addToast(
      `${orderType} ${size} lots of ${activeSymbol} opened @ ${fmtPrice(activeSymbol, entryPrice)}`,
      "success",
    );
    setLots("0.10");
    setSl("");
    setTp("");
    setActiveTab("positions");
    setOrderSheetOpen(false);
  }, [lots, activeSymbol, orderType, entryPrice, sl, tp, openTrade, addToast]);

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const handleCloseTrade = useCallback(
    async (tradeId: string) => {
      const trade = openPositions.find((t) => t.id === tradeId);
      if (!trade) return;
      const closePrice = pricesRef.current[trade.pair] ?? trade.open_price;
      const pnl = calcPnl(
        trade.pair,
        trade.type,
        trade.size,
        trade.open_price,
        closePrice,
      );

      setClosingId(tradeId);
      const err = await closeTrade(tradeId, closePrice, pnl);
      if (!err) {
        const newBalance = balance + pnl;
        await updateBalance(newBalance);
        addToast(
          `${trade.pair} ${trade.type} closed @ ${fmtPrice(trade.pair, closePrice)} | P&L: ${pnl >= 0 ? "+" : ""}${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(pnl)}`,
          pnl >= 0 ? "success" : "error",
        );
      }
      setClosingId(null);
    },
    [openPositions, closeTrade, balance, updateBalance, addToast],
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        <DashboardTopBar
          title="Trading"
          subtitle="Trade the market"
          onSidebarToggle={setSidebarOpen}
          balance={balance}
          actions={
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="text-right">
                <p className="text-(--text-white-50)">Balance</p>
                <p className="font-semibold text-(--global-text)">
                  {fmt(balance)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-(--text-white-50)">Equity</p>
                <p
                  className={`font-semibold ${equity >= balance ? "text-emerald-400" : "text-red-400"}`}
                >
                  {fmt(equity)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-(--text-white-50)">P&L</p>
                <p
                  className={`font-semibold ${totalUnrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                >
                  {totalUnrealizedPnl >= 0 ? "+" : ""}
                  {fmt(totalUnrealizedPnl)}
                </p>
              </div>
            </div>
          }
        />

        {/* ── Main layout ────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* ── Symbol strip ───────────────────────────────────────── */}
          <aside className="lg:w-44 shrink-0 border-b lg:border-b-0 lg:border-r border-(--border-normal) bg-(--background-tertiary)">
            <div className="px-3 py-2 lg:py-3 border-b border-(--border-normal)">
              <p className="text-xs font-semibold text-(--text-white-50) uppercase tracking-wider">
                Instruments
              </p>
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto scrollbar-none">
              {SYMBOLS.map((s) => {
                const p = prices[s.label] ?? BASE_PRICES[s.label];
                const base = BASE_PRICES[s.label];
                const up = p >= base;
                return (
                  <button
                    key={s.label}
                    onClick={() => setActiveSymbol(s.label)}
                    className={`shrink-0 text-left px-3 lg:px-4 py-2 lg:py-3 border-r lg:border-r-0 lg:border-b border-(--border-normal) transition-colors ${
                      activeSymbol === s.label
                        ? "bg-(--primary-default)/10 text-(--primary-default) border-b-2 lg:border-b-0 lg:border-l-2 border-(--primary-default)"
                        : "text-(--text-white-50) hover:text-(--global-text) hover:bg-white/5"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                      {s.label}
                    </p>
                    <p
                      className={`text-xs hidden lg:block font-mono ${up ? "text-emerald-400" : "text-red-400"}`}
                    >
                      {fmtPrice(s.label, p)}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Chart + bottom panel ───────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            <div className="h-64 sm:h-80 lg:flex-1 lg:h-auto shrink-0 lg:shrink p-2 sm:p-3 lg:p-4">
              <FxChart symbol={activeSymbol} trades={trades} />
            </div>

            {/* ── Bottom panel ───────────────────────────────────── */}
            <div className="border-t border-(--border-normal) flex flex-col h-52 sm:h-60 lg:h-72 shrink-0">
              {/* Tabs */}
              <div className="flex border-b border-(--border-normal) shrink-0">
                {(
                  [
                    {
                      key: "positions",
                      label: `Positions (${openPositions.length})`,
                    },
                    {
                      key: "history",
                      label: `History (${closedTrades.length})`,
                    },
                    { key: "fees", label: "Fee Schedule" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                      activeTab === key
                        ? "border-(--primary-default) text-(--primary-default)"
                        : "border-transparent text-(--text-white-50) hover:text-(--global-text)"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto">
                {activeTab === "positions" && (
                  <table className="w-full text-xs min-w-160">
                    <thead className="sticky top-0 bg-(--background-tertiary)">
                      <tr className="text-(--text-white-50) uppercase tracking-wider border-b border-(--border-normal)">
                        {[
                          "Symbol",
                          "Type",
                          "Lots",
                          "Open",
                          "Current",
                          "SL",
                          "TP",
                          "P&L",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className={`text-left px-4 py-2 font-medium ${
                              ["Open", "Current", "SL", "TP"].includes(h)
                                ? "hidden md:table-cell"
                                : ""
                            }`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-normal)">
                      {openPositions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="px-4 py-8 text-center text-(--text-white-50)"
                          >
                            No open positions. Place a trade using the order
                            panel.
                          </td>
                        </tr>
                      ) : (
                        openPositions.map((p) => {
                          const cur = prices[p.pair] ?? p.open_price;
                          const pnl = calcPnl(
                            p.pair,
                            p.type,
                            p.size,
                            p.open_price,
                            cur,
                          );
                          return (
                            <tr
                              key={p.id}
                              onClick={() => setSelectedPositionId(p.id)}
                              className="hover:bg-white/5 transition-colors cursor-pointer"
                            >
                              <td className="px-4 py-2.5 font-semibold">
                                {p.pair}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                                >
                                  {p.type}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-(--text-white-50)">
                                {p.size.toFixed(2)}
                              </td>
                              <td className="hidden md:table-cell px-4 py-2.5 text-(--text-white-50) font-mono">
                                {fmtPrice(p.pair, p.open_price)}
                              </td>
                              <td className="hidden md:table-cell px-4 py-2.5 font-mono">
                                {fmtPrice(p.pair, cur)}
                              </td>
                              <td className="hidden md:table-cell px-4 py-2.5 text-red-400">
                                {p.sl ? fmtPrice(p.pair, p.sl) : "—"}
                              </td>
                              <td className="hidden md:table-cell px-4 py-2.5 text-emerald-400">
                                {p.tp ? fmtPrice(p.pair, p.tp) : "—"}
                              </td>
                              <td
                                className={`px-4 py-2.5 font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                {pnl >= 0 ? "+" : ""}
                                {fmt(pnl)}
                              </td>
                              <td className="px-4 py-2.5">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCloseTrade(p.id); }}
                                  disabled={closingId === p.id}
                                  className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium disabled:opacity-50"
                                >
                                  {closingId === p.id ? "Closing…" : "Close"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "history" && (
                  <table className="w-full text-xs min-w-140">
                    <thead className="sticky top-0 bg-(--background-tertiary)">
                      <tr className="text-(--text-white-50) uppercase tracking-wider border-b border-(--border-normal)">
                        {[
                          "Symbol",
                          "Type",
                          "Lots",
                          "Open",
                          "Close",
                          "P&L",
                          "Date",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-normal)">
                      {closedTrades.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-(--text-white-50)"
                          >
                            No closed trades yet.
                          </td>
                        </tr>
                      ) : (
                        closedTrades.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-white/2 transition-colors"
                          >
                            <td className="px-4 py-2.5 font-semibold">
                              {t.pair}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={`px-1.5 py-0.5 rounded text-xs font-medium ${t.type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-(--text-white-50)">
                              {t.size.toFixed(2)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-(--text-white-50)">
                              {fmtPrice(t.pair, t.open_price)}
                            </td>
                            <td className="px-4 py-2.5 font-mono text-(--text-white-50)">
                              {t.close_price
                                ? fmtPrice(t.pair, t.close_price)
                                : "—"}
                            </td>
                            <td
                              className={`px-4 py-2.5 font-semibold ${(t.pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                              {(t.pnl ?? 0) >= 0 ? "+" : ""}
                              {fmt(t.pnl ?? 0)}
                            </td>
                            <td className="px-4 py-2.5 text-(--text-white-50)">
                              {new Date(
                                t.closed_at ?? t.opened_at,
                              ).toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "fees" && (
                  <div className="p-4">
                    <p className="text-xs text-(--text-white-50) mb-3">
                      Fee schedule for{" "}
                      <span className="text-(--primary-default) font-semibold">
                        {activeSymbol}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { label: "Spread", value: feeInfo.spread },
                        { label: "Commission", value: feeInfo.commission },
                        {
                          label: "Swap Long",
                          value: `${feeInfo.swap_long} pts/night`,
                        },
                        {
                          label: "Swap Short",
                          value: `${feeInfo.swap_short} pts/night`,
                        },
                        { label: "Min Lot", value: feeInfo.minLot },
                        { label: "Max Lot", value: feeInfo.maxLot },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="bg-white/3 rounded-lg p-3"
                        >
                          <p className="text-xs text-(--text-white-50) mb-1">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-(--global-text)">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-(--text-white-50) mt-3">
                      Swaps are charged at 23:59 server time (GMT+2). Triple
                      swap on Wednesdays for Forex &amp; Metals.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Order panel ────────────────────────────────────────── */}
          {orderSheetOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setOrderSheetOpen(false)}
            />
          )}

          <aside
            className={`
              max-lg:fixed max-lg:bottom-0 max-lg:left-0 max-lg:right-0 max-lg:z-50
              lg:w-64 shrink-0
              flex flex-col
              bg-(--background-tertiary)
              max-lg:border-t lg:border-l border-(--border-normal)
              transition-transform duration-300 ease-in-out
              max-lg:max-h-[90vh] max-lg:rounded-t-2xl
              ${orderSheetOpen ? "" : "max-lg:translate-y-full"}
            `}
          >
            {/* Drag handle (mobile only) */}
            <div className="lg:hidden flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-4 py-3 border-b border-(--border-normal) flex items-center justify-between shrink-0">
              <div>
                <p className="text-xs font-semibold text-(--text-white-50) uppercase tracking-wider">
                  New Order
                </p>
                <p className="text-sm font-bold text-(--global-text) mt-0.5">
                  {activeSymbol}
                </p>
              </div>
              <button
                className="lg:hidden text-(--text-white-50) hover:text-(--global-text) transition-colors p-1"
                onClick={() => setOrderSheetOpen(false)}
                aria-label="Close order panel"
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Balance chip */}
              <div className="bg-white/3 rounded-lg px-3 py-2 flex justify-between text-xs">
                <span className="text-(--text-white-50)">Balance</span>
                <span className="font-semibold text-(--global-text)">
                  {fmt(balance)}
                </span>
              </div>

              {/* Live price */}
              <div className="text-center">
                <p className="text-xs text-(--text-white-50) mb-0.5">
                  Market Price
                </p>
                <p className="text-xl font-bold font-mono text-(--global-text)">
                  {fmtPrice(activeSymbol, currentPrice)}
                </p>
                <p className="text-xs mt-0.5">
                  <span className="text-emerald-400">
                  ASK {fmtPrice(activeSymbol, currentPrice + feeInfo.spreadPips)}
                  </span>
                  {" · "}
                  <span className="text-red-400">
                    BID {fmtPrice(activeSymbol, currentPrice - feeInfo.spreadPips)}
                  </span>
                </p>
              </div>

              {/* Buy / Sell toggle */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setOrderType("Buy")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${orderType === "Buy" ? "bg-emerald-500 text-white" : "bg-white/5 text-(--text-white-50) hover:bg-white/10"}`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setOrderType("Sell")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${orderType === "Sell" ? "bg-red-500 text-white" : "bg-white/5 text-(--text-white-50) hover:bg-white/10"}`}
                >
                  SELL
                </button>
              </div>

              {/* Lot size */}
              <div>
                <label className="block text-xs text-(--text-white-50) mb-1.5">
                  Lot Size
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setLots((v) =>
                        Math.max(
                          parseFloat(feeInfo.minLot),
                          parseFloat(v) - 0.01,
                        ).toFixed(2),
                      )
                    }
                    className="w-8 h-8 rounded bg-white/5 text-(--global-text) hover:bg-white/10 transition-colors text-lg leading-none"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={lots}
                    onChange={(e) => setLots(e.target.value)}
                    step="0.01"
                    min={feeInfo.minLot}
                    max={feeInfo.maxLot}
                    className="flex-1 bg-white/5 border border-(--border-normal) rounded px-3 py-1.5 text-sm text-center text-(--global-text) focus:outline-none focus:border-(--primary-default)"
                  />
                  <button
                    onClick={() =>
                      setLots((v) =>
                        Math.min(
                          parseFloat(feeInfo.maxLot),
                          parseFloat(v) + 0.01,
                        ).toFixed(2),
                      )
                    }
                    className="w-8 h-8 rounded bg-white/5 text-(--global-text) hover:bg-white/10 transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-(--text-white-50) mt-1">
                  Range: {feeInfo.minLot} – {feeInfo.maxLot} lots
                </p>
              </div>

              {/* Live risk / reward calculator */}
              {lotSize > 0 && (
                <div className="bg-white/3 rounded-lg p-3 text-xs space-y-1.5">
                  <p className="text-(--text-white-50) font-semibold mb-1">Order Summary</p>
                  <div className="flex justify-between">
                    <span className="text-(--text-white-50)">Entry price</span>
                    <span className="font-mono">{fmtPrice(activeSymbol, entryPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-(--text-white-50)">Spread cost</span>
                    <span className="font-mono text-red-400">−{fmt(spreadCostUsd)}</span>
                  </div>
                  {riskUsd !== null && (
                    <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
                      <span className="text-(--text-white-50)">Risk if SL hits</span>
                      <span className={`font-mono font-semibold ${riskUsd < 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {riskUsd >= 0 ? "+" : ""}{fmt(riskUsd)}
                      </span>
                    </div>
                  )}
                  {rewardUsd !== null && (
                    <div className="flex justify-between">
                      <span className="text-(--text-white-50)">Reward if TP hits</span>
                      <span className={`font-mono font-semibold ${rewardUsd >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {rewardUsd >= 0 ? "+" : ""}{fmt(rewardUsd)}
                      </span>
                    </div>
                  )}
                  {riskUsd !== null && rewardUsd !== null && riskUsd < 0 && rewardUsd > 0 && (
                    <div className="flex justify-between border-t border-white/10 pt-1.5 mt-1">
                      <span className="text-(--text-white-50)">R:R ratio</span>
                      <span className="font-mono font-semibold text-(--primary-default)">
                        1 : {(rewardUsd / Math.abs(riskUsd)).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Stop Loss */}
              <div>
                <label className="block text-xs text-(--text-white-50) mb-1.5">
                  Stop Loss (optional)
                </label>
                <input
                  type="number"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  placeholder={`e.g. ${fmtPrice(activeSymbol, currentPrice * 0.999)}`}
                  className="w-full bg-white/5 border border-(--border-normal) rounded px-3 py-1.5 text-sm text-(--global-text) placeholder:text-(--text-white-50)/50 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Take Profit */}
              <div>
                <label className="block text-xs text-(--text-white-50) mb-1.5">
                  Take Profit (optional)
                </label>
                <input
                  type="number"
                  value={tp}
                  onChange={(e) => setTp(e.target.value)}
                  placeholder={`e.g. ${fmtPrice(activeSymbol, currentPrice * 1.001)}`}
                  className="w-full bg-white/5 border border-(--border-normal) rounded px-3 py-1.5 text-sm text-(--global-text) placeholder:text-(--text-white-50)/50 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Fee summary */}
              <div className="bg-white/3 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Spread</span>
                  <span>{feeInfo.spread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Commission</span>
                  <span>{feeInfo.commission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">
                    Swap ({orderType === "Buy" ? "long" : "short"})
                  </span>
                  <span
                    className={
                      parseFloat(
                        orderType === "Buy" ? feeInfo.swap_long : feeInfo.swap_short,
                      ) < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {orderType === "Buy" ? feeInfo.swap_long : feeInfo.swap_short} pts
                  </span>
                </div>
              </div>

              {/* Error feedback */}
              {orderError && (
                <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {orderError}
                </p>
              )}
            </div>

            {/* Place order button */}
            <div className="p-4 border-t border-(--border-normal)">
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className={`w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  orderType === "Buy"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {submitting ? "Placing…" : `Place ${orderType} Order`}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile FAB: open order sheet ─────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 right-5 z-30">
        <button
          onClick={() => setOrderSheetOpen(true)}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold shadow-xl transition-opacity hover:opacity-90 ${
            orderType === "Buy"
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Order
        </button>
      </div>

      {/* ── Confirm Order Modal ───────────────────────────────────────── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-(--background-card) border border-(--border-normal) rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-(--global-text)">Confirm Order</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Pair</span>
                <span className="font-semibold">{activeSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Direction</span>
                <span className={`font-bold ${orderType === "Buy" ? "text-emerald-400" : "text-red-400"}`}>{orderType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Lot size</span>
                <span className="font-mono">{lotSize.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--text-white-50)">Entry price</span>
                <span className="font-mono">{fmtPrice(activeSymbol, entryPrice)}</span>
              </div>
              {spreadCostUsd > 0 && (
                <div className="flex justify-between border-t border-(--border-normal) pt-2">
                  <span className="text-(--text-white-50)">Spread cost</span>
                  <span className="font-mono text-red-400">−{fmt(spreadCostUsd)}</span>
                </div>
              )}
              {riskUsd !== null && (
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Max risk (SL)</span>
                  <span className={`font-mono font-semibold ${riskUsd < 0 ? "text-red-400" : "text-emerald-400"}`}>
                    {riskUsd >= 0 ? "+" : ""}{fmt(riskUsd)}
                  </span>
                </div>
              )}
              {rewardUsd !== null && (
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Max reward (TP)</span>
                  <span className={`font-mono font-semibold ${rewardUsd >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {rewardUsd >= 0 ? "+" : ""}{fmt(rewardUsd)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-(--border-normal) text-sm font-medium text-(--global-text) hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={submitting}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${
                  orderType === "Buy" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                }`}
              >
                {submitting ? "Placing…" : `Confirm ${orderType}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Position Detail Modal ─────────────────────────────────────────── */}
      {(() => {
        const p = selectedPositionId
          ? openPositions.find((t) => t.id === selectedPositionId)
          : null;
        if (!p) return null;
        const cur = prices[p.pair] ?? p.open_price;
        const pnl = calcPnl(p.pair, p.type, p.size, p.open_price, cur);
        const isClosing = closingId === p.id;
        return (
          <div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPositionId(null)}
          >
            <div
              className="bg-(--background-card) border border-(--border-normal) rounded-2xl max-w-sm w-full p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-base font-bold text-(--global-text)">{p.pair}</p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${
                      p.type === "Buy"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {p.type}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPositionId(null)}
                  className="text-(--text-white-50) hover:text-(--global-text) transition-colors p-1 -mr-1 -mt-1"
                  aria-label="Close"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Details grid */}
              <div className="bg-white/3 rounded-xl p-4 space-y-2.5 text-sm">
                {[
                  { label: "Lot size", value: p.size.toFixed(2) },
                  { label: "Open price", value: fmtPrice(p.pair, p.open_price), mono: true },
                  { label: "Current price", value: fmtPrice(p.pair, cur), mono: true },
                  { label: "Stop Loss", value: p.sl ? fmtPrice(p.pair, p.sl) : "—", color: "text-red-400", mono: true },
                  { label: "Take Profit", value: p.tp ? fmtPrice(p.pair, p.tp) : "—", color: "text-emerald-400", mono: true },
                  {
                    label: "Opened",
                    value: new Date(p.opened_at).toLocaleString("en-US", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    }),
                  },
                ].map(({ label, value, color, mono }) => (
                  <div key={label} className="flex justify-between items-center gap-4">
                    <span className="text-(--text-white-50) text-xs">{label}</span>
                    <span className={`text-xs font-medium ${color ?? "text-(--global-text)"} ${mono ? "font-mono" : ""}`}>{value}</span>
                  </div>
                ))}

                {/* Unrealized P&L — highlighted */}
                <div className="flex justify-between items-center gap-4 border-t border-white/10 pt-2.5 mt-0.5">
                  <span className="text-(--text-white-50) text-xs">Unrealized P&L</span>
                  <span className={`text-sm font-bold font-mono ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {pnl >= 0 ? "+" : ""}{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(pnl)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPositionId(null)}
                  className="flex-1 py-2.5 rounded-lg border border-(--border-normal) text-sm font-medium text-(--global-text) hover:bg-white/5 transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={async () => {
                    await handleCloseTrade(p.id);
                    setSelectedPositionId(null);
                  }}
                  disabled={isClosing}
                  className="flex-1 py-2.5 rounded-lg bg-red-500 text-white text-sm font-bold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClosing ? "Closing…" : "Close Trade"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
