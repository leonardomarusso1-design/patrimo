-- Lançamentos recorrentes e previstos.
alter table public.budget_entries
  add column if not exists recurring boolean not null default false,
  add column if not exists pending boolean not null default false;

-- lançamento previsto não conta nos totais até pending virar false.
create index if not exists budget_entries_recurring
  on public.budget_entries (user_id, reference_month) where recurring;
