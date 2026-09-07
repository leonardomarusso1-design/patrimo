"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { signOut } from "@/app/auth/actions";

export function MfaChallenge({ factorId }: { factorId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    setError(null);
    setBusy(true);
    const ch = await supabase.auth.mfa.challenge({ factorId });
    if (ch.error || !ch.data) {
      setBusy(false);
      return setError("Erro ao gerar desafio. Tente de novo.");
    }
    const v = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (v.error) return setError("Código incorreto.");
    router.replace("/app");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <Input
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        className="tracking-[0.4em]"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button className="w-full" loading={busy} disabled={code.length !== 6} onClick={verify}>
        Verificar
      </Button>
      <form action={signOut}>
        <button className="w-full text-center text-sm text-muted hover:text-ink">
          Sair
        </button>
      </form>
    </div>
  );
}
