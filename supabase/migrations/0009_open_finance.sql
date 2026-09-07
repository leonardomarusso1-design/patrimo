-- Conexões bancárias via Pluggy (Open Finance).
create table public.bank_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pluggy_item_id text not null unique,
  institution_name text,
  status text not null default 'connected',
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.bank_connections enable row level security;
create policy "own bank_connections" on public.bank_connections for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- dedup de transações importadas (Pluggy ou CSV com id)
alter table public.budget_entries add column external_id text;
create unique index budget_entries_user_external
  on public.budget_entries (user_id, external_id) where external_id is not null;
