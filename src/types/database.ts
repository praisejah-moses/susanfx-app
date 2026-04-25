// Database row types — mirrors the Supabase table schemas.
// Run the SQL in supabase/migrations/001_initial_schema.sql to create these tables.

export interface TradeRow {
  id: string;
  user_id: string;
  pair: string;
  type: "Buy" | "Sell";
  size: number;
  open_price: number;
  close_price: number | null;
  pnl: number | null;
  status: "Open" | "Closed";
  sl: number | null;
  tp: number | null;
  opened_at: string;
  closed_at: string | null;
}

export interface DepositRow {
  id: string;
  user_id: string;
  amount: number;
  method: "BTC" | "USDT (ERC20)" | "ETH" | "SOL";
  status: "Pending" | "Completed" | "Rejected";
  tx_hash: string | null;
  wallet_address: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface WithdrawalRow {
  id: string;
  user_id: string;
  amount: number;
  method:
    | "Bank Transfer"
    | "Crypto (USDT)"
    | "PayPal"
    | "Bitcoin"
    | "USDT (ERC20)"
    | "Ethereum"
    | "Solana";
  status: "Pending" | "Completed" | "Rejected";
  wallet_address: string | null;
  created_at: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  balance: number;
  starting_balance: number;
  phase: string;
  daily_drawdown: number;
  max_drawdown: number;
  profit_target: number;
}

export interface RewardRow {
  id: string;
  title: string;
  description: string;
  points: number;
}

export interface UserRewardRow {
  id: string;
  user_id: string;
  reward_id: string;
  earned_at: string;
}

export interface LeaderboardRow {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  profit_pct: number;
  points: number;
}

export interface NotificationPrefsRow {
  user_id: string;
  email_notifs: boolean;
  trade_alerts: boolean;
  payout_alerts: boolean;
}

export interface ReferralRow {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  bonus_awarded: boolean;
  bonus_amount: number;
  created_at: string;
  awarded_at: string | null;
}

export interface UserReferralCodeRow {
  id: string;
  user_id: string;
  referral_code: string;
  created_at: string;
}
