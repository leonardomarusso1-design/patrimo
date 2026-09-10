"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronDown, CircleDollarSign, MapPin, Sparkles, UserRound, WalletCards } from "lucide-react";
import { CURRENCIES, INCOME_BANDS, OCCUPATIONS, COUNTRIES, BR_STATES, ONBOARDING_STEPS } from "@/lib/onboarding";
import { completeOnboarding, type OnboardingState } from "./actions";
import { Button } from "@/components/ui/Button";

const empty: OnboardingState = {};
const ICONS = [CircleDollarSign, WalletCards, UserRound, MapPin, Check];

export function OnboardingWizard({ firstName }: { firstName: string }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ display_currency: "BRL", income_band: "", occupation: "", country: "Brasil", state: "SP", city: "", terms: false, marketing_opt_in: false });
  const [state, formAction, pending] = useActionState(completeOnboarding, empty);
  const last = ONBOARDING_STEPS.length - 1;
  const Icon = ICONS[step];
  const set = (patch: Partial<typeof data>) => setData((current) => ({ ...current, ...patch }));
  const canProceed = [!!data.display_currency, !!data.income_band, !!data.occupation, !!data.country && (data.country !== "Brasil" || !!data.state), data.terms][step];

  const choose = (patch: Partial<typeof data>, shouldAdvance = true) => {
    set(patch);
    if (shouldAdvance && step < 3) window.setTimeout(() => setStep((current) => Math.min(current + 1, last)), 160);
  };

  return (
    <div className="w-full max-w-[440px]">
      <div className="mb-8 flex items-center justify-between px-1">
        <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-ink">Ord<span className="text-accent">re</span></Link>
        <span className="text-xs font-semibold text-muted">{step + 1} de {ONBOARDING_STEPS.length}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink/[0.08]"><div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }} /></div>

      <form action={formAction} className="mt-10">
        <input type="hidden" name="display_currency" value={data.display_currency} />
        <input type="hidden" name="income_band" value={data.income_band} />
        <input type="hidden" name="occupation" value={data.occupation} />
        <input type="hidden" name="country" value={data.country} />
        <input type="hidden" name="state" value={data.country === "Brasil" ? data.state : ""} />
        <input type="hidden" name="city" value={data.city} />
        {data.terms && <input type="hidden" name="terms" value="on" />}
        {data.marketing_opt_in && <input type="hidden" name="marketing_opt_in" value="on" />}

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-700 shadow-[0_0_0_8px_rgba(207,231,218,0.45)]"><Icon className="h-6 w-6" /></div>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-brand-700">{ONBOARDING_STEPS[step].label}</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.03em] text-ink">{step === 0 ? `Vamos deixar tudo com a sua cara, ${firstName}.` : ONBOARDING_STEPS[step].question}</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">{step === 0 ? "São só algumas perguntas rápidas para o Ordre entender como organizar sua vida financeira." : "Escolha a opção que mais combina com você."}</p>
        </div>

        <div className="mt-9 space-y-3">
          {step === 0 && <OptionList items={CURRENCIES.map((item) => ({ value: item.code, label: item.label }))} selected={data.display_currency} onSelect={(value) => choose({ display_currency: value })} />}
          {step === 1 && <OptionList items={INCOME_BANDS.map((item) => ({ value: item, label: item }))} selected={data.income_band} onSelect={(value) => choose({ income_band: value })} />}
          {step === 2 && <OptionList items={OCCUPATIONS.map((item) => ({ value: item, label: item }))} selected={data.occupation} onSelect={(value) => choose({ occupation: value })} />}
          {step === 3 && <div className="space-y-3"><SelectCard label="País" value={data.country} onChange={(value) => set({ country: value })} items={COUNTRIES.map((item) => ({ value: item, label: item }))} />{data.country === "Brasil" && <SelectCard label="Estado" value={data.state} onChange={(value) => set({ state: value })} items={BR_STATES.map((item) => ({ value: item, label: item }))} />}<label className="block text-left"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">Cidade <span className="font-normal normal-case">(opcional)</span></span><input value={data.city} onChange={(event) => set({ city: event.target.value })} placeholder="Sua cidade" className="h-14 w-full rounded-2xl border border-border bg-card px-4 text-sm text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10" /></label></div>}
          {step === 4 && <div className="space-y-3 text-left"><div className="rounded-2xl bg-brand-50 p-4 text-sm leading-6 text-brand-700">O Ordre usa essas informações apenas para personalizar sua experiência. Você pode alterar tudo depois.</div><label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand" checked={data.terms} onChange={(event) => set({ terms: event.target.checked })} /><span>Li e aceito os <Link href="/termos" target="_blank" className="font-bold text-brand-700 underline">Termos de Uso</Link> e a <Link href="/privacidade" target="_blank" className="font-bold text-brand-700 underline">Política de Privacidade</Link>.</span></label><label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-6 text-ink"><input type="checkbox" className="mt-1 h-4 w-4 accent-brand" checked={data.marketing_opt_in} onChange={(event) => set({ marketing_opt_in: event.target.checked })} /><span>Quero receber dicas e novidades por e-mail <span className="text-muted">(opcional)</span>.</span></label></div>}
        </div>

        {state.error && <p className="mt-5 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">{state.error}</p>}
        <div className="mt-8 flex items-center gap-3">{step > 0 && <Button type="button" variant="ghost" onClick={() => setStep((current) => current - 1)} aria-label="Voltar"><ArrowLeft className="h-4 w-4" /></Button>}{step < last ? <Button type="button" className="h-14 flex-1 rounded-2xl" disabled={!canProceed} onClick={() => setStep((current) => current + 1)}>Continuar <ArrowRight className="h-4 w-4" /></Button> : <Button type="submit" className="h-14 flex-1 rounded-2xl" disabled={!canProceed} loading={pending}>Entrar no meu Ordre <Sparkles className="h-4 w-4" /></Button>}</div>
      </form>
    </div>
  );
}

function OptionList({ items, selected, onSelect }: { items: { value: string; label: string }[]; selected: string; onSelect: (value: string) => void }) {
  return <div className="space-y-3">{items.map((item) => <button type="button" key={item.value} onClick={() => onSelect(item.value)} className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left text-sm font-semibold transition-all active:scale-[0.99] ${selected === item.value ? "border-accent bg-brand-50 text-brand-700 shadow-sm" : "border-border bg-card text-ink hover:border-accent/40 hover:bg-surface"}`}>{item.label}{selected === item.value && <Check className="h-4 w-4" />}</button>)}</div>;
}

function SelectCard({ label, value, onChange, items }: { label: string; value: string; onChange: (value: string) => void; items: { value: string; label: string }[] }) {
  return <label className="relative block text-left"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-muted">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-14 w-full appearance-none rounded-2xl border border-border bg-card px-4 pr-10 text-sm font-semibold text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/10">{items.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-10 h-4 w-4 text-muted" /></label>;
}
