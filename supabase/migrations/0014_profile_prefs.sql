-- Preferências de exibição no profile.
alter table public.profiles
  add column if not exists theme text not null default 'system',
  add column if not exists dashboard_cards jsonb,
  add column if not exists invest_pct int not null default 20;

alter table public.profiles
  add constraint profiles_theme_check check (theme in ('system', 'light', 'dark'));
alter table public.profiles
  add constraint profiles_invest_pct_check check (invest_pct between 0 and 100);
