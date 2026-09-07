-- Corrige advisors de segurança do Supabase após 0001.
-- 1) search_path imutável em set_updated_at (evita hijack via search_path).
alter function public.set_updated_at() set search_path = '';

-- 2) handle_new_user é função de trigger — não deve ser exposta como RPC.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
