"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { safeError } from "@/lib/logger";
import { SITE_URL } from "@/lib/seo";
import { safeNext } from "@/lib/url";

export type AuthState = { error?: string; message?: string };

const credentials = z.object({
  email: z.string().email("E-mail inválido."),
  password: z.string().min(8, "A senha precisa de ao menos 8 caracteres."),
});

async function origin() {
  const h = await headers();
  return h.get("origin") ?? SITE_URL;
}

async function rateLimited() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "0.0.0.0";
  const rl = await checkRateLimit("auth", ip);
  return !rl.ok;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (await rateLimited())
    return { error: "Muitas tentativas. Aguarde um minuto e tente de novo." };

  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "E-mail ou senha incorretos." };

  const next = safeNext(formData.get("next"));
  redirect(next);
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (await rateLimited())
    return { error: "Muitas tentativas. Aguarde um minuto e tente de novo." };

  const schema = credentials.extend({ fullName: z.string().min(2, "Diga seu nome.") });
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await origin()}/auth/confirm?next=/onboarding`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered"))
      return { error: "Esse e-mail já tem conta. Tente entrar." };
    return { error: safeError("auth.signup", error) };
  }
  // Supabase devolve 200 sem erro quando o e-mail já existe (anti-enumeração):
  // o usuário volta sem identities. Não adianta prometer "enviamos o link".
  if (data.user && (data.user.identities?.length ?? 0) === 0)
    return { error: "Esse e-mail já tem conta. Tente entrar ou recuperar a senha." };
  return {
    message:
      "Enviamos um link de confirmação pro seu e-mail. Abra para ativar a conta.",
  };
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await origin()}/auth/callback?next=/onboarding` },
  });
  if (error || !data.url) redirect("/login?erro=oauth");
  redirect(data.url);
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (await rateLimited()) return { error: "Muitas tentativas. Aguarde um minuto." };
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "E-mail inválido." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${await origin()}/auth/callback?next=/app/configuracoes`,
  });
  return {
    message: "Se existir uma conta com esse e-mail, o link de redefinição chegou nele.",
  };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
