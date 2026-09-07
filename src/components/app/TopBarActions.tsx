"use client";

import { useEffect, useState } from "react";
import { Bell, Eye, EyeOff } from "lucide-react";

const KEY = "patrimo.hide-values";

export function TopBarActions() {
  const [hidden, setHidden] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  useEffect(() => {
    let v = false;
    try {
      v = localStorage.getItem(KEY) === "1";
    } catch {}
    // sincroniza com localStorage (sistema externo) na montagem
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(v);
    document.documentElement.classList.toggle("values-hidden", v);
  }, []);

  const toggle = () => {
    const next = !hidden;
    setHidden(next);
    document.documentElement.classList.toggle("values-hidden", next);
    try {
      localStorage.setItem(KEY, next ? "1" : "0");
    } catch {}
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggle}
        aria-label={hidden ? "Mostrar valores" : "Ocultar valores"}
        title={hidden ? "Mostrar valores" : "Ocultar valores"}
        className="rounded-full border border-border bg-card p-2 text-muted hover:text-ink"
      >
        {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>

      <div className="relative">
        <button
          onClick={() => setBellOpen((v) => !v)}
          aria-label="Notificações"
          className="rounded-full border border-border bg-card p-2 text-muted hover:text-ink"
        >
          <Bell className="h-4 w-4" />
        </button>
        {bellOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-card p-4 text-sm shadow-[var(--shadow-card)]">
              <p className="font-display font-bold text-ink">Notificações</p>
              <p className="mt-1 text-muted">
                Sem novidades por aqui. Alertas de vencimento e metas aparecem neste
                menu.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
