import "server-only";

import { logger } from "@/lib/logger";
import { SITE_URL } from "@/lib/seo";
import { PLAN } from "@/lib/plans";

/**
 * E-mail transacional via Resend. Sem RESEND_API_KEY, vira no-op (loga e segue).
 * De: usa RESEND_FROM ou um padrão.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    logger.info("email.skipped_no_key", { to: mask(opts.to), subject: opts.subject });
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "Ordre <ola@ordre.app>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    });
    if (!res.ok) throw new Error(`resend ${res.status}`);
    return true;
  } catch (err) {
    logger.error("email.send_failed", {
      to: mask(opts.to),
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/** Escapa valores dinâmicos (nome do usuário) antes de ir pro HTML do e-mail. */
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(title: string, body: string) {
  return `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#14211c">
    <p style="font-size:20px;font-weight:800;color:#0b7a55">Ordre</p>
    <h1 style="font-size:22px;margin:16px 0 8px">${title}</h1>
    ${body}
    <p style="margin-top:24px;font-size:13px;color:#5b6660">Ordre · Leonardo Marusso</p>
  </div>`;
}

export function accessGrantedEmail(to: string) {
  return {
    to,
    subject: "Seu acesso ao Ordre está ativo 🎉",
    html: shell(
      "Acesso liberado",
      `<p>Pagamento confirmado. Seu acesso ao Ordre está ativo por 1 ano.</p>
       <p><a href="${SITE_URL}/app" style="display:inline-block;background:#0b7a55;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:600">Abrir meu painel</a></p>
       <p style="font-size:13px;color:#5b6660">Se ainda não tem conta, crie com o mesmo e-mail desta compra que o acesso entra automático.</p>`,
    ),
  };
}

export function welcomeEmail(to: string, firstName: string) {
  return {
    to,
    subject: "Bem-vindo ao Ordre",
    html: shell(
      `Bora organizar o dinheiro, ${esc(firstName)}`,
      `<p>Sua conta está pronta. Comece pelo Orçamento: lance sua renda e as despesas do mês.</p>
       <p><a href="${SITE_URL}/app/orcamento" style="display:inline-block;background:#0b7a55;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:600">Ir para o Orçamento</a></p>`,
    ),
  };
}

export function renewalReminderEmail(
  to: string,
  firstName: string,
  daysLeft: number,
  trial = false,
) {
  const d = `<strong>${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}</strong>`;
  return {
    to,
    subject: trial
      ? `Seu teste grátis do Ordre acaba em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`
      : `Sua assinatura do Ordre vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`,
    html: shell(
      trial
        ? `Seu teste acaba em breve, ${esc(firstName)}`
        : `Renove pra não perder o acesso, ${esc(firstName)}`,
      `<p>${
        trial
          ? `Seu teste grátis do Ordre acaba em ${d}.`
          : `Seu acesso ao Ordre expira em ${d}.`
      } Assine por R$ 97,90 (ou 12x no cartão) e continue com tudo funcionando —
       seus dados ficam salvos de qualquer forma.</p>
       <p><a href="${PLAN.checkoutUrl}?email=${encodeURIComponent(to)}" style="display:inline-block;background:#0b7a55;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:600">${trial ? "Assinar agora" : "Renovar agora"}</a></p>`,
    ),
  };
}

function mask(email: string) {
  const [u, d] = email.split("@");
  return `${u.slice(0, 2)}***@${d ?? ""}`;
}
