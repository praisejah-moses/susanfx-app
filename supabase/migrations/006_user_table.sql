-- 006_user_table.sql
-- Migration: Add user table to record user details

create table if not exists public.user_details (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  account_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.user_details enable row level security;

create policy "Users can view own details"
  on public.user_details for select
  using (auth.uid() = user_id);

create policy "Users can update own details"
  on public.user_details for update
  using (auth.uid() = user_id);

create policy "Users can insert own details"
  on public.user_details for insert
  with check (auth.uid() = user_id);
