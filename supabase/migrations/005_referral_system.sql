-- ============================================================
-- SusanFX — Referral System
-- Run this in your Supabase SQL Editor (Database > SQL Editor)
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- REFERRALS TABLE
-- ──────────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid not null references auth.users(id) on delete cascade,
  referee_id      uuid not null references auth.users(id) on delete cascade,
  referral_code   text not null,
  bonus_awarded   boolean not null default false,
  bonus_amount    numeric(18, 2) not null default 100.00,
  created_at      timestamptz not null default now(),
  awarded_at      timestamptz,
  unique (referee_id), -- Each user can only be referred once
  unique (referrer_id, referee_id) -- Prevent duplicate referrals
);

alter table public.referrals enable row level security;

-- Policy: Users can view referrals where they are the referrer
create policy "Users can view own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);

-- Policy: Users can view their own referral record (where they are the referee)
create policy "Users can view their referral record"
  on public.referrals for select
  using (auth.uid() = referee_id);

-- Policy: System can insert referrals (will be handled by database functions)
create policy "System can insert referrals"
  on public.referrals for insert
  with check (true);

-- Policy: System can update referrals (for awarding bonuses)
create policy "System can update referrals"
  on public.referrals for update
  using (true);

-- ──────────────────────────────────────────────────────────────
-- USER REFERRAL CODES TABLE
-- ──────────────────────────────────────────────────────────────
create table if not exists public.user_referral_codes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  referral_code text not null unique,
  created_at    timestamptz not null default now(),
  unique (user_id) -- Each user gets one referral code
);

alter table public.user_referral_codes enable row level security;

-- Policy: Users can view their own referral code
create policy "Users can view own referral code"
  on public.user_referral_codes for select
  using (auth.uid() = user_id);

-- Policy: System can insert referral codes
create policy "System can insert referral codes"
  on public.user_referral_codes for insert
  with check (true);

-- ──────────────────────────────────────────────────────────────
-- FUNCTION: Generate unique referral code for new user
-- ──────────────────────────────────────────────────────────────
create or replace function generate_referral_code()
returns text
language plpgsql
as $$
declare
  new_code text;
  code_exists boolean := true;
begin
  while code_exists loop
    -- Generate a random 8-character code using uppercase letters and numbers
    new_code := upper(substring(md5(random()::text) from 1 for 8));
    -- Check if code already exists
    select exists(select 1 from user_referral_codes where referral_code = new_code) into code_exists;
  end loop;
  return new_code;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- FUNCTION: Process referral signup
-- ──────────────────────────────────────────────────────────────
create or replace function process_referral_signup(
  p_referee_id uuid,
  p_referral_code text
)
returns boolean
language plpgsql
security definer
as $$
declare
  referrer_record record;
  referral_exists boolean;
begin
  -- Check if referral code exists and get referrer
  select urc.user_id, urc.referral_code
  into referrer_record
  from user_referral_codes urc
  where urc.referral_code = upper(p_referral_code);

  -- If no referrer found, return false
  if referrer_record.user_id is null then
    return false;
  end if;

  -- Check if referee already has a referral record
  select exists(select 1 from referrals where referee_id = p_referee_id) into referral_exists;
  if referral_exists then
    return false;
  end if;

  -- Create referral record
  insert into referrals (referrer_id, referee_id, referral_code)
  values (referrer_record.user_id, p_referee_id, upper(p_referral_code));

  -- Award bonus to referrer (add $100 to their account balance)
  update accounts
  set balance = balance + 100.00
  where user_id = referrer_record.user_id;

  -- Mark referral as awarded
  update referrals
  set bonus_awarded = true, awarded_at = now()
  where referrer_id = referrer_record.user_id and referee_id = p_referee_id;

  return true;
end;
$$;

-- ──────────────────────────────────────────────────────────────
-- TRIGGER: Auto-generate referral code for new users
-- ──────────────────────────────────────────────────────────────
create or replace function create_user_referral_code()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Generate referral code for new user
  insert into user_referral_codes (user_id, referral_code)
  values (new.id, generate_referral_code());

  -- Create account for new user
  insert into accounts (user_id, starting_balance, balance)
  values (new.id, 0, 0);

  return new;
end;
$$;

-- Create trigger on auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function create_user_referral_code();