import { useEffect, useState, useCallback } from "react";
import { supabase } from "../utils/supabase";
import type { AccountRow } from "../types/database";

export interface UseAccount {
  account: AccountRow | null;
  loading: boolean;
  error: string | null;
  updateBalance: (newBalance: number) => Promise<string | null>;
}

export function useAccount(userId: string | undefined): UseAccount {
  const [account, setAccount] = useState<AccountRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAccount(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setAccount(null);
        } else {
          setAccount(data);
          setError(null);
        }
        setLoading(false);
      });
  }, [userId]);

  const updateBalance = useCallback(
    async (newBalance: number): Promise<string | null> => {
      if (!userId) return "Not authenticated";
      const { error } = await supabase
        .from("accounts")
        .update({ balance: newBalance })
        .eq("user_id", userId);
      if (error) return error.message;
      setAccount((prev) => (prev ? { ...prev, balance: newBalance } : prev));
      return null;
    },
    [userId],
  );

  return { account, loading, error, updateBalance };
}
