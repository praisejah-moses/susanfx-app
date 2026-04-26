import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import type { TradeRow } from "../types/database";

export interface UseTrades {
  trades: TradeRow[];
  loading: boolean;
  error: string | null;
  openTrade: (params: {
    pair: string;
    type: "Buy" | "Sell";
    size: number;
    openPrice: number;
    sl?: number | null;
    tp?: number | null;
  }) => Promise<{ data: TradeRow | null; error: string | null }>;
  closeTrade: (
    tradeId: string,
    closePrice: number,
    pnl: number,
  ) => Promise<string | null>;
}

export function useTrades(userId: string | undefined): UseTrades {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrades([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchTradesData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("opened_at", { ascending: false });
      if (error) {
        setError(error.message);
        setTrades([]);
      } else {
        setTrades(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    fetchTradesData();
  }, [userId]);

  const openTrade = useCallback(
    async ({
      pair,
      type,
      size,
      openPrice,
      sl,
      tp,
    }: {
      pair: string;
      type: "Buy" | "Sell";
      size: number;
      openPrice: number;
      sl?: number | null;
      tp?: number | null;
    }): Promise<{ data: TradeRow | null; error: string | null }> => {
      if (!userId) return { data: null, error: "Not authenticated" };
      const { data, error } = await supabase
        .from("trades")
        .insert({
          user_id: userId,
          pair,
          type,
          size,
          open_price: openPrice,
          sl: sl ?? null,
          tp: tp ?? null,
          status: "Open",
        })
        .select()
        .single();
      if (error) return { data: null, error: error.message };
      setTrades((prev) => [data as TradeRow, ...prev]);
      return { data: data as TradeRow, error: null };
    },
    [userId],
  );

  const closeTrade = useCallback(
    async (
      tradeId: string,
      closePrice: number,
      pnl: number,
    ): Promise<string | null> => {
      const { error } = await supabase
        .from("trades")
        .update({
          close_price: closePrice,
          pnl,
          status: "Closed",
          closed_at: new Date().toISOString(),
        })
        .eq("id", tradeId);
      if (error) return error.message;
      setTrades((prev) =>
        prev.map((t) =>
          t.id === tradeId
            ? {
                ...t,
                close_price: closePrice,
                pnl,
                status: "Closed",
                closed_at: new Date().toISOString(),
              }
            : t,
        ),
      );
      return null;
    },
    [],
  );

  return { trades, loading, error, openTrade, closeTrade };
}
