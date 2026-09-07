import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile, EmptyState } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import { ReportChart } from "./ReportChart";

export const metadata = { title: "Visão geral" };

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function VisaoGeralPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const fromStr = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("budget_entries")
    .select("kind, amount, reference_month")
    .eq("user_id", user.id)
    .gte("reference_month", fromStr);

  const rows = data ?? [];

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

  const hasData = totalReceita + totalGastos > 0;

  return (
    <>
      <PageHeader title="Visão geral" subtitle="Receita, gastos e saldo dos últimos 6 meses." />

      {!hasData ? (
        <EmptyState
          title="Ainda sem histórico"
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
    </>
  );
}
