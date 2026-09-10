"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ShieldAlert } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Ordre app error", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10 text-danger">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold text-ink">Não conseguimos abrir seu painel</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Sua sessão pode ter expirado ou algum dado ainda está sincronizando. Tente novamente; seus dados não foram alterados.</p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button type="button" onClick={() => reset()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-dim">
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </button>
          <Link href="/login" className="inline-flex h-11 items-center justify-center rounded-xl border border-ink/15 px-5 text-sm font-semibold text-ink hover:bg-surface">Entrar de novo</Link>
        </div>
      </div>
    </div>
  );
}
