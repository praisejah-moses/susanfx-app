-- ============================================================
-- Add account_id to deposits table
-- ============================================================

alter table public.deposits
  add column if not exists account_id uuid references public.accounts(id) on delete set null;

-- Allow users to insert deposits only for their own account_id (if provided)
create policy if not exists "Users can insert own deposits with account"
  on public.deposits for insert
  with check (auth.uid() = user_id);

-- Allow users to select/update as before (no change needed)
