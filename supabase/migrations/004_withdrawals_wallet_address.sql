-- Add wallet address field to withdrawals table
alter table public.withdrawals
add column wallet_address text;

-- Update method check constraint to include new withdrawal methods
alter table public.withdrawals
drop constraint withdrawals_method_check;

alter table public.withdrawals
add constraint withdrawals_method_check
check (method in ('Bank Transfer', 'Crypto (USDT)', 'PayPal', 'Bitcoin', 'USDT (ERC20)', 'Ethereum', 'Solana'));
