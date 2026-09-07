"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";

type Phase = "loading" | "off" | "enrolling" | "on";

export function MfaSetup() {
  const supabase = createClient();
  const [phase, setPhase] = useState<Phase>("loading");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // consulta o estado de MFA no Supabase na montagem
    void supabase.auth.mfa.listFactors().then(({ data }) => {
      const totp = data?.totp?.find((f) => f.status === "verified");
      setPhase(totp ? "on" : "off");
      if (totp) setFactorId(totp.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    // limpa fatores não verificados pendentes
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.totp ?? []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (error || !data) return setError("Não foi possível iniciar. Tente de novo.");
    setFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setPhase("enrolling");
  }

  async function confirmEnroll() {
    if (!factorId) return;
    setError(null);
    setBusy(true);
    const ch = await supabase.auth.mfa.challenge({ factorId });
    if (ch.error || !ch.data) {
      setBusy(false);
      return setError("Erro ao validar. Tente de novo.");
    }
    const v = await supabase.auth.mfa.verify({
      factorId,
      challengeId: ch.data.id,
      code: code.trim(),
    });
    setBusy(false);
    if (v.error) return setError("Código incorreto. Confira o app autenticador.");
    setCode("");
    setQr(null);
    setSecret(null);
    setPhase("on");
  }

  async function disable() {
    if (!factorId) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    setFactorId(null);
    setPhase("off");
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-sm shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        {phase === "on" ? (
          <ShieldCheck className="h-5 w-5 text-brand" />
        ) : (
          <ShieldAlert className="h-5 w-5 text-muted" />
        )}
        <p className="font-display font-bold text-ink">Verificação em duas etapas</p>
      </div>

      {phase === "loading" && <p className="mt-2 text-muted">Carregando…</p>}

      {phase === "off" && (
        <>
          <p className="mt-2 text-muted">
            Adicione uma camada extra: além da senha, um código do app autenticador
            (Google Authenticator, Authy, 1Password).
          </p>
          <Button className="mt-3" size="sm" loading={busy} onClick={startEnroll}>
            Ativar
          </Button>
        </>
      )}

      {phase === "enrolling" && (
        <div className="mt-3 space-y-3">
          <p className="text-muted">
            Escaneie o QR no seu app autenticador. Sem câmera? Digite o código:{" "}
            <code className="rounded bg-ink/[0.06] px-1">{secret}</code>
          </p>
          {qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code MFA" className="h-44 w-44 rounded-lg border border-border bg-[#fff] p-2" />
          )}
          <div>
            <Label htmlFor="mfacode">Código de 6 dígitos</Label>
            <Input
              id="mfacode"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-32 tracking-widest"
            />
          </div>
          {error && <p className="text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" loading={busy} disabled={code.length !== 6} onClick={confirmEnroll}>
              Confirmar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPhase("off")}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {phase === "on" && (
        <>
          <p className="mt-2 text-brand-700">Ativa. Seu login pede o código do app.</p>
          <Button className="mt-3" size="sm" variant="ghost" loading={busy} onClick={disable}>
            Desativar
          </Button>
        </>
      )}

      {error && phase !== "enrolling" && <p className="mt-2 text-danger">{error}</p>}
    </div>
  );
}
