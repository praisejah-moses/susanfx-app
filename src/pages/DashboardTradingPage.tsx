import { useState, useEffect } from "react";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import FxChart from "../components/dashboard/FxChart";

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
  }
> = {
  "EUR/USD": {
    spread: "0.1 pips",
    commission: "$3.50/lot",
    swap_long: "-0.52",
    swap_short: "0.18",
    minLot: "0.01",
    maxLot: "50",
  },
  "GBP/USD": {
    spread: "0.3 pips",
    commission: "$3.50/lot",
    swap_long: "-0.84",
    swap_short: "0.32",
    minLot: "0.01",
    maxLot: "50",
  },
  "USD/JPY": {
    spread: "0.2 pips",
    commission: "$3.50/lot",
    swap_long: "0.42",
    swap_short: "-0.76",
    minLot: "0.01",
    maxLot: "50",
  },
  "XAU/USD": {
    spread: "0.20 pips",
    commission: "$5.00/lot",
    swap_long: "-4.20",
    swap_short: "1.80",
    minLot: "0.01",
    maxLot: "20",
  },
  NAS100: {
    spread: "0.8 pts",
    commission: "$0.00/lot",
    swap_long: "-7.40",
    swap_short: "3.20",
    minLot: "0.10",
    maxLot: "100",
  },
  US30: {
    spread: "1.0 pts",
    commission: "$0.00/lot",
    swap_long: "-8.10",
    swap_short: "3.50",
    minLot: "0.10",
    maxLot: "100",
  },
  "BTC/USD": {
    spread: "12 pts",
    commission: "$0.00/lot",
    swap_long: "-22.00",
    swap_short: "-22.00",
    minLot: "0.01",
    maxLot: "10",
  },
};

// ── Open positions (mock) ────────────────────────────────────────────────────
const POSITIONS = [
  {
    id: 1,
    symbol: "EUR/USD",
    type: "Buy",
    lots: "1.00",
    open: "1.0842",
    current: "1.0888",
    sl: "1.0800",
    tp: "1.0950",
    pnl: "+$460.00",
  },
  {
    id: 2,
    symbol: "XAU/USD",
    type: "Buy",
    lots: "0.10",
    open: "2318.40",
    current: "2332.10",
    sl: "2280.00",
    tp: "2380.00",
    pnl: "+$137.00",
  },
  {
    id: 3,
    symbol: "GBP/USD",
    type: "Sell",
    lots: "0.50",
    open: "1.2734",
    current: "1.2718",
    sl: "1.2800",
    tp: "1.2640",
    pnl: "+$80.00",
  },
];

export default function DashboardTradingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState("EUR/USD");
  const [orderType, setOrderType] = useState<"Buy" | "Sell">("Buy");
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [activeTab, setActiveTab] = useState<"positions" | "fees">("positions");
  // Mobile order sheet
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);

  // Lock body scroll when order sheet open on mobile
  useEffect(() => {
    if (orderSheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [orderSheetOpen]);

  const fee = FEES[activeSymbol];

  return (
    <div className="min-h-screen bg-(--background-default) text-(--global-text)">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="md:ml-60 flex flex-col min-h-screen">
        {/* ── Top bar ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-(--background-default)/95 backdrop-blur border-b border-(--border-normal) px-4 md:px-6 py-3 flex items-center justify-between gap-3">
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
            <h1 className="text-base md:text-lg font-semibold">Trading</h1>
            <p className="text-xs text-(--text-white-50) hidden sm:block">
              Live FX Charts &amp; Fee Schedule
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            MT5 Connected
          </span>
        </header>

        {/* ── Main layout ────────────────────────────────────────────── */}
        {/* On mobile: single column that fills viewport height minus header.
            On lg+: flex-row with sidebar, chart, order panel side by side.  */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden">
          {/* ── Symbol strip ───────────────────────────────────────── */}
          <aside className="lg:w-44 shrink-0 border-b lg:border-b-0 lg:border-r border-(--border-normal) bg-[#0a0a0a]">
            <div className="px-3 py-2 lg:py-3 border-b border-(--border-normal)">
              <p className="text-xs font-semibold text-(--text-white-50) uppercase tracking-wider">
                Instruments
              </p>
            </div>
            {/* Horizontal scroll on mobile, vertical list on lg */}
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto scrollbar-none">
              {SYMBOLS.map((s) => (
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
                  <p className="text-xs opacity-60 hidden lg:block">
                    {s.category}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* ── Chart + bottom panel ───────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            {/* Chart — fixed height on mobile, flex-1 on desktop */}
            <div className="h-64 sm:h-80 lg:flex-1 lg:h-auto shrink-0 lg:shrink p-2 sm:p-3 lg:p-4">
              <FxChart symbol={activeSymbol} />
            </div>

            {/* ── Bottom panel: positions / fees ─────────────────── */}
            <div className="border-t border-(--border-normal) flex flex-col h-48 sm:h-56 lg:h-64 shrink-0">
              {/* Tabs */}
              <div className="flex border-b border-(--border-normal) shrink-0">
                <button
                  onClick={() => setActiveTab("positions")}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "positions"
                      ? "border-(--primary-default) text-(--primary-default)"
                      : "border-transparent text-(--text-white-50) hover:text-(--global-text)"
                  }`}
                >
                  Positions ({POSITIONS.length})
                </button>
                <button
                  onClick={() => setActiveTab("fees")}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === "fees"
                      ? "border-(--primary-default) text-(--primary-default)"
                      : "border-transparent text-(--text-white-50) hover:text-(--global-text)"
                  }`}
                >
                  Fee Schedule
                </button>
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-auto animate-tabSlideContentIn">
                {activeTab === "positions" ? (
                  <table className="w-full text-xs min-w-140">
                    <thead className="sticky top-0 bg-[#0a0a0a]">
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
                            className="text-left px-4 py-2 font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--border-normal)">
                      {POSITIONS.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-white/2 transition-colors"
                        >
                          <td className="px-4 py-2.5 font-semibold">
                            {p.symbol}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-medium ${p.type === "Buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
                            >
                              {p.type}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-(--text-white-50)">
                            {p.lots}
                          </td>
                          <td className="px-4 py-2.5 text-(--text-white-50)">
                            {p.open}
                          </td>
                          <td className="px-4 py-2.5">{p.current}</td>
                          <td className="px-4 py-2.5 text-red-400">{p.sl}</td>
                          <td className="px-4 py-2.5 text-emerald-400">
                            {p.tp}
                          </td>
                          <td
                            className={`px-4 py-2.5 font-semibold ${p.pnl.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {p.pnl}
                          </td>
                          <td className="px-4 py-2.5">
                            <button className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium">
                              Close
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4">
                    <p className="text-xs text-(--text-white-50) mb-3">
                      Fee schedule for{" "}
                      <span className="text-(--primary-default) font-semibold">
                        {activeSymbol}
                      </span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {[
                        { label: "Spread", value: fee.spread },
                        { label: "Commission", value: fee.commission },
                        {
                          label: "Swap Long",
                          value: `${fee.swap_long} pts/night`,
                        },
                        {
                          label: "Swap Short",
                          value: `${fee.swap_short} pts/night`,
                        },
                        { label: "Min Lot", value: fee.minLot },
                        { label: "Max Lot", value: fee.maxLot },
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
          {/* Desktop: fixed right sidebar. Mobile: slide-up bottom sheet. */}

          {/* Mobile backdrop */}
          {orderSheetOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setOrderSheetOpen(false)}
            />
          )}

          <aside
            className={`
              fixed lg:static bottom-0 left-0 right-0 z-50
              lg:w-64 shrink-0
              flex flex-col
              bg-[#0a0a0a]
              border-t lg:border-t-0 lg:border-l border-(--border-normal)
              transition-transform duration-300 ease-in-out
              ${orderSheetOpen ? "translate-y-0" : "translate-y-full"}
              lg:translate-y-0
              max-h-[85vh] lg:max-h-none
              rounded-t-2xl lg:rounded-none
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
              {/* Buy / Sell toggle */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setOrderType("Buy")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    orderType === "Buy"
                      ? "bg-emerald-500 text-white"
                      : "bg-white/5 text-(--text-white-50) hover:bg-white/10"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setOrderType("Sell")}
                  className={`py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    orderType === "Sell"
                      ? "bg-red-500 text-white"
                      : "bg-white/5 text-(--text-white-50) hover:bg-white/10"
                  }`}
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
                        Math.max(0.01, parseFloat(v) - 0.01).toFixed(2),
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
                    min="0.01"
                    className="flex-1 bg-white/5 border border-(--border-normal) rounded px-3 py-1.5 text-sm text-center text-(--global-text) focus:outline-none focus:border-(--primary-default)"
                  />
                  <button
                    onClick={() =>
                      setLots((v) => (parseFloat(v) + 0.01).toFixed(2))
                    }
                    className="w-8 h-8 rounded bg-white/5 text-(--global-text) hover:bg-white/10 transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-(--text-white-50) mt-1">
                  Range: {fee.minLot} – {fee.maxLot} lots
                </p>
              </div>

              {/* Stop Loss */}
              <div>
                <label className="block text-xs text-(--text-white-50) mb-1.5">
                  Stop Loss (optional)
                </label>
                <input
                  type="number"
                  value={sl}
                  onChange={(e) => setSl(e.target.value)}
                  placeholder="e.g. 1.0780"
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
                  placeholder="e.g. 1.0950"
                  className="w-full bg-white/5 border border-(--border-normal) rounded px-3 py-1.5 text-sm text-(--global-text) placeholder:text-(--text-white-50)/50 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Fee summary */}
              <div className="bg-white/3 rounded-lg p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Spread</span>
                  <span>{fee.spread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">Commission</span>
                  <span>{fee.commission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--text-white-50)">
                    Swap ({orderType === "Buy" ? "long" : "short"})
                  </span>
                  <span
                    className={
                      parseFloat(
                        orderType === "Buy" ? fee.swap_long : fee.swap_short,
                      ) < 0
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {orderType === "Buy" ? fee.swap_long : fee.swap_short} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Place order button */}
            <div className="p-4 border-t border-(--border-normal)">
              <button
                className={`w-full py-3 rounded-lg text-sm font-bold transition-opacity hover:opacity-90 ${
                  orderType === "Buy"
                    ? "bg-emerald-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                Place {orderType} Order
              </button>
              <p className="text-xs text-(--text-white-50) text-center mt-2">
                This is a simulated prop challenge account
              </p>
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
    </div>
  );
}
