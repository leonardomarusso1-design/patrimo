"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const KEY = "ordre.cookie-consent.v1";

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  at: string;
};

export function readConsent(): ConsentState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

function persist(state: ConsentState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* modo privado — segue sem persistir */
  }
  window.dispatchEvent(new CustomEvent("ordre:consent", { detail: state }));
  // Registro server-side (best-effort, não bloqueia UI).
  fetch("/api/consent", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(state),
    keepalive: true,
  }).catch(() => {});
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // consentimento vive no localStorage (sistema externo); só mostramos o
    // banner no cliente se ainda não houver escolha registrada.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readConsent()) setVisible(true);
  }, []);

  if (!visible) return null;

  const decide = (a: boolean, m: boolean) => {
    persist({ necessary: true, analytics: a, marketing: m, at: new Date().toISOString() });
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 shadow-xl">
        <p className="font-display text-sm font-bold text-ink">Sua privacidade</p>
        <p className="mt-1.5 text-sm text-muted">
          Usamos cookies necessários para o site funcionar e, com sua permissão,
          cookies de análise para melhorar o produto. Você escolhe.{" "}
          <Link href="/cookies" className="text-accent-dim underline">
            Política de Cookies
          </Link>
          .
        </p>

        {customize && (
          <div className="mt-4 space-y-2 rounded-xl bg-surface p-3 text-sm">
            <label className="flex items-center justify-between gap-3 opacity-70">
              <span>Necessários (sempre ativos)</span>
              <input type="checkbox" checked disabled />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Análise de uso (Google Analytics)</span>
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Marketing</span>
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
              />
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => decide(true, true)}>
            Aceitar todos
          </Button>
          <Button size="sm" variant="secondary" onClick={() => decide(false, false)}>
            Só os necessários
          </Button>
          {customize ? (
            <Button size="sm" variant="ghost" onClick={() => decide(analytics, marketing)}>
              Salvar escolha
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setCustomize(true)}>
              Personalizar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
