-- Trava campos de plano, validade, trial e lembrete de renovação em profiles.
--
-- Um usuário autenticado tinha UPDATE na tabela inteira (grant padrão do
-- Supabase) e a policy "own profile update" deixava alterar a própria linha.
-- Com isso dava para gravar plan = 'pro' e plan_expires_at no futuro sem pagar,
-- ou limpar trial_started_at e ganhar outro teste.
--
-- Escritores legítimos, todos fora do papel authenticated:
--   handle_new_user()          security definer, dono postgres (signup, 7 dias)
--   service_role               webhook Kiwify, cron de renovação, onboarding
--                              e ensureFreeTrial (também 7 dias, depois bloqueio)
--
-- Duas travas, porque cada uma cobre a falha da outra:
--   1. Grant por coluna. authenticated só recebe UPDATE nas colunas de perfil.
--      anon perde UPDATE. service_role continua com UPDATE na tabela.
--      Coluna nova nasce sem UPDATE para o usuário até um GRANT explícito.
--   2. Trigger. Se alguém devolver o UPDATE amplo, a mudança desses quatro
--      campos ainda falha para qualquer papel que não seja postgres,
--      service_role ou supabase_admin.
--
-- Trial de 7 dias e o bloqueio total depois dele não mudam aqui.
-- SELECT continua liberado: o app lê plan / plan_expires_at / trial_started_at.

create or replace function public.protect_profile_billing_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op is distinct from 'INSERT' and tg_op is distinct from 'UPDATE' then
    raise exception 'alteração de plano, validade, trial ou lembrete de renovação não é permitida'
      using errcode = '42501';
  end if;

  -- current_user é o papel da sessão (PostgREST faz SET ROLE). Não usar o claim
  -- do JWT: o cliente não consegue assumir service_role, mas conseguiria
  -- mentir num setting se a trava olhasse auth.role().
  if current_user in ('postgres', 'service_role', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    -- Sem policy de INSERT hoje. Se uma aparecer, o usuário ainda não escolhe
    -- o plano: só passa a linha com o default free e sem datas de assinatura.
    if new.plan::text is distinct from 'free'
       or new.plan_expires_at is not null
       or new.trial_started_at is not null
       or new.renewal_reminded_at is not null
    then
      raise exception 'alteração de plano, validade, trial ou lembrete de renovação não é permitida'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if new.plan is distinct from old.plan
     or new.plan_expires_at is distinct from old.plan_expires_at
     or new.trial_started_at is distinct from old.trial_started_at
     or new.renewal_reminded_at is distinct from old.renewal_reminded_at
  then
    raise exception 'alteração de plano, validade, trial ou lembrete de renovação não é permitida'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.protect_profile_billing_columns() from public;
grant execute on function public.protect_profile_billing_columns() to anon, authenticated, service_role;

drop trigger if exists profiles_protect_billing on public.profiles;
create trigger profiles_protect_billing
  before insert or update on public.profiles
  for each row execute function public.protect_profile_billing_columns();

revoke update on table public.profiles from public, anon, authenticated;

grant update (
  email,
  full_name,
  avatar_url,
  display_currency,
  income_band,
  occupation,
  country,
  state,
  city,
  onboarding_completed,
  marketing_opt_in,
  investor_profile,
  investor_profile_at,
  theme,
  dashboard_cards,
  invest_pct
) on table public.profiles to authenticated;

grant update on table public.profiles to service_role;

comment on column public.profiles.plan is
  'Somente postgres, service_role ou supabase_admin. O usuário autenticado não altera.';
comment on column public.profiles.plan_expires_at is
  'Somente postgres, service_role ou supabase_admin. O usuário autenticado não altera.';
comment on column public.profiles.trial_started_at is
  'Somente postgres, service_role ou supabase_admin. Impede um segundo trial.';
comment on column public.profiles.renewal_reminded_at is
  'Somente postgres, service_role ou supabase_admin. Dedup do e-mail de renovação.';

notify pgrst, 'reload schema';
