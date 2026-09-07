"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import {
  CURRENCIES,
  INCOME_BANDS,
  OCCUPATIONS,
  COUNTRIES,
  BR_STATES,
  ONBOARDING_STEPS,
} from "@/lib/onboarding";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { Progress } from "@/components/ui/Misc";

const empty: OnboardingState = {};

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    display_currency: "BRL",
    income_band: "",
    occupation: "",
    country: "Brasil",
    state: "SP",
    city: "",
    terms: false,
    marketing_opt_in: false,
  });
  const [state, formAction, pending] = useActionState(completeOnboarding, empty);

  const set = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));
  const last = ONBOARDING_STEPS.length - 1;

  const canProceed = [
    !!data.display_currency,
    !!data.income_band,
    !!data.occupation,
    !!data.country && (data.country !== "Brasil" || !!data.state),
    data.terms,
  ][step];

  return (
    <div className="w-full max-w-lg">
      <div className="rounded-2xl bg-ink p-6 text-[#f7f5f1]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#f7f5f1]/60">
          Para personalizar seu painel
        </p>
        <h1 className="mt-2 text-2xl font-extrabold">Vamos personalizar, {firstName}</h1>
        <p className="mt-1 text-sm text-[#f7f5f1]/70">
          Leva 30 segundos. Isso ajusta metas e relatórios ao seu perfil.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <Progress value={((step + 1) / ONBOARDING_STEPS.length) * 100} />
          <span className="shrink-0 text-xs text-[#f7f5f1]/60">
            {step + 1}/{ONBOARDING_STEPS.length}
          </span>
        </div>
      </div>

      <form action={formAction} className="mt-4 rounded-2xl border border-border bg-card p-6">
        {/* campos mantidos no DOM em todos os passos para o submit final */}
        <input type="hidden" name="display_currency" value={data.display_currency} />
        <input type="hidden" name="income_band" value={data.income_band} />
        <input type="hidden" name="occupation" value={data.occupation} />
        <input type="hidden" name="country" value={data.country} />
        <input type="hidden" name="state" value={data.country === "Brasil" ? data.state : ""} />
        <input type="hidden" name="city" value={data.city} />
        {data.terms && <input type="hidden" name="terms" value="on" />}
        {data.marketing_opt_in && <input type="hidden" name="marketing_opt_in" value="on" />}

        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Passo {step + 1} — {ONBOARDING_STEPS[step].label}
        </p>
        <h2 className="mt-1 font-display text-lg font-bold text-ink">
          {ONBOARDING_STEPS[step].question}
        </h2>

        <div className="mt-5 space-y-3">
          {step === 0 && (
            <div>
              <Label>Moeda de exibição</Label>
              <Select
                value={data.display_currency}
                onChange={(e) => set({ display_currency: e.target.value })}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-xs text-muted">
                Muda como os valores aparecem. Você troca depois nas Configurações.
              </p>
            </div>
          )}

          {step === 1 &&
            INCOME_BANDS.map((band) => (
              <button
                type="button"
                key={band}
                onClick={() => set({ income_band: band })}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${
                  data.income_band === band
                    ? "border-accent bg-accent/5 text-ink"
                    : "border-border text-muted hover:border-ink/25"
                }`}
              >
                {band}
                {data.income_band === band && <Check className="h-4 w-4 text-accent" />}
              </button>
            ))}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OCCUPATIONS.map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => set({ occupation: o })}
                  className={`rounded-xl border px-4 py-3 text-left text-sm ${
                    data.occupation === o
                      ? "border-accent bg-accent/5 text-ink"
                      : "border-border text-muted hover:border-ink/25"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <Label>País</Label>
                <Select
                  value={data.country}
                  onChange={(e) => set({ country: e.target.value })}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              {data.country === "Brasil" && (
                <div>
                  <Label>Estado</Label>
                  <Select value={data.state} onChange={(e) => set({ state: e.target.value })}>
                    {BR_STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </Select>
                </div>
              )}
              <div>
                <Label>Cidade (opcional)</Label>
                <Input
                  value={data.city}
                  onChange={(e) => set({ city: e.target.value })}
                  placeholder="Sua cidade"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="flex gap-2">
                <Link
                  href="/termos"
                  target="_blank"
                  className="rounded-full bg-accent/10 px-3 py-1.5 text-sm text-accent-dim"
                >
                  Ler Termos de Uso
                </Link>
                <Link
                  href="/privacidade"
                  target="_blank"
                  className="rounded-full bg-accent/10 px-3 py-1.5 text-sm text-accent-dim"
                >
                  Ler Privacidade
                </Link>
              </div>
              <label className="flex items-start gap-3 rounded-xl bg-surface p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4"
                  checked={data.terms}
                  onChange={(e) => set({ terms: e.target.checked })}
                />
                <span>Li e aceito os Termos de Uso e a Política de Privacidade da Patrimo.</span>
              </label>
              <label className="flex items-start gap-3 rounded-xl bg-surface p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4"
                  checked={data.marketing_opt_in}
                  onChange={(e) => set({ marketing_opt_in: e.target.checked })}
                />
                <span>Quero receber dicas e novidades por e-mail (opcional).</span>
              </label>
            </>
          )}
        </div>

        {state.error && (
          <p className="mt-4 rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {state.error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button type="button" variant="ghost" onClick={() => setStep((s) => s - 1)}>
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
          ) : (
            <span />
          )}
          {step < last ? (
            <Button
              type="button"
              disabled={!canProceed}
              onClick={() => setStep((s) => s + 1)}
            >
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={!canProceed} loading={pending}>
              <Check className="h-4 w-4" /> Concluir
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
