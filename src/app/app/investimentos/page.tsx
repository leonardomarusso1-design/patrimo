import Link from "next/link";
import { Sparkles, ChevronDown } from "lucide-react";
import { requireUser, getProfile, requirePlan } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { AreaTrend } from "@/components/app/AreaTrend";
import { StatTile, Progress, Badge } from "@/components/ui/Misc";
import { ButtonLink } from "@/components/ui/Button";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { PROFILE_INFO, VARIABLE_CLASSES } from "@/lib/investor";
import { getRates, convert } from "@/lib/fx";
import { AdviceCard } from "@/components/app/AdviceCard";
import type { Tables } from "@/types/database";

export const metadata = { title: "Investimentos" };

type Investment = Tables<"investments">;

const CLASS_LABEL: Record<string, string> = {
  acao: "Ações",
  fii: "FIIs",
  etf: "ETFs",
  renda_fixa: "Renda fixa",
  cripto: "Cripto",
  cash: "Caixa",
  outro: "Outro",
};
const CLASS_ORDER = ["acao", "fii", "etf", "renda_fixa", "cripto", "cash", "outro"];

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const BASE_FIELDS: Field[] = [
  { name: "name", label: "Ativo", type: "text", required: true, placeholder: "Tesouro Selic 2031, PETR4, HGLG11…" },
  { name: "broker", label: "Corretora (opcional)", type: "text", placeholder: "BTG, XP, Itaú…" },
  { name: "currency", label: "Moeda", type: "select", required: true, defaultValue: "BRL", options: ["BRL", "USD", "EUR"].map((c) => ({ value: c, label: c })) },
  { name: "invested_amount", label: "Total investido (R$)", type: "money", required: true },
  { name: "current_amount", label: "Valor atual (R$)", type: "money", required: true },
];

export default async function InvestimentosPage() {
  await requirePlan("pro", "Investimentos");
  const [{ user, supabase }, profile, rates] = await Promise.all([
    requireUser(),
    getProfile(),
    getRates(),
  ]);
  const cur = profile.display_currency;

  const [{ data }, { data: adviceRow }, { data: snaps }] = await Promise.all([
    supabase.from("investments").select("*").eq("user_id", user.id).order("current_amount", { ascending: false }),
    supabase
      .from("investment_advice")
      .select("summary, actions, model, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("net_worth_snapshots")
      .select("month, wallet")
      .eq("user_id", user.id)
      .order("month", { ascending: true })
      .limit(13),
  ]);

  const rows = (data ?? []) as Investment[];
  const cvInvested = (r: Investment) => convert(Number(r.invested_amount), r.currency, cur, rates);
  const cvCurrent = (r: Investment) => convert(Number(r.current_amount), r.currency, cur, rates);

  const invested = rows.reduce((s, r) => s + cvInvested(r), 0);
  const currentVal = rows.reduce((s, r) => s + cvCurrent(r), 0);
  const gain = currentVal - invested;
  const gainPct = invested > 0 ? (gain / invested) * 100 : 0;

  const byClassMap = new Map<string, number>();
  for (const r of rows) {
    byClassMap.set(CLASS_LABEL[r.asset_class], (byClassMap.get(CLASS_LABEL[r.asset_class]) ?? 0) + cvCurrent(r));
  }
  const byClass = [...byClassMap.entries()].map(([name, value]) => ({ name, value }));

  const variableVal = rows.filter((r) => VARIABLE_CLASSES.has(r.asset_class)).reduce((s, r) => s + cvCurrent(r), 0);
  const variablePct = currentVal > 0 ? (variableVal / currentVal) * 100 : 0;
  const invProfile = profile.investor_profile;
  const target = invProfile ? PROFILE_INFO[invProfile].allocation.variavel : null;

  const walletSeries = (snaps ?? [])
    .map((s) => ({ month: MONTHS[Number(s.month.slice(5, 7)) - 1], valor: Number(s.wallet) }))
    .filter((p) => p.valor > 0);

  const groups = CLASS_ORDER.map((key) => {
    const g = rows.filter((r) => r.asset_class === key);
    const gCur = g.reduce((s, r) => s + cvCurrent(r), 0);
    const gInv = g.reduce((s, r) => s + cvInvested(r), 0);
    return {
      key,
      label: CLASS_LABEL[key],
      rows: g,
      current: gCur,
      gain: gCur - gInv,
      gainPct: gInv > 0 ? ((gCur - gInv) / gInv) * 100 : 0,
      share: currentVal > 0 ? (gCur / currentVal) * 100 : 0,
    };
  }).filter((g) => g.rows.length > 0 || ["acao", "fii", "renda_fixa"].includes(g.key));

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Patrimônio da carteira" value={formatCurrency(currentVal, cur)} tone="ink" hint={`${gain >= 0 ? "+" : ""}${formatPercent(gainPct)} total`} />
        <StatTile label="Lucro total" value={formatCurrency(gain, cur)} hint="ganho de capital" />
        <StatTile label="Total investido" value={formatCurrency(invested, cur)} />
        <StatTile label="Renda variável" value={`${Math.round(variablePct)}%`} hint={target != null ? `alvo ~${target}%` : undefined} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Evolução da carteira</h3>
          {walletSeries.length >= 2 ? (
            <AreaTrend data={walletSeries} currency={cur} />
          ) : (
            <p className="py-8 text-center text-sm text-muted">
              A curva aparece a partir do segundo mês com investimentos lançados.
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Ativos na carteira</h3>
          {byClass.length > 0 ? (
            <Donut data={byClass} currency={cur} centerLabel="carteira" />
          ) : (
            <p className="py-8 text-center text-sm text-muted">Adicione ativos para ver a composição.</p>
          )}
        </div>
      </div>

      {invProfile && rows.length > 0 && target != null && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="font-display text-base font-bold text-ink">Renda variável na carteira</h3>
          <p className="mt-1 text-sm text-muted">
            Perfil {PROFILE_INFO[invProfile].label}: alvo de ~{target}% em renda variável.
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

      {invProfile && (
        <AdviceCard
          advice={
            adviceRow
              ? {
                  summary: adviceRow.summary,
                  actions: (adviceRow.actions as string[]) ?? [],
                  model: adviceRow.model,
                  created_at: adviceRow.created_at,
                }
              : null
          }
        />
      )}

      <h2 className="mt-8 mb-3 font-display text-lg font-bold text-ink">Meus ativos</h2>
      <div className="space-y-3">
        {groups.map((grp) => (
          <details
            key={grp.key}
            className="group rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]"
            open={grp.rows.length > 0}
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
              <span className="font-display text-sm font-bold text-ink">{grp.label}</span>
              <span className="text-xs text-muted">
                {grp.rows.length} ativo{grp.rows.length === 1 ? "" : "s"}
              </span>
              <span className="ml-auto flex items-center gap-3">
                <span className="tabular-nums text-sm font-semibold text-ink">{formatCurrency(grp.current, cur)}</span>
                {grp.rows.length > 0 && (
                  <span className={`hidden text-xs tabular-nums sm:inline ${grp.gain >= 0 ? "text-success" : "text-danger"}`}>
                    {grp.gain >= 0 ? "+" : ""}
                    {formatPercent(grp.gainPct)}
                  </span>
                )}
                <span className="hidden w-10 text-right text-xs tabular-nums text-muted sm:inline">
                  {Math.round(grp.share)}%
                </span>
              </span>
            </summary>
            <div className="border-t border-border p-4">
              <EntityManager
                table="investments"
                path="/app/investimentos"
                title=""
                addLabel={`Adicionar em ${grp.label}`}
                fields={BASE_FIELDS}
                hidden={{ asset_class: grp.key }}
                flat
                rows={grp.rows.map((r) => {
                  const g = cvCurrent(r) - cvInvested(r);
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
                        <span className="min-w-0 font-medium text-ink">
                          {r.name}
                          {(r.broker || r.currency !== cur) && (
                            <span className="ml-2 text-xs text-muted">
                              {r.broker ?? ""}
                              {r.broker && r.currency !== cur ? " · " : ""}
                              {r.currency !== cur ? r.currency : ""}
                            </span>
                          )}
                        </span>
                        <span className="tabular-nums text-ink sm:text-right">
                          {formatCurrency(cvCurrent(r), cur)}
                          <span className={g >= 0 ? "ml-2 text-xs text-success" : "ml-2 text-xs text-danger"}>
                            {g >= 0 ? "+" : ""}
                            {formatCurrency(g, cur)}
                          </span>
                        </span>
                      </>
                    ),
                  };
                })}
                emptyTitle={`Nenhum ativo em ${grp.label}`}
                emptyDescription="Lance o que você tem nesta classe."
              />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
