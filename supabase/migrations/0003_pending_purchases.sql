-- Compra da Kiwify que chega antes do usuário ter conta.
create table pending_purchases (
  email text primary key,
  plan plan_id not null default 'pro',
  expires_at timestamptz not null,
  provider text not null default 'kiwify',
  provider_ref text,
  created_at timestamptz not null default now()
);
alter table pending_purchases enable row level security;
-- sem policy: só a service role (webhook) e o trigger security-definer acessam.

-- Ao criar a conta, aplica a compra pendente (se houver) e limpa.
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

  update public.profiles p
     set plan = pp.plan, plan_expires_at = pp.expires_at
    from public.pending_purchases pp
   where p.id = new.id
     and lower(pp.email) = lower(coalesce(new.email, ''));

  delete from public.pending_purchases
   where lower(email) = lower(coalesce(new.email, ''));

  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
