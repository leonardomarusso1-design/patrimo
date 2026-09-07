import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile, EmptyState } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { computeNetWorth } from "@/lib/networth";
import { ReportChart } from "./ReportChart";
import { AreaTrend } from "@/components/app/AreaTrend";

export const metadata = { title: "Visão geral" };

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function firstOfMonth(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function VisaoGeralPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;

  // grava/atualiza a foto do patrimônio deste mês antes de ler o histórico
  const nw = await computeNetWorth(supabase, user.id, cur);
  await supabase.from("net_worth_snapshots").upsert(
    {
      user_id: user.id,
      month: firstOfMonth(),
      net_worth: nw.netWorth,
      assets: nw.assets,
      wallet: nw.wallet,
      reserve: nw.reserve,
      debts: nw.debts,
    },
    { onConflict: "user_id,month" },
  );

  const [{ data: budget }, { data: snaps }] = await Promise.all([
    supabase
      .from("budget_entries")
      .select("kind, amount, reference_month")
      .eq("user_id", user.id)
      .gte("reference_month", fromStr),
    supabase
      .from("net_worth_snapshots")
      .select("month, net_worth")
      .eq("user_id", user.id)
      .order("month", { ascending: true })
      .limit(13),
  ]);

  const rows = budget ?? [];
  const buckets: { month: string; receita: number; gastos: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const monthRows = rows.filter((r) => r.reference_month === key);
    buckets.push({
      month: MONTHS[d.getMonth()],
      receita: monthRows.filter((r) => r.kind === "income").reduce((s, r) => s + Number(r.amount), 0),
      gastos: monthRows.filter((r) => r.kind !== "income").reduce((s, r) => s + Number(r.amount), 0),
    });
  }

  const totalReceita = buckets.reduce((s, b) => s + b.receita, 0);
  const totalGastos = buckets.reduce((s, b) => s + b.gastos, 0);
  const avgBalance = (totalReceita - totalGastos) / 6;
  const hasBudget = totalReceita + totalGastos > 0;

  const nwSeries = (snaps ?? []).map((s) => ({
    month: MONTHS[Number(s.month.slice(5, 7)) - 1],
    valor: Number(s.net_worth),
  }));

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Evolução do patrimônio e do orçamento." />

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="mb-4 flex items-baseline justify-between">
          <h3 className="font-display text-base font-bold text-ink">Patrimônio líquido</h3>
          <span className="money font-display text-lg font-extrabold text-ink">
            {formatCurrency(nw.netWorth, cur)}
          </span>
        </div>
        {nwSeries.length >= 2 ? (
          <AreaTrend data={nwSeries} currency={cur} />
        ) : (
          <p className="py-8 text-center text-sm text-muted">
            Registramos a foto de hoje. O gráfico de evolução aparece a partir do
            segundo mês.
          </p>
        )}
      </div>

      <div className="mt-6">
        {!hasBudget ? (
          <EmptyState
            title="Ainda sem histórico de orçamento"
            description="Lance receitas e despesas no Orçamento por alguns meses e o relatório aparece aqui."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Receita (6 meses)" value={formatCurrency(totalReceita, cur)} />
              <StatTile label="Gastos (6 meses)" value={formatCurrency(totalGastos, cur)} />
              <StatTile label="Saldo médio / mês" value={formatCurrency(avgBalance, cur)} tone="ink" />
            </div>
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <h3 className="mb-4 font-display text-base font-bold text-ink">Receita × Gastos</h3>
              <ReportChart data={buckets} currency={cur} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
