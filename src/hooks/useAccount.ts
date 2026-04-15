import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { AccountRow } from "../types/database";

export interface UseAccount {
  account: AccountRow | null;
  loading: boolean;
  error: string | null;
}

export function useAccount(userId: string | undefined): UseAccount {
  const [account, setAccount] = useState<AccountRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setAccount(data);
        setLoading(false);
      });
  }, [userId]);

  return { account, loading, error };
}
