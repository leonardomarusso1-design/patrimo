import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { PendingConfirm } from "@/components/app/PendingConfirm";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AlertTriangle, CalendarClock } from "lucide-react";

export const metadata = { title: "Contas a pagar" };

type Row = {
  id: string;
  name: string;
  amount: number;
  category: string | null;
  entry_date: string | null;
  due_day: number | null;
  reference_month: string;
  kind: string;
};

function dueDate(r: Row): string {
  if (r.entry_date) return r.entry_date;
  const day = Math.min(Math.max(r.due_day ?? 1, 1), 28);
  return `${r.reference_month.slice(0, 7)}-${String(day).padStart(2, "0")}`;
}

export default async function VencimentosPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const toD = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const to = `${toD.getFullYear()}-${String(toD.getMonth() + 1).padStart(2, "0")}-01`;

  const { data } = await supabase
    .from("budget_entries")
    .select("id, name, amount, category, entry_date, due_day, reference_month, kind")
    .eq("user_id", user.id)
    .eq("pending", true)
    .neq("kind", "income")
    .gte("reference_month", from)
    .lt("reference_month", to);

  const rows = (data ?? []) as Row[];
  const todayStr = now.toISOString().slice(0, 10);
  const in7 = new Date(now.getTime() + 7 * 86400000).toISOString().slice(0, 10);

  const withDate = rows
    .map((r) => ({ r, d: dueDate(r) }))
    .sort((a, b) => a.d.localeCompare(b.d));

  const atrasadas = withDate.filter((x) => x.d < todayStr);
  const proximas = withDate.filter((x) => x.d >= todayStr && x.d <= in7);
  const depois = withDate.filter((x) => x.d > in7);
  const total = rows.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <PageHeader
        title="Contas a pagar"
        subtitle="Despesas marcadas como previstas ('ainda não paguei'), por data de vencimento."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="A pagar (total)" value={formatCurrency(total, cur)} tone="ink" />
        <StatTile label="Atrasadas" value={String(atrasadas.length)} />
        <StatTile label="Vencem em 7 dias" value={String(proximas.length)} />
      </div>

      <Group title="Atrasadas" items={atrasadas} cur={cur} danger />
      <Group title="Vencem em breve" items={proximas} cur={cur} />
      <Group title="A pagar" items={depois} cur={cur} />

      {rows.length === 0 && (
        <p className="mt-8 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted shadow-[var(--shadow-card)]">
          Nada pendente. Ao lançar uma despesa no Orçamento, marque &quot;ainda não paguei&quot;
          para acompanhá-la aqui.
        </p>
      )}
    </>
  );
}

function Group({
  title,
  items,
  cur,
  danger,
}: {
  title: string;
  items: { r: Row; d: string }[];
  cur: string;
  danger?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <p
        className={`flex items-center gap-2 font-display text-sm font-bold ${danger ? "text-danger" : "text-ink"}`}
      >
        {danger ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
        {title}
      </p>
      <ul className="mt-3 divide-y divide-border">
        {items.map(({ r, d }) => (
          <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5 text-sm">
            <span className="w-14 shrink-0 tabular-nums text-xs text-muted">{formatDate(d)}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-ink">{r.name}</span>
            <span className="tabular-nums text-ink">{formatCurrency(Number(r.amount), cur)}</span>
            <PendingConfirm id={r.id} path="/app/orcamento" kind={r.kind} />
          </li>
        ))}
      </ul>
    </div>
  );
}
