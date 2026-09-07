-- Patrimo — schema inicial
-- Todas as tabelas nascem com RLS. Nenhum acesso sem policy.
-- Regra geral: o usuário só enxerga e altera as próprias linhas (auth.uid() = user_id).

-- ---------- Enums ----------
create type plan_id as enum ('free', 'essential', 'pro', 'elite');
create type budget_kind as enum ('income', 'expense_fixed', 'expense_variable');
create type protection_level as enum ('basic', 'shield');
create type investment_class as enum
  ('renda_fixa', 'acao', 'fii', 'etf', 'cripto', 'cash', 'outro');
create type patrimony_kind as enum
  ('liquidez', 'investimento', 'imovel', 'veiculo', 'outro_bem');
create type sub_status as enum ('active', 'past_due', 'canceled', 'trialing');

-- ---------- updated_at helper ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  display_currency text not null default 'BRL',
  income_band text,
  occupation text,
  country text,
  state text,
  city text,
  onboarding_completed boolean not null default false,
  plan plan_id not null default 'free',
  plan_expires_at timestamptz,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table profiles enable row level security;
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create trigger profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- cria a linha de profile no primeiro login
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------- macro para tabelas "do usuário" ----------
-- (repetimos explicitamente para clareza da policy)

create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#8B5CF6',
  kind budget_kind not null,
  created_at timestamptz not null default now()
);
alter table budget_categories enable row level security;
create policy "own budget_categories" on budget_categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table budget_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind budget_kind not null,
  name text not null,
  category text,
  amount numeric(14,2) not null check (amount >= 0),
  due_day int check (due_day between 1 and 31),
  reference_month date not null default date_trunc('month', now()),
  notes text,
  created_at timestamptz not null default now()
);
alter table budget_entries enable row level security;
create policy "own budget_entries" on budget_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index budget_entries_user_month on budget_entries (user_id, reference_month);

create table emergency_fund (
  user_id uuid primary key references auth.users (id) on delete cascade,
  protection_level protection_level not null default 'basic',
  essential_monthly_cost numeric(14,2) not null default 0 check (essential_monthly_cost >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table emergency_fund enable row level security;
create policy "own emergency_fund" on emergency_fund for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger emergency_fund_updated before update on emergency_fund
  for each row execute function set_updated_at();

create table emergency_reserves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now()
);
alter table emergency_reserves enable row level security;
create policy "own emergency_reserves" on emergency_reserves for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null check (target_amount > 0),
  deadline date,
  where_to_keep text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table goals enable row level security;
create policy "own goals" on goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger goals_updated before update on goals
  for each row execute function set_updated_at();

create table goal_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references goals (id) on delete cascade,
  amount numeric(14,2) not null check (amount <> 0),
  contributed_on date not null default now(),
  created_at timestamptz not null default now()
);
alter table goal_contributions enable row level security;
create policy "own goal_contributions" on goal_contributions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index goal_contributions_goal on goal_contributions (goal_id);

create table investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  broker text,
  asset_class investment_class not null default 'renda_fixa',
  currency text not null default 'BRL',
  invested_amount numeric(16,2) not null default 0 check (invested_amount >= 0),
  current_amount numeric(16,2) not null default 0 check (current_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table investments enable row level security;
create policy "own investments" on investments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger investments_updated before update on investments
  for each row execute function set_updated_at();

create table patrimony_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind patrimony_kind not null,
  name text not null,
  value numeric(16,2) not null default 0,
  currency text not null default 'BRL',
  fipe_code text,
  is_debt boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table patrimony_items enable row level security;
create policy "own patrimony_items" on patrimony_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger patrimony_items_updated before update on patrimony_items
  for each row execute function set_updated_at();

create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  remaining_amount numeric(14,2) not null check (remaining_amount >= 0),
  monthly_interest numeric(6,3),
  monthly_payment numeric(14,2),
  due_day int check (due_day between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table debts enable row level security;
create policy "own debts" on debts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger debts_updated before update on debts
  for each row execute function set_updated_at();

create table school_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id int not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
alter table school_progress enable row level security;
create policy "own school_progress" on school_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan plan_id not null,
  status sub_status not null default 'trialing',
  provider text not null default 'kiwify',
  provider_ref text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table subscriptions enable row level security;
create policy "own subscriptions read" on subscriptions for select using (auth.uid() = user_id);
create trigger subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- ---------- blog (público) ----------
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  author text not null default 'Time Patrimo',
  cover_image text,
  tags text[] not null default '{}',
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table blog_posts enable row level security;
create policy "published posts are public" on blog_posts for select using (published = true);
create trigger blog_posts_updated before update on blog_posts
  for each row execute function set_updated_at();

-- ---------- analytics + consentimento ----------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  event_name text not null,
  event_data jsonb,
  path text,
  ip_hash text,
  created_at timestamptz not null default now()
);
alter table analytics_events enable row level security;
create policy "own analytics read" on analytics_events for select using (auth.uid() = user_id);
-- inserts vêm de rotas server-side com service role (ignora RLS) ou do próprio usuário
create policy "insert own analytics" on analytics_events for insert
  with check (user_id is null or auth.uid() = user_id);

create table cookie_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  necessary boolean not null default true,
  analytics boolean not null default false,
  marketing boolean not null default false,
  ip_hash text,
  created_at timestamptz not null default now()
);
alter table cookie_consents enable row level security;
create policy "insert consent" on cookie_consents for insert
  with check (user_id is null or auth.uid() = user_id);
create policy "read own consent" on cookie_consents for select using (auth.uid() = user_id);
