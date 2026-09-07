-- Histórico de patrimônio líquido: uma foto por usuário por mês.
create table if not exists public.net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null, -- sempre dia 1
  net_worth numeric(16, 2) not null,
  assets numeric(16, 2) not null default 0,
  wallet numeric(16, 2) not null default 0,
  reserve numeric(16, 2) not null default 0,
  debts numeric(16, 2) not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists net_worth_snapshots_user_month
  on public.net_worth_snapshots (user_id, month);

alter table public.net_worth_snapshots enable row level security;

create policy "own read" on public.net_worth_snapshots
  for select using (auth.uid() = user_id);
create policy "own upsert" on public.net_worth_snapshots
  for insert with check (auth.uid() = user_id);
create policy "own update" on public.net_worth_snapshots
  for update using (auth.uid() = user_id);
