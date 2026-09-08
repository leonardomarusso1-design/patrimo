-- Teste grátis de 7 dias, sem cartão. Quem não tem compra pendente entra em
-- 'pro' por 7 dias; depois cai no paywall. trial_started_at evita re-trial.
alter table public.profiles
  add column if not exists trial_started_at timestamptz;

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  applied boolean := false;
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  -- compra pendente da Kiwify tem prioridade
  update public.profiles p
     set plan = pp.plan, plan_expires_at = pp.expires_at
    from public.pending_purchases pp
   where p.id = new.id
     and lower(pp.email) = lower(coalesce(new.email, ''));
  get diagnostics applied = row_count;

  delete from public.pending_purchases
   where lower(email) = lower(coalesce(new.email, ''));

  -- sem compra: libera 7 dias de teste
  if not applied then
    update public.profiles
       set plan = 'pro',
           plan_expires_at = now() + interval '7 days',
           trial_started_at = now()
     where id = new.id;
  end if;

  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
