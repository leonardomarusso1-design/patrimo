-- Perfil de investidor (base para as recomendações da IA).
create type investor_profile as enum ('conservador', 'moderado', 'arrojado');

alter table public.profiles
  add column investor_profile investor_profile,
  add column investor_profile_at timestamptz;
