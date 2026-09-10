alter table public.budget_entries
  add column if not exists installments_total integer,
  add column if not exists installments_paid integer;
