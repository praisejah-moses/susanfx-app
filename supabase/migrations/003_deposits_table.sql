-- ============================================================
-- Deposits Table — tracks all deposit transactions
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

create table if not exists public.deposits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  amount     numeric(18, 2) not null check (amount > 0),
  method     text not null check (method in ('BTC', 'USDT (ERC20)', 'ETH', 'SOL')),
  status     text not null default 'Pending' check (status in ('Pending', 'Completed', 'Rejected')),
  tx_hash    text,
  wallet_address text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.deposits enable row level security;

create policy "Users can view own deposits"
  on public.deposits for select
  using (auth.uid() = user_id);

create policy "Users can insert own deposits"
  on public.deposits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own deposits"
  on public.deposits for update
  using (auth.uid() = user_id);
