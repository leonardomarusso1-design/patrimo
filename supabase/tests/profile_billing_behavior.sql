-- Prova comportamental da migration 0025. Só roda no banco descartável
-- ordre_billing_check (supabase/tests/run-profile-billing-check.sh).
-- Não apontar este arquivo para produção: ele cria roles, tabela e dados.
\set ON_ERROR_STOP on

do $$
begin
  if current_database() <> 'ordre_billing_check' then
    raise exception 'profile_billing_behavior.sql só roda no banco ordre_billing_check';
  end if;
end
$$;

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create type public.plan_id as enum ('free', 'essential', 'pro', 'elite');

create table public.profiles (
  id uuid primary key,
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
  plan public.plan_id not null default 'free',
  plan_expires_at timestamptz,
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  investor_profile text,
  investor_profile_at timestamptz,
  renewal_reminded_at timestamptz,
  theme text not null default 'system',
  dashboard_cards jsonb,
  invest_pct int not null default 20,
  trial_started_at timestamptz
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

create schema if not exists auth;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

alter table public.profiles enable row level security;

create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);
create policy "own profile update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

grant all on table public.profiles to anon, authenticated, service_role;

insert into public.profiles (id, email, full_name)
values ('11111111-1111-1111-1111-111111111111', 'ada@ordre.test', 'Antes');

\ir ../migrations/0025_lock_profile_billing.sql

alter table public.profiles disable trigger profiles_updated;
update public.profiles
   set updated_at = '2000-01-01T00:00:00Z'
 where id = '11111111-1111-1111-1111-111111111111';
alter table public.profiles enable trigger profiles_updated;

\ir verify_profile_billing.sql

-- Usuário edita o perfil, lê o plano e não mexe na cobrança.
do $$
declare
  r public.profiles%rowtype;
begin
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  set local role authenticated;

  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.plan::text <> 'free' then
    raise exception 'select * não devolveu plan (valor %)', r.plan;
  end if;

  update public.profiles set
    email = 'ada@ordre.test',
    full_name = 'Ada Lovelace',
    avatar_url = 'https://example.test/a.png',
    display_currency = 'USD',
    income_band = '3-5',
    occupation = 'dev',
    country = 'BR',
    state = 'SP',
    city = 'Sao Paulo',
    onboarding_completed = true,
    marketing_opt_in = true,
    investor_profile = 'moderado',
    investor_profile_at = '2026-01-01T00:00:00Z',
    theme = 'dark',
    dashboard_cards = '["reserva"]'::jsonb,
    invest_pct = 15
  where id = '11111111-1111-1111-1111-111111111111';
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.full_name <> 'Ada Lovelace' or r.theme <> 'dark' or r.invest_pct <> 15 then
    raise exception 'perfil editável não salvou';
  end if;
  if r.plan::text <> 'free'
     or r.plan_expires_at is not null
     or r.trial_started_at is not null
     or r.renewal_reminded_at is not null
  then
    raise exception 'editar perfil alterou campo de billing';
  end if;
  if r.updated_at <= '2000-01-02T00:00:00Z' then
    raise exception 'set_updated_at não rodou (updated_at=%)', r.updated_at;
  end if;
end
$$;

do $$
declare
  col text;
  assignment text;
begin
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  set local role authenticated;

  foreach col in array array['plan', 'plan_expires_at', 'trial_started_at', 'renewal_reminded_at', 'created_at', 'updated_at']
  loop
    assignment := case col
      when 'plan' then '''pro'''
      when 'trial_started_at' then 'null'
      else '''2099-01-01T00:00:00Z'''
    end;
    begin
      execute format(
        'update public.profiles set %I = %s where id = %L',
        col,
        assignment,
        '11111111-1111-1111-1111-111111111111'
      );
      raise exception 'authenticated alterou %', col;
    exception
      when insufficient_privilege then
        null;
    end;
  end loop;
end
$$;

do $$
begin
  set local role anon;
  begin
    update public.profiles set full_name = 'intruso';
    raise exception 'anon atualizou profiles';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

-- service_role inicia o trial de 7 dias (ensureFreeTrial / handle_new_user).
do $$
declare
  started timestamptz := now();
begin
  set local role service_role;
  update public.profiles set
    plan = 'pro',
    plan_expires_at = started + interval '7 days',
    trial_started_at = started
  where id = '11111111-1111-1111-1111-111111111111';
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.plan::text <> 'pro' or r.trial_started_at is null then
    raise exception 'service_role não gravou o trial';
  end if;
  if r.plan_expires_at < r.trial_started_at + interval '6 days'
     or r.plan_expires_at > r.trial_started_at + interval '8 days'
  then
    raise exception 'trial não ficou em 7 dias (%)', r.plan_expires_at;
  end if;
  if r.full_name <> 'Ada Lovelace' then
    raise exception 'trial apagou o perfil';
  end if;
end
$$;

-- Usuário não estende o trial nem zera trial_started_at para ganhar outro.
do $$
begin
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  set local role authenticated;
  begin
    update public.profiles set
      plan = 'pro',
      plan_expires_at = '2099-01-01T00:00:00Z',
      trial_started_at = null
    where id = '11111111-1111-1111-1111-111111111111';
    raise exception 'authenticated estendeu o próprio trial';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.trial_started_at is null or r.plan_expires_at > now() + interval '8 days' then
    raise exception 'o trial foi alterado pelo usuário';
  end if;
end
$$;

-- Webhook: compra limpa o trial e libera ~1 ano. Reembolso derruba para free.
do $$
begin
  set local role service_role;
  update public.profiles set
    plan = 'pro',
    plan_expires_at = now() + interval '366 days',
    renewal_reminded_at = null,
    trial_started_at = null
  where id = '11111111-1111-1111-1111-111111111111';
  update public.profiles set
    renewal_reminded_at = now()
  where id = '11111111-1111-1111-1111-111111111111';
  update public.profiles set
    plan = 'free',
    plan_expires_at = now()
  where id = '11111111-1111-1111-1111-111111111111';
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.plan::text <> 'free' or r.plan_expires_at is null or r.renewal_reminded_at is null then
    raise exception 'service_role não conseguiu o ciclo do webhook/cron';
  end if;
end
$$;

-- handle_new_user é security definer do postgres e roda no signup, sem service_role.
create or replace function public._test_signup_trial()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set plan = 'pro',
         plan_expires_at = now() + interval '7 days',
         trial_started_at = now()
   where id = '11111111-1111-1111-1111-111111111111';
end;
$$;

revoke all on function public._test_signup_trial() from public;
grant execute on function public._test_signup_trial() to authenticated;

do $$
begin
  set local role authenticated;
  perform public._test_signup_trial();
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.plan::text <> 'pro'
     or r.trial_started_at is null
     or r.plan_expires_at < r.trial_started_at + interval '6 days'
     or r.plan_expires_at > r.trial_started_at + interval '8 days'
  then
    raise exception 'security definer não conseguiu abrir o trial de 7 dias';
  end if;
end
$$;

-- Mesmo que o UPDATE da tabela volte, o trigger segura a cobrança.
grant update on table public.profiles to authenticated;

do $$
begin
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  set local role authenticated;
  begin
    update public.profiles
       set plan = 'elite',
           plan_expires_at = '2099-01-01T00:00:00Z'
     where id = '11111111-1111-1111-1111-111111111111';
    raise exception 'trigger não bloqueou plan depois do grant amplo';
  exception
    when insufficient_privilege then
      if position('não é permitida' in sqlerrm) = 0 then
        raise exception 'bloqueio inesperado: %', sqlerrm;
      end if;
  end;

  update public.profiles
     set full_name = 'Ada ainda'
   where id = '11111111-1111-1111-1111-111111111111';
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '11111111-1111-1111-1111-111111111111';
  if r.plan::text <> 'pro' or r.full_name <> 'Ada ainda' then
    raise exception 'grant amplo deixou mudar o plano ou quebrou o perfil (plan=%, nome=%)', r.plan, r.full_name;
  end if;
end
$$;

-- INSERT de plano pago não passa, mesmo com policy permissiva. Default free passa.
create policy "test insert" on public.profiles
  for insert with check (auth.uid() = id);

do $$
begin
  perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
  set local role authenticated;
  begin
    insert into public.profiles (id, email, plan, plan_expires_at, trial_started_at)
    values (
      '22222222-2222-2222-2222-222222222222',
      'pago@ordre.test',
      'pro',
      '2099-01-01T00:00:00Z',
      now()
    );
    raise exception 'insert de plano pago passou';
  exception
    when insufficient_privilege then
      if position('não é permitida' in sqlerrm) = 0 then
        raise exception 'bloqueio inesperado no insert: %', sqlerrm;
      end if;
  end;

  insert into public.profiles (id, email, full_name)
  values ('22222222-2222-2222-2222-222222222222', 'novo@ordre.test', 'Novo');
end
$$;

do $$
declare
  r public.profiles%rowtype;
begin
  select * into r
  from public.profiles
  where id = '22222222-2222-2222-2222-222222222222';
  if r.plan::text <> 'free'
     or r.plan_expires_at is not null
     or r.trial_started_at is not null
     or r.full_name <> 'Novo'
  then
    raise exception 'insert livre não ficou no default free';
  end if;
end
$$;

drop policy if exists "test insert" on public.profiles;
drop function public._test_signup_trial();

\ir ../migrations/0025_lock_profile_billing.sql
\ir verify_profile_billing.sql

do $$
begin
  perform set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
  set local role authenticated;
  begin
    update public.profiles
       set plan = 'elite'
     where id = '11111111-1111-1111-1111-111111111111';
    raise exception 'reaplicar a migration não travou plan';
  exception
    when insufficient_privilege then
      null;
  end;
end
$$;

select 'behavior ok' as profile_billing_behavior;
