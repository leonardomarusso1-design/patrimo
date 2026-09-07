-- marca quando o e-mail de "sua assinatura vence em breve" foi enviado (dedup do cron).
alter table public.profiles add column renewal_reminded_at timestamptz;
