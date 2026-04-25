import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type {
  ReferralRow,
} from "../types/database";

export interface UseReferral {
  referralCode: string | null;
  referrals: ReferralRow[];
  referralCount: number;
  totalEarned: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useReferral(userId: string | undefined): UseReferral {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferralData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user's referral code
      const { data: codeData, error: codeError } = await supabase
        .from("user_referral_codes")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (codeError && codeError.code !== 'PGRST116') { // PGRST116 is "not found"
        throw codeError;
      }

      setReferralCode(codeData?.referral_code || null);

      // Fetch referrals where user is the referrer
      const { data: referralsData, error: referralsError } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false });

      if (referralsError) {
        throw referralsError;
      }

      setReferrals(referralsData || []);
    } catch (err) {
      console.error("Error fetching referral data:", err);
      setError(err instanceof Error ? err.message : "Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [userId]);

  const referralCount = referrals.length;
  const totalEarned = referrals
    .filter(r => r.bonus_awarded)
    .reduce((sum, r) => sum + r.bonus_amount, 0);

  return {
    referralCode,
    referrals,
    referralCount,
    totalEarned,
    loading,
    error,
    refresh: fetchReferralData,
  };
}