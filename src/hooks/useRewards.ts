import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type {
  RewardRow,
  UserRewardRow,
  LeaderboardRow,
} from "../types/database";

export interface EnrichedReward extends RewardRow {
  earned: boolean;
  earned_at: string | null;
}

export interface UseRewards {
  rewards: EnrichedReward[];
  leaderboard: LeaderboardRow[];
  earnedPoints: number;
  loading: boolean;
  error: string | null;
}

export function useRewards(userId: string | undefined): UseRewards {
  const [rewards, setRewards] = useState<EnrichedReward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRewards([]);
      setLeaderboard([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      supabase.from("rewards").select("*").order("points", { ascending: true }),
      supabase.from("user_rewards").select("*").eq("user_id", userId),
      supabase
        .from("leaderboard")
        .select("*")
        .order("profit_pct", { ascending: false })
        .limit(10),
    ]).then(([rewardsRes, userRewardsRes, leaderRes]) => {
      if (rewardsRes.error) {
        setError(rewardsRes.error.message);
        setRewards([]);
        setLeaderboard([]);
        setLoading(false);
        return;
      }
      if (userRewardsRes.error) {
        setError(userRewardsRes.error.message);
        setRewards([]);
        setLeaderboard([]);
        setLoading(false);
        return;
      }
      if (leaderRes.error) {
        setError(leaderRes.error.message);
        setRewards([]);
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const earned = new Map<string, string>(
        (userRewardsRes.data as UserRewardRow[]).map((r) => [
          r.reward_id,
          r.earned_at,
        ]),
      );

      setRewards(
        (rewardsRes.data as RewardRow[]).map((r) => ({
          ...r,
          earned: earned.has(r.id),
          earned_at: earned.get(r.id) ?? null,
        })),
      );
      setLeaderboard(leaderRes.data as LeaderboardRow[]);
      setError(null);
      setLoading(false);
    });
  }, [userId]);

  const earnedPoints = rewards
    .filter((r) => r.earned)
    .reduce((s, r) => s + r.points, 0);

  return { rewards, leaderboard, earnedPoints, loading, error };
}
