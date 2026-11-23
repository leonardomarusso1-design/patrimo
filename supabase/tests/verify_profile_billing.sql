-- Conferência somente leitura da trava de billing em public.profiles.
-- Rode no SQL Editor depois de aplicar 0025_lock_profile_billing.sql.
-- Se estiver certo, devolve uma linha profile_billing_lock = ok.
-- Se não estiver, aborta com a lista do que falhou. Não escreve nada.

do $$
declare
  protected constant text[] := array[
    'plan',
    'plan_expires_at',
    'trial_started_at',
    'renewal_reminded_at'
  ];
  editable constant text[] := array[
    'email',
    'full_name',
    'avatar_url',
    'display_currency',
    'income_band',
    'occupation',
    'country',
    'state',
    'city',
    'onboarding_completed',
    'marketing_opt_in',
    'investor_profile',
    'investor_profile_at',
    'theme',
    'dashboard_cards',
    'invest_pct'
  ];
  col text;
  problems text[] := array[]::text[];
  fn text;
  trig text;
begin
  if has_table_privilege('authenticated', 'public.profiles', 'UPDATE') then
    problems := problems || 'authenticated ainda tem UPDATE na tabela profiles';
  end if;
  if has_table_privilege('anon', 'public.profiles', 'UPDATE') then
    problems := problems || 'anon ainda tem UPDATE na tabela profiles';
  end if;
  if not has_table_privilege('service_role', 'public.profiles', 'UPDATE') then
    problems := problems || 'service_role perdeu UPDATE na tabela profiles';
  end if;

  foreach col in array protected loop
    if has_column_privilege('authenticated', 'public.profiles', col, 'UPDATE') then
      problems := problems || format('authenticated pode UPDATE %s', col);
    end if;
    if has_column_privilege('anon', 'public.profiles', col, 'UPDATE') then
      problems := problems || format('anon pode UPDATE %s', col);
    end if;
    if not has_column_privilege('service_role', 'public.profiles', col, 'UPDATE') then
      problems := problems || format('service_role não pode UPDATE %s', col);
    end if;
    if not has_column_privilege('authenticated', 'public.profiles', col, 'SELECT') then
      problems := problems || format('authenticated perdeu SELECT em %s', col);
    end if;
  end loop;

  foreach col in array editable loop
    if not has_column_privilege('authenticated', 'public.profiles', col, 'UPDATE') then
      problems := problems || format('authenticated perdeu UPDATE em %s', col);
    end if;
  end loop;

  if has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'updated_at', 'UPDATE')
  then
    problems := problems || 'authenticated pode UPDATE id, created_at ou updated_at';
  end if;

  select pg_get_functiondef('public.protect_profile_billing_columns()'::regprocedure)
    into fn;
  if fn is null
     or position('service_role' in fn) = 0
     or position('new.plan is distinct from old.plan' in fn) = 0
     or position('new.plan_expires_at is distinct from old.plan_expires_at' in fn) = 0
     or position('new.trial_started_at is distinct from old.trial_started_at' in fn) = 0
     or position('new.renewal_reminded_at is distinct from old.renewal_reminded_at' in fn) = 0
     or position('new.plan::text is distinct from ''free''' in fn) = 0
  then
    problems := problems || 'função protect_profile_billing_columns ausente ou incompleta';
  end if;

  select pg_get_triggerdef(t.oid)
    into trig
  from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = 'profiles'
    and t.tgname = 'profiles_protect_billing'
    and not t.tgisinternal;

  if trig is null
     or position('BEFORE INSERT OR UPDATE' in upper(trig)) = 0
     or position('protect_profile_billing_columns' in trig) = 0
  then
    problems := problems || 'trigger profiles_protect_billing ausente ou incompleto';
  end if;

  if cardinality(problems) > 0 then
    raise exception 'Falha na trava de billing: %', array_to_string(problems, '; ');
  end if;
end
$$;

select 'ok' as profile_billing_lock;
