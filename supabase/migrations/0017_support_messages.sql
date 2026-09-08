-- Mensagens de suporte / contato do site.
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- só service role escreve/lê (form via server action, leitura no /admin).
alter table public.support_messages enable row level security;
