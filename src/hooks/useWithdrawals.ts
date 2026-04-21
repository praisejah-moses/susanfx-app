import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { WithdrawalRow } from "../types/database";

export interface UseWithdrawals {
  withdrawals: WithdrawalRow[];
  loading: boolean;
  error: string | null;
  submit: (
    amount: number,
    method: WithdrawalRow["method"],
    walletAddress?: string | null,
  ) => Promise<string | null>;
}

export function useWithdrawals(userId: string | undefined): UseWithdrawals {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawals = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setWithdrawals(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  /** Returns null on success, or an error string. */
  const submit = useCallback(
    async (
      amount: number,
      method: WithdrawalRow["method"],
      walletAddress?: string | null,
    ) => {
      if (!userId) return "Not authenticated";
      const { error } = await supabase.from("withdrawals").insert({
        user_id: userId,
        amount,
        method,
        status: "Pending",
        wallet_address: walletAddress || null,
      });
      if (error) return error.message;
      await fetchWithdrawals();
      return null;
    },
    [userId, fetchWithdrawals],
  );

  return { withdrawals, loading, error, submit };
}
