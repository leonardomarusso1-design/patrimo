import { requireUser, getProfile, requirePlan } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency, formatPercent } from "@/lib/utils";
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

  return (
    <>
      <PageHeader title="Investimentos" subtitle="Sua carteira consolidada." />

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

      <div className="mt-6">
        <EntityManager<Investment>
          table="investments"
          path="/app/investimentos"
          title="Ativos"
          addLabel="Adicionar ativo"
          fields={FIELDS}
          rows={rows}
          columns={[
            {
              header: "Ativo",
              cell: (r) => (
                <span className="font-medium text-ink">
                  {r.name}
                  <span className="ml-2 text-xs text-muted">
                    {CLASS_LABEL[r.asset_class]}
                    {r.broker ? ` · ${r.broker}` : ""}
                  </span>
                </span>
              ),
            },
            {
              header: "Atual",
              cell: (r) => {
                const g = Number(r.current_amount) - Number(r.invested_amount);
                return (
                  <span className="tabular-nums text-ink">
                    {formatCurrency(Number(r.current_amount), cur)}
                    <span className={g >= 0 ? "ml-2 text-xs text-success" : "ml-2 text-xs text-danger"}>
                      {g >= 0 ? "+" : ""}
                      {formatCurrency(g, cur)}
                    </span>
                  </span>
                );
              },
              className: "sm:text-right",
            },
          ]}
          emptyTitle="Nenhum ativo ainda"
          emptyDescription="Adicione o que você tem em renda fixa, ações, FIIs, ETFs ou cripto."
        />
      </div>
    </>
  );
}
