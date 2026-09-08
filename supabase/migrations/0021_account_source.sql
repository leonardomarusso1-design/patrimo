-- Origem da conta/cartão: 'manual' ou 'pluggy' (Open Finance). Contas
-- sincronizadas são read-only na UI e ligadas a uma conexão bancária.
alter table public.accounts
  add column if not exists source text not null default 'manual',
  add column if not exists external_ref text,
  add column if not exists synced_at timestamptz,
  add column if not exists connection_id uuid references public.bank_connections (id) on delete set null;

alter table public.cards
  add column if not exists source text not null default 'manual',
  add column if not exists external_ref text,
  add column if not exists synced_at timestamptz,
  add column if not exists connection_id uuid references public.bank_connections (id) on delete set null;

create unique index if not exists accounts_user_source_ref
  on public.accounts (user_id, source, external_ref) where external_ref is not null;
create unique index if not exists cards_user_source_ref
  on public.cards (user_id, source, external_ref) where external_ref is not null;
