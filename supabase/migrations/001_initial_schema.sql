-- ============================================================
-- SusanFX — Initial Database Schema
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────
-- 1. ACCOUNTS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  balance          numeric(18, 2) not null default 100000,
  starting_balance numeric(18, 2) not null default 100000,
  phase            text            not null default 'Phase 1',
  daily_drawdown   numeric(6, 2)   not null default 0,
  max_drawdown     numeric(6, 2)   not null default 0,
  profit_target    numeric(18, 2)  not null default 10000,
  created_at       timestamptz     not null default now(),
  unique (user_id)
);

alter table public.accounts enable row level security;

create policy "Users can view own account"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "Users can update own account"
  on public.accounts for update
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 2. TRADES
-- ──────────────────────────────────────────────────────────────
create table if not exists public.trades (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  pair        text not null,
  type        text not null check (type in ('Buy', 'Sell')),
  size        numeric(12, 2) not null,
  open_price  numeric(18, 5) not null,
  close_price numeric(18, 5),
  pnl         numeric(18, 2),
  status      text not null default 'Open' check (status in ('Open', 'Closed')),
  opened_at   timestamptz not null default now(),
  closed_at   timestamptz
);

alter table public.trades enable row level security;

create policy "Users can view own trades"
  on public.trades for select
  using (auth.uid() = user_id);

create policy "Users can insert own trades"
  on public.trades for insert
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 3. WITHDRAWALS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.withdrawals (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(18, 2) not null check (amount > 0),
  method     text not null check (method in ('Bank Transfer', 'Crypto (USDT)', 'PayPal')),
  status     text not null default 'Pending' check (status in ('Pending', 'Completed', 'Rejected')),
  created_at timestamptz not null default now()
);

alter table public.withdrawals enable row level security;

create policy "Users can view own withdrawals"
  on public.withdrawals for select
  using (auth.uid() = user_id);

create policy "Users can insert own withdrawals"
  on public.withdrawals for insert
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 4. REWARDS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.rewards (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,
  points      integer not null default 0
);

alter table public.rewards enable row level security;

create policy "All authenticated users can view rewards"
  on public.rewards for select
  using (auth.role() = 'authenticated');

-- Seed default rewards
insert into public.rewards (title, description, points) values
  ('First Withdrawal',     'Complete your first payout',        500),
  ('Consistency Badge',    'Trade for 30 consecutive days',      1000),
  ('10% Profit Milestone', 'Reach 10% profit on your account',  2000),
  ('Risk Manager',         'Stay within drawdown for 60 days',   1500),
  ('Top Trader',           'Rank in the top 100 traders',        5000)
on conflict do nothing;

-- ──────────────────────────────────────────────────────────────
-- 5. USER_REWARDS (junction — which rewards a user has earned)
-- ──────────────────────────────────────────────────────────────
create table if not exists public.user_rewards (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, reward_id)
);

alter table public.user_rewards enable row level security;

create policy "Users can view own user_rewards"
  on public.user_rewards for select
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 6. LEADERBOARD VIEW
-- Returns top traders by profit %, including points from user_rewards.
-- ──────────────────────────────────────────────────────────────
create or replace view public.leaderboard as
select
  a.user_id,
  (raw.user_metadata->>'first_name')::text as first_name,
  (raw.user_metadata->>'last_name')::text  as last_name,
  round(
    ((a.balance - a.starting_balance) / nullif(a.starting_balance, 0)) * 100,
    2
  ) as profit_pct,
  coalesce(pts.points, 0) as points
from public.accounts a
join auth.users raw on raw.id = a.user_id
left join (
  select ur.user_id, sum(r.points) as points
  from public.user_rewards ur
  join public.rewards r on r.id = ur.reward_id
  group by ur.user_id
) pts on pts.user_id = a.user_id
order by profit_pct desc;

-- Allow authenticated users to read the leaderboard view
grant select on public.leaderboard to authenticated;

-- ──────────────────────────────────────────────────────────────
-- 7. NOTIFICATION_PREFS
-- ──────────────────────────────────────────────────────────────
create table if not exists public.notification_prefs (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  email_notifs  boolean not null default true,
  trade_alerts  boolean not null default true,
  payout_alerts boolean not null default false
);

alter table public.notification_prefs enable row level security;

create policy "Users can view own notification_prefs"
  on public.notification_prefs for select
  using (auth.uid() = user_id);

create policy "Users can upsert own notification_prefs"
  on public.notification_prefs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification_prefs"
  on public.notification_prefs for update
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 8. AUTO-CREATE ACCOUNT ON SIGNUP
-- Trigger: insert a default account row when a new user confirms.
-- ──────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.accounts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
