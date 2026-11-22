-- Bot Ordre no WhatsApp (Cloud API).
-- Não aplicar em produção até o número e as credenciais existirem.
-- A flag WHATSAPP_BOT_ENABLED fica desligada: sem esta tabela o painel
-- mostra "em preparação" e o webhook não grava nada.

create table public.whatsapp_links (
  user_id uuid primary key references auth.users (id) on delete cascade,
  phone_hash text,
  phone_ciphertext text,
  verify_code_hash text,
  verify_expires_at timestamptz,
  verified_at timestamptz,
  consent_at timestamptz,
  alerts_opt_in boolean not null default false,
  daily_digest boolean not null default false,
  weekly_digest boolean not null default true,
  monthly_digest boolean not null default true,
  active boolean not null default false,
  last_entry_id uuid references public.budget_entries (id) on delete set null,
  last_entry_at timestamptz,
  last_daily_on date,
  last_weekly_on date,
  last_monthly_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index whatsapp_links_phone_hash
  on public.whatsapp_links (phone_hash)
  where phone_hash is not null;

create unique index whatsapp_links_verify_code
  on public.whatsapp_links (verify_code_hash)
  where verify_code_hash is not null;

alter table public.whatsapp_links enable row level security;
create policy "own whatsapp_links read" on public.whatsapp_links
  for select using (auth.uid() = user_id);

drop trigger if exists whatsapp_links_updated on public.whatsapp_links;
create trigger whatsapp_links_updated
  before update on public.whatsapp_links
  for each row execute function set_updated_at();

create table public.whatsapp_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  period text not null check (period ~ '^\d{4}-\d{2}$'),
  used integer not null default 0 check (used >= 0),
  bonus integer not null default 0 check (bonus >= 0),
  primary key (user_id, period)
);

alter table public.whatsapp_usage enable row level security;
create policy "own whatsapp_usage read" on public.whatsapp_usage
  for select using (auth.uid() = user_id);

create table public.whatsapp_pack_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  order_ref text not null unique,
  messages integer not null check (messages > 0),
  period text not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_pack_grants enable row level security;
create policy "own whatsapp_pack_grants read" on public.whatsapp_pack_grants
  for select using (auth.uid() = user_id);

create table public.user_category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern text not null,
  category text not null,
  kind text check (kind in ('income', 'expense_fixed', 'expense_variable')),
  created_at timestamptz not null default now(),
  unique (user_id, pattern)
);

alter table public.user_category_rules enable row level security;
create policy "own user_category_rules read" on public.user_category_rules
  for select using (auth.uid() = user_id);

create table public.whatsapp_pending (
  user_id uuid primary key references auth.users (id) on delete cascade,
  payload jsonb not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_pending enable row level security;

create table public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  wa_message_id text not null unique,
  user_id uuid references auth.users (id) on delete set null,
  phone_hash text not null,
  direction text not null check (direction in ('in', 'out')),
  kind text not null,
  action text,
  created_at timestamptz not null default now()
);

create index whatsapp_messages_phone_recent
  on public.whatsapp_messages (phone_hash, created_at desc);

alter table public.whatsapp_messages enable row level security;

-- Número, código e histórico de mensagem não saem pela API do usuário.
revoke all on table public.whatsapp_links from anon, authenticated;
grant select (
  user_id, verified_at, consent_at, alerts_opt_in, daily_digest, weekly_digest,
  monthly_digest, active, last_entry_id, last_entry_at, last_daily_on,
  last_weekly_on, last_monthly_on, created_at, updated_at
) on public.whatsapp_links to authenticated;

revoke all on table public.whatsapp_usage from anon, authenticated;
grant select (user_id, period, used, bonus) on public.whatsapp_usage to authenticated;

revoke all on table public.whatsapp_pack_grants from anon, authenticated;
grant select (id, user_id, messages, period, revoked, created_at)
  on public.whatsapp_pack_grants to authenticated;

revoke all on table public.user_category_rules from anon, authenticated;
grant select (id, user_id, pattern, category, kind, created_at)
  on public.user_category_rules to authenticated;

revoke all on table public.whatsapp_pending from anon, authenticated;
revoke all on table public.whatsapp_messages from anon, authenticated;

alter table public.budget_entries
  add column if not exists source text not null default 'app',
  add column if not exists confidence numeric(4,3);

alter table public.budget_entries
  drop constraint if exists budget_entries_source_check;
alter table public.budget_entries
  add constraint budget_entries_source_check
  check (source in ('app', 'csv', 'whatsapp', 'pluggy'));
