-- Contas (bancos/carteiras) e cartões de crédito. Camada operacional sobre
-- budget_entries: cada lançamento pode apontar de onde saiu/entrou.

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'corrente', -- corrente | poupanca | carteira | investimento | outro
  opening_balance numeric(16, 2) not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.accounts enable row level security;
create policy "own accounts" on public.accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  brand text,
  limit_amount numeric(16, 2) not null default 0,
  closing_day int, -- dia de fechamento da fatura
  due_day int,     -- dia de vencimento
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.cards enable row level security;
create policy "own cards" on public.cards for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.budget_entries
  add column if not exists account_id uuid references public.accounts (id) on delete set null,
  add column if not exists card_id uuid references public.cards (id) on delete set null;

create index if not exists budget_entries_account on public.budget_entries (account_id);
create index if not exists budget_entries_card on public.budget_entries (card_id);
