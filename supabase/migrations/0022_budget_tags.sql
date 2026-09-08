alter table public.budget_entries
  add column if not exists tags text[] not null default '{}';

create index if not exists budget_entries_tags on public.budget_entries using gin (tags);
