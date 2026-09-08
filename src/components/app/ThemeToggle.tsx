"use client";

import { useState } from "react";
import { Monitor, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { setTheme } from "@/app/app/configuracoes/actions";

type Theme = "system" | "light" | "dark";

const OPTS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

function apply(t: Theme) {
  const el = document.documentElement;
  if (t === "system") {
    delete el.dataset.theme;
    try {
      localStorage.removeItem("patrimo-theme");
    } catch {}
  } else {
    el.dataset.theme = t;
    try {
      localStorage.setItem("patrimo-theme", t);
    } catch {}
  }
}

export function ThemeToggle({ current }: { current: Theme }) {
  const [value, setValue] = useState<Theme>(current);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p className="font-display text-sm font-bold text-ink">Aparência</p>
      <p className="text-xs text-muted">Sistema segue o seu aparelho.</p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {OPTS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              setValue(o.id);
              apply(o.id);
              void setTheme(o.id);
            }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors",
              value === o.id
                ? "border-brand bg-brand-50 text-brand-700"
                : "border-border text-muted hover:text-ink",
            )}
          >
            <o.icon className="h-4 w-4" />
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
