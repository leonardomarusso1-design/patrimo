-- Idempotência de webhooks: registra cada evento já processado.
-- Kiwify reenvia eventos; sem isto, reprocessa e reenvia e-mail.
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_type text,
  order_ref text,
  body_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists webhook_events_provider_body_hash
  on public.webhook_events (provider, body_hash);

-- Só o service role escreve/lê (webhook). RLS ligada sem policy = bloqueado pro resto.
alter table public.webhook_events enable row level security;
