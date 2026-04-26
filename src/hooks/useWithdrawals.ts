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

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWithdrawals([]);
      setError(null);
      setLoading(false);
      return;
    }

    const fetchWithdrawalsData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
        setWithdrawals([]);
      } else {
        setWithdrawals(data ?? []);
        setError(null);
      }
      setLoading(false);
    };

    fetchWithdrawalsData();
  }, [userId]);

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

      // Refresh withdrawals after successful submission
      const { data, error: fetchError } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!fetchError && data) {
        setWithdrawals(data);
      }

      return null;
    },
    [userId],
  );

  return { withdrawals, loading, error, submit };
}
