-- Uma assinatura por usuário. Necessário para o upsert onConflict=user_id
-- do webhook da Kiwify (sem isso, a segunda cobrança/renovação do mesmo
-- usuário quebra com "no unique or exclusion constraint").
alter table public.subscriptions add constraint subscriptions_user_id_key unique (user_id);
