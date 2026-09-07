-- Análises da IA de investimentos (histórico por usuário).
create table public.investment_advice (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  summary text not null,
  actions jsonb not null default '[]',
  model text,
  created_at timestamptz not null default now()
);
alter table public.investment_advice enable row level security;
-- inserts só via server (service role / server action com user_id do próprio usuário)
create policy "own advice read" on public.investment_advice for select
  using (auth.uid() = user_id);
create policy "own advice insert" on public.investment_advice for insert
  with check (auth.uid() = user_id);
create index investment_advice_user on public.investment_advice (user_id, created_at desc);
