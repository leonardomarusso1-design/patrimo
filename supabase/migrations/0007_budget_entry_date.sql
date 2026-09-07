-- Data real do lançamento (para filtro por período personalizado).
alter table public.budget_entries add column entry_date date;

update public.budget_entries
set entry_date = make_date(
  extract(year from reference_month)::int,
  extract(month from reference_month)::int,
  least(coalesce(due_day, 1), 28)
)
where entry_date is null;

alter table public.budget_entries
  alter column entry_date set default date_trunc('month', now())::date;

create index budget_entries_user_date on public.budget_entries (user_id, entry_date);
