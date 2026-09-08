import Link from "next/link";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { StatTile } from "@/components/ui/Misc";
import { CategoryPill } from "@/components/app/CategoryPill";
import { formatCurrency } from "@/lib/utils";
import { PrintButton } from "./PrintButton";

export const metadata = { title: "Relatórios" };

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function label(m: string) {
  const [y, mm] = m.split("-").map(Number);
  const s = new Date(y, mm - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function shift(m: string, n: number) {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(y, mm - 1 + n, 1);
  return monthKey(d);
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const sp = await searchParams;
  const m = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : monthKey();

  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const [{ data: entries }, { data: catRows }] = await Promise.all([
    supabase
      .from("budget_entries")
      .select("kind, amount, category, pending")
      .eq("user_id", user.id)
      .eq("reference_month", `${m}-01`),
    supabase.from("budget_categories").select("name, color").eq("user_id", user.id),
  ]);

  const rows = (entries ?? []).filter((r) => !r.pending);
  const catColor = new Map((catRows ?? []).map((c) => [c.name.toLowerCase(), c.color]));

  const sum = (k: string) => rows.filter((r) => r.kind === k).reduce((s, r) => s + Number(r.amount), 0);
  const receita = sum("income");
  const fixa = sum("expense_fixed");
  const variavel = sum("expense_variable");
  const saldo = receita - fixa - variavel;

  const byCat = new Map<string, number>();
  for (const r of rows) {
    if (r.kind === "income") continue;
    const key = r.category?.trim() || "Sem categoria";
    byCat.set(key, (byCat.get(key) ?? 0) + Number(r.amount));
  }
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]);
  const totalDespesa = fixa + variavel;

  return (
    <>
      <PageHeader
        title="Relatórios"
        subtitle="Fechamento do mês. Baixe em CSV para o contador ou imprima."
        action={
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
            <Link href={`/app/relatorios?m=${shift(m, -1)}`} className="rounded-full p-1.5 hover:bg-ink/[0.05]" aria-label="Mês anterior">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="px-2 text-sm font-medium">{label(m)}</span>
            <Link href={`/app/relatorios?m=${shift(m, 1)}`} className="rounded-full p-1.5 hover:bg-ink/[0.05]" aria-label="Próximo mês">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <a
          href={`/api/export/budget?m=${m}`}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-[#eaf5ee] hover:bg-brand-600"
        >
          <Download className="h-4 w-4" /> Baixar CSV
        </a>
        <PrintButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Receita" value={formatCurrency(receita, cur)} />
        <StatTile label="Despesa fixa" value={formatCurrency(fixa, cur)} />
        <StatTile label="Despesa variável" value={formatCurrency(variavel, cur)} />
        <StatTile label="Saldo do mês" value={formatCurrency(saldo, cur)} tone="ink" />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <h3 className="font-display text-base font-bold text-ink">Despesas por categoria</h3>
        {cats.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Sem despesas neste mês.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {cats.map(([name, value]) => (
              <li key={name} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <CategoryPill name={name} color={catColor.get(name.toLowerCase())} />
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-muted">
                    {totalDespesa > 0 ? Math.round((value / totalDespesa) * 100) : 0}%
                  </span>
                  <span className="w-24 text-right tabular-nums text-ink">
                    {formatCurrency(value, cur)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
