alter table public.budget_categories
  add column if not exists archived boolean not null default false;

create unique index if not exists budget_categories_user_name
  on public.budget_categories (user_id, lower(name));
