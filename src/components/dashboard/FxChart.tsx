import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
} from "lightweight-charts";

type ChartType = "candlestick" | "line";
type Timeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

interface FxChartProps {
  symbol: string;
}

// ── Seed realistic OHLCV data ────────────────────────────────────────────────
function generateOHLCV(
  basePrice: number,
  count: number,
  intervalSeconds: number,
): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  let price = basePrice;
  const now = Math.floor(Date.now() / 1000);

  for (let i = count; i >= 0; i--) {
    const time = (now - i * intervalSeconds) as Time;
    const change = (Math.random() - 0.49) * basePrice * 0.002;
    const open = price;
    price += change;
    const high = Math.max(open, price) + Math.random() * basePrice * 0.001;
    const low = Math.min(open, price) - Math.random() * basePrice * 0.001;
    data.push({ time, open, high, low, close: price });
  }
  return data;
}

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14400,
  "1d": 86400,
};

const TIMEFRAME_CANDLES: Record<Timeframe, number> = {
  "1m": 120,
  "5m": 100,
  "15m": 96,
  "1h": 168,
  "4h": 90,
  "1d": 365,
};

const BASE_PRICES: Record<string, number> = {
  "EUR/USD": 1.0842,
  "GBP/USD": 1.2734,
  "USD/JPY": 154.22,
  "XAU/USD": 2318.4,
  NAS100: 17840,
  US30: 38500,
  "BTC/USD": 62400,
};

export default function FxChart({ symbol }: FxChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeframe, setTimeframe] = useState<Timeframe>("1h");
  const [currentPrice, setCurrentPrice] = useState(BASE_PRICES[symbol] ?? 1.0);
  const [priceChange, setPriceChange] = useState({ value: 0, pct: 0 });
  const [ohlc, setOhlc] = useState({ open: 0, high: 0, low: 0, close: 0 });

  // ── Build / rebuild chart when symbol or timeframe changes ───────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      lineSeriesRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#0f0f0f" },
        textColor: "rgba(255,255,255,0.5)",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      crosshair: {
        vertLine: {
          color: "rgba(59,130,246,0.4)",
          labelBackgroundColor: "#3b82f6",
        },
        horzLine: {
          color: "rgba(59,130,246,0.4)",
          labelBackgroundColor: "#3b82f6",
        },
      },
      rightPriceScale: { borderColor: "#2a2a2a" },
      timeScale: {
        borderColor: "#2a2a2a",
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    chartRef.current = chart;

    const base = BASE_PRICES[symbol] ?? 1.0;
    const intervalSec = TIMEFRAME_SECONDS[timeframe];
    const count = TIMEFRAME_CANDLES[timeframe];
    const data = generateOHLCV(base, count, intervalSec);

    const lastCandle = data[data.length - 1];
    const firstCandle = data[0];
    setCurrentPrice(lastCandle.close);
    const diff = lastCandle.close - firstCandle.open;
    setPriceChange({ value: diff, pct: (diff / firstCandle.open) * 100 });
    setOhlc({
      open: lastCandle.open,
      high: lastCandle.high,
      low: lastCandle.low,
      close: lastCandle.close,
    });

    if (chartType === "candlestick") {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: "#22c55e",
        downColor: "#ef4444",
        borderUpColor: "#22c55e",
        borderDownColor: "#ef4444",
        wickUpColor: "#22c55e",
        wickDownColor: "#ef4444",
      });
      series.setData(data);
      candleSeriesRef.current = series;
    } else {
      const series = chart.addSeries(LineSeries, {
        color: "#3b82f6",
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 5,
      });
      series.setData(data.map((d) => ({ time: d.time, value: d.close })));
      lineSeriesRef.current = series;
    }

    chart.timeScale().fitContent();

    // ── Live tick simulation ──────────────────────────────────────────────
    const tickInterval = setInterval(() => {
      const lastBar = data[data.length - 1];
      const tick = (Math.random() - 0.49) * base * 0.0008;
      const newClose = lastBar.close + tick;
      const updatedBar = {
        ...lastBar,
        close: newClose,
        high: Math.max(lastBar.high, newClose),
        low: Math.min(lastBar.low, newClose),
      };
      data[data.length - 1] = updatedBar;

      setCurrentPrice(newClose);
      const diff2 = newClose - data[0].open;
      setPriceChange({ value: diff2, pct: (diff2 / data[0].open) * 100 });
      setOhlc({
        open: updatedBar.open,
        high: updatedBar.high,
        low: updatedBar.low,
        close: newClose,
      });

      if (candleSeriesRef.current) {
        candleSeriesRef.current.update(updatedBar);
      }
      if (lineSeriesRef.current) {
        lineSeriesRef.current.update({
          time: updatedBar.time,
          value: newClose,
        });
      }
    }, 1500);

    // ── Resize observer ───────────────────────────────────────────────────
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      clearInterval(tickInterval);
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [symbol, timeframe, chartType]);

  const timeframes: Timeframe[] = ["1m", "5m", "15m", "1h", "4h", "1d"];
  const isUp = priceChange.value >= 0;
  const decimals =
    symbol.includes("JPY") ||
    symbol.includes("NAS") ||
    symbol.includes("US30") ||
    symbol.includes("BTC")
      ? 2
      : 5;

  return (
    <div className="flex flex-col h-full bg-[#0f0f0f] rounded-xl border border-(--border-normal) overflow-hidden">
      {/* ── Chart toolbar ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1.5 px-3 sm:px-4 py-2 sm:py-3 border-b border-(--border-normal)">
        {/* Row 1: price + OHLC */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Live price */}
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base sm:text-lg font-bold tracking-tight text-(--global-text)">
              {currentPrice.toFixed(decimals)}
            </span>
            <span
              className={`text-xs font-medium shrink-0 ${isUp ? "text-emerald-400" : "text-red-400"}`}
            >
              {isUp ? "▲" : "▼"} {Math.abs(priceChange.value).toFixed(decimals)}{" "}
              ({Math.abs(priceChange.pct).toFixed(2)}%)
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
          {/* OHLC strip (hidden on xs) */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-(--text-white-50) ml-auto">
            <span>
              O{" "}
              <span className="text-(--global-text)">
                {ohlc.open.toFixed(decimals)}
              </span>
            </span>
            <span>
              H{" "}
              <span className="text-emerald-400">
                {ohlc.high.toFixed(decimals)}
              </span>
            </span>
            <span>
              L{" "}
              <span className="text-red-400">{ohlc.low.toFixed(decimals)}</span>
            </span>
            <span>
              C{" "}
              <span className="text-(--global-text)">
                {ohlc.close.toFixed(decimals)}
              </span>
            </span>
          </div>
        </div>

        {/* Row 2: controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Chart type toggle */}
          <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => setChartType("candlestick")}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${chartType === "candlestick" ? "bg-(--primary-default) text-black" : "text-(--text-white-50) hover:text-(--global-text)"}`}
            >
              Candles
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${chartType === "line" ? "bg-(--primary-default) text-black" : "text-(--text-white-50) hover:text-(--global-text)"}`}
            >
              Line
            </button>
          </div>

          {/* Timeframe picker — scrollable on mobile */}
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`shrink-0 px-1.5 sm:px-2 py-1 rounded text-xs font-medium transition-colors ${timeframe === tf ? "text-(--primary-default) bg-(--primary-default)/10" : "text-(--text-white-50) hover:text-(--global-text)"}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chart canvas ──────────────────────────────────────────────── */}
      <div ref={containerRef} className="flex-1 w-full min-h-0" />
    </div>
  );
}
