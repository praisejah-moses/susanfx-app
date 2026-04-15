import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { TradeRow } from "../types/database";

export interface UseTrades {
  trades: TradeRow[];
  loading: boolean;
  error: string | null;
}

export function useTrades(userId: string | undefined): UseTrades {
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("opened_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setTrades(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  return { trades, loading, error };
}
