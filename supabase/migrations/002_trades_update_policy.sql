-- Allow users to update (close) their own trades
create policy "Users can update own trades"
  on public.trades for update
  using (auth.uid() = user_id);

-- Allow users to update (insert) their own account (for balance changes)
-- Note: insert policy for accounts so new accounts can be auto-created
create policy "Users can insert own account"
  on public.accounts for insert
  with check (auth.uid() = user_id);

-- Add sl/tp columns to trades table
alter table public.trades
  add column if not exists sl  numeric(18, 5),
  add column if not exists tp  numeric(18, 5);
