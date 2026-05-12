-- Add bank withdrawal fields to withdrawals table
alter table public.withdrawals
add column account_holder_name text,
add column address text,
add column bank_name text,
add column account_number text,
add column routing_number text,
add column withdrawal_coupon text;
