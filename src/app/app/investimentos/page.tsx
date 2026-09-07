import Link from "next/link";
import { Sparkles } from "lucide-react";
import { requireUser, getProfile, requirePlan } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { StatTile, Progress, Badge } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { PROFILE_INFO, VARIABLE_CLASSES } from "@/lib/investor";
import type { Tables } from "@/types/database";

export const metadata = { title: "Investimentos" };

type Investment = Tables<"investments">;

const CLASS_LABEL: Record<string, string> = {
  renda_fixa: "Renda fixa",
  acao: "Ações",
  fii: "FIIs",
  etf: "ETFs",
  cripto: "Cripto",
  cash: "Caixa",
  outro: "Outro",
};

const FIELDS: Field[] = [
  { name: "name", label: "Ativo", type: "text", required: true, placeholder: "Tesouro Selic 2031, PETR4, HGLG11…" },
  { name: "broker", label: "Corretora (opcional)", type: "text", placeholder: "BTG, XP, Itaú…" },
  {
    name: "asset_class",
    label: "Classe",
    type: "select",
    required: true,
    options: Object.entries(CLASS_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "currency", label: "Moeda", type: "select", required: true, defaultValue: "BRL", options: ["BRL", "USD", "EUR"].map((c) => ({ value: c, label: c })) },
  { name: "invested_amount", label: "Total investido (R$)", type: "money", required: true },
  { name: "current_amount", label: "Valor atual (R$)", type: "money", required: true },
];

export default async function InvestimentosPage() {
  await requirePlan("pro", "Investimentos");
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const { data } = await supabase
    .from("investments")
    .select("*")
    .eq("user_id", user.id)
    .order("current_amount", { ascending: false });

  const rows = (data ?? []) as Investment[];
  const invested = rows.reduce((s, r) => s + Number(r.invested_amount), 0);
  const currentVal = rows.reduce((s, r) => s + Number(r.current_amount), 0);
  const gain = currentVal - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

  const byAsset = rows.map((r) => ({ name: r.name, value: Number(r.current_amount) }));
  const byClassMap = new Map<string, number>();
  for (const r of rows) {
    byClassMap.set(
      CLASS_LABEL[r.asset_class],
      (byClassMap.get(CLASS_LABEL[r.asset_class]) ?? 0) + Number(r.current_amount),
    );
  }
  const byClass = [...byClassMap.entries()].map(([name, value]) => ({ name, value }));

  const variableVal = rows
    .filter((r) => VARIABLE_CLASSES.has(r.asset_class))
    .reduce((s, r) => s + Number(r.current_amount), 0);
  const variablePct = currentVal > 0 ? (variableVal / currentVal) * 100 : 0;
  const invProfile = profile.investor_profile;
  const target = invProfile ? PROFILE_INFO[invProfile].allocation.variavel : null;

  return (
    <>
      <PageHeader
        title="Investimentos"
        subtitle="Sua carteira consolidada."
        action={
          invProfile ? (
            <Link href="/app/investimentos/perfil">
              <Badge tone="accent">Perfil: {PROFILE_INFO[invProfile].label}</Badge>
            </Link>
          ) : undefined
        }
      />

      {!invProfile && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-brand-50 p-4">
          <div className="flex items-center gap-2 text-sm text-brand-700">
            <Sparkles className="h-4 w-4" />
            Descubra seu perfil de investidor para a carteira sugerida se ajustar a você.
          </div>
          <ButtonLink href="/app/investimentos/perfil" size="sm">
            Responder (2 min)
          </ButtonLink>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Valor atual" value={formatCurrency(currentVal, cur)} tone="ink" />
        <StatTile label="Total investido" value={formatCurrency(invested, cur)} />
        <StatTile
          label="Rendimento"
          value={formatCurrency(gain, cur)}
          hint={`${gain >= 0 ? "+" : ""}${formatPercent(gainPct)}`}
        />
      </div>

      {byAsset.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 font-display text-base font-bold text-ink">Composição por ativo</h3>
            <Donut data={byAsset} currency={cur} centerLabel="carteira" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <h3 className="mb-4 font-display text-base font-bold text-ink">Por classe de ativo</h3>
            <Donut data={byClass} currency={cur} centerLabel="carteira" />
          </div>
        </div>
      )}

      {invProfile && rows.length > 0 && target != null && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-base font-bold text-ink">
            Renda variável na carteira
          </h3>
          <p className="mt-1 text-sm text-muted">
            Perfil {PROFILE_INFO[invProfile].label}: alvo de ~{target}% em renda
            variável (ações, FIIs, ETFs, cripto).
          </p>
          <div className="mt-3">
            <Progress value={variablePct} tone={Math.abs(variablePct - target) <= 10 ? "success" : "accent"} />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            Você tem <strong>{Math.round(variablePct)}%</strong> ({formatCurrency(variableVal, cur)}).{" "}
            {variablePct > target + 10
              ? "Acima do alvo — considere reforçar renda fixa."
              : variablePct < target - 10
                ? "Abaixo do alvo — há espaço para mais renda variável."
                : "Dentro do alvo."}
          </p>
        </div>
      )}

      <div className="mt-6">
        <EntityManager
          table="investments"
          path="/app/investimentos"
          title="Ativos"
          addLabel="Adicionar ativo"
          fields={FIELDS}
          rows={rows.map((r) => {
            const g = Number(r.current_amount) - Number(r.invested_amount);
            return {
              id: r.id,
              raw: {
                name: r.name,
                broker: r.broker,
                asset_class: r.asset_class,
                currency: r.currency,
                invested_amount: Number(r.invested_amount),
                current_amount: Number(r.current_amount),
              },
              node: (
                <>
                  <span className="font-medium text-ink">
                    {r.name}
                    <span className="ml-2 text-xs text-muted">
                      {CLASS_LABEL[r.asset_class]}
                      {r.broker ? ` · ${r.broker}` : ""}
                    </span>
                  </span>
                  <span className="tabular-nums text-ink sm:text-right">
                    {formatCurrency(Number(r.current_amount), cur)}
                    <span className={g >= 0 ? "ml-2 text-xs text-success" : "ml-2 text-xs text-danger"}>
                      {g >= 0 ? "+" : ""}
                      {formatCurrency(g, cur)}
                    </span>
                  </span>
                </>
              ),
            };
          })}
          emptyTitle="Nenhum ativo ainda"
          emptyDescription="Adicione o que você tem em renda fixa, ações, FIIs, ETFs ou cripto."
        />
      </div>
    </>
  );
}
