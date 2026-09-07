-- índice parcial não casa com ON CONFLICT (user_id, external_id) do upsert.
-- unique não-parcial: NULLs são distintos no Postgres.
drop index if exists public.budget_entries_user_external;
create unique index budget_entries_user_external
  on public.budget_entries (user_id, external_id);
