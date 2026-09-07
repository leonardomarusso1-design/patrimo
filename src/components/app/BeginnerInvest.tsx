import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { PROFILE_INFO } from "@/lib/investor";
import type { InvestorProfile } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

const AMOUNTS = [100, 300, 500];

const STEPS = [
  {
    t: "1. Reserva de emergência primeiro",
    d: "Antes de investir para render, tenha o colchão para imprevistos. Fica em Tesouro Selic ou CDB de liquidez diária.",
    href: "/blog/reserva-de-emergencia-6-ou-12-meses",
  },
  {
    t: "2. A parte de renda fixa",
    d: "Tesouro Selic ou um CDB de banco grande que pague perto de 100% do CDI. Simples, previsível, sem susto.",
    href: "/blog/tesouro-direto",
  },
  {
    t: "3. A parte de renda variável",
    d: "Para começar, um ETF de índice amplo (ex.: um que segue o Ibovespa ou o S&P 500) já diversifica em dezenas de empresas de uma vez.",
    href: "/blog/etfs-como-funcionam",
  },
];

export function BeginnerInvest({
  profile,
  currency,
}: {
  profile: InvestorProfile;
  currency: string;
}) {
  const info = PROFILE_INFO[profile];
  const rf = info.allocation.rendaFixa / 100;
  const rv = info.allocation.variavel / 100;

  return (
    <div className="mt-6 rounded-2xl border border-brand/30 bg-brand-50 p-6">
      <p className="font-display text-lg font-bold text-brand-700">
        Você ainda não começou a investir
      </p>
      <p className="mt-1 text-sm text-brand-700/80">
        Seu perfil deu <strong>{info.label}</strong>. {info.blurb} Uma carteira{" "}
        {info.label.toLowerCase()} mira cerca de <strong>{info.allocation.rendaFixa}% em renda
        fixa</strong> e <strong>{info.allocation.variavel}% em renda variável</strong>.
      </p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-brand/20 bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="px-3 py-2 font-semibold">Se você aportar</th>
              <th className="px-3 py-2 font-semibold">Renda fixa</th>
              <th className="px-3 py-2 font-semibold">Renda variável</th>
            </tr>
          </thead>
          <tbody>
            {AMOUNTS.map((a) => (
              <tr key={a} className="border-t border-border">
                <td className="px-3 py-2 font-medium text-ink">
                  {formatCurrency(a, currency)}/mês
                </td>
                <td className="px-3 py-2 tabular-nums text-ink">
                  {formatCurrency(Math.round(a * rf), currency)}
                </td>
                <td className="px-3 py-2 tabular-nums text-ink">
                  {formatCurrency(Math.round(a * rv), currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-brand-700/70">
        Dá pra começar com pouco. O que constrói patrimônio é o aporte todo mês, não o valor.
      </p>

      <ol className="mt-5 space-y-3">
        {STEPS.map((s) => (
          <li key={s.t}>
            <Link href={s.href} className="group block">
              <p className="font-display text-sm font-bold text-brand-700 group-hover:underline">
                {s.t}
              </p>
              <p className="mt-0.5 text-sm text-brand-700/80">{s.d}</p>
            </Link>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-[#eaf5ee] hover:bg-brand-600"
        >
          <BookOpen className="h-4 w-4" /> Entender investimentos
        </Link>
        <Link
          href="/app/investimentos/perfil"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 px-3.5 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
        >
          Refazer o perfil <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
