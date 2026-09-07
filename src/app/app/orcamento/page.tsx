import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const metadata = { title: "Orçamento" };

type Entry = Tables<"budget_entries">;

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function shift(key: string, delta: number) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}
function label(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
}

const CAT_FIELD: Field = {
  name: "category",
  label: "Categoria",
  type: "text",
  placeholder: "Casa, Carro, Lazer…",
};

function fieldsFor(kind: string, refMonth: string): Field[] {
  return [
    { name: "name", label: "Nome", type: "text", required: true, placeholder: kind === "income" ? "Salário, freela…" : "Aluguel, mercado…" },
    ...(kind === "income" ? [] : [CAT_FIELD]),
    { name: "amount", label: "Valor (R$)", type: "money", required: true },
    { name: "due_day", label: "Dia de vencimento (opcional)", type: "day" },
    { name: "reference_month", label: "Mês de referência", type: "text", defaultValue: refMonth, required: true },
  ];
}

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const current = /^\d{4}-\d{2}$/.test(m ?? "") ? m! : monthKey();
  const refMonth = `${current}-01`;

  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const { data } = await supabase
    .from("budget_entries")
    .select("*")
    .eq("user_id", user.id)
    .eq("reference_month", refMonth)
    .order("due_day", { ascending: true, nullsFirst: false });

  const rows = (data ?? []) as Entry[];
  const cur = profile.display_currency;
  const by = (k: Entry["kind"]) => rows.filter((r) => r.kind === k);
  const sum = (list: Entry[]) => list.reduce((s, r) => s + Number(r.amount), 0);

  const income = sum(by("income"));
  const fixed = sum(by("expense_fixed"));
  const variable = sum(by("expense_variable"));
  const balance = income - fixed - variable;

  const byCategory = new Map<string, number>();
  for (const r of rows) {
    if (r.kind === "income") continue;
    const key = r.category?.trim() || "Sem categoria";
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(r.amount));
  }
  const donut = [...byCategory.entries()].map(([name, value]) => ({ name, value }));

  const path = `/app/orcamento?m=${current}`;

  const columns = (withCat: boolean) => [
    {
      header: "Nome",
      cell: (r: Entry) => (
        <span className="font-medium text-ink">
          {r.name}
          {withCat && r.category && (
            <span className="ml-2 text-xs text-muted">· {r.category}</span>
          )}
          {r.due_day && <span className="ml-2 text-xs text-muted">venc. dia {r.due_day}</span>}
        </span>
      ),
    },
    {
      header: "Valor",
      cell: (r: Entry) => (
        <span className="tabular-nums text-ink">{formatCurrency(Number(r.amount), cur)}</span>
      ),
      className: "sm:text-right",
    },
  ];

  return (
    <>
      <PageHeader
        title="Orçamento"
        subtitle="Receita, despesa fixa e variável do mês."
        action={
          <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1 py-1">
            <Link href={`/app/orcamento?m=${shift(current, -1)}`} className="rounded-full p-1.5 hover:bg-ink/[0.05]">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="px-2 text-sm font-medium capitalize">{label(current)}</span>
            <Link href={`/app/orcamento?m=${shift(current, 1)}`} className="rounded-full p-1.5 hover:bg-ink/[0.05]">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Receita" value={formatCurrency(income, cur)} />
        <StatTile label="Despesa fixa" value={formatCurrency(fixed, cur)} />
        <StatTile label="Despesa variável" value={formatCurrency(variable, cur)} />
        <StatTile
          label="Saldo do mês"
          value={formatCurrency(balance, cur)}
          tone="ink"
          hint={balance >= 0 ? "Sobrou — direcione para metas" : "No vermelho — corte o variável"}
        />
      </div>

      {donut.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Despesas por categoria</h3>
          <Donut data={donut} currency={cur} centerLabel="no mês" />
        </div>
      )}

      <div className="mt-6 space-y-6">
        <EntityManager<Entry>
          table="budget_entries"
          path={path}
          title="Receita"
          addLabel="Adicionar receita"
          fields={fieldsFor("income", refMonth)}
          hidden={{ kind: "income" }}
          rows={by("income")}
          columns={columns(false)}
          emptyTitle="Nenhuma receita neste mês"
          emptyDescription="Salário, freelas, aluguéis recebidos, rendimentos."
        />
        <EntityManager<Entry>
          table="budget_entries"
          path={path}
          title="Despesa fixa"
          addLabel="Adicionar despesa fixa"
          fields={fieldsFor("expense_fixed", refMonth)}
          hidden={{ kind: "expense_fixed" }}
          rows={by("expense_fixed")}
          columns={columns(true)}
          emptyTitle="Nenhuma despesa fixa"
          emptyDescription="Aluguel, plano de saúde, escola, assinaturas."
        />
        <EntityManager<Entry>
          table="budget_entries"
          path={path}
          title="Despesa variável"
          addLabel="Adicionar despesa variável"
          fields={fieldsFor("expense_variable", refMonth)}
          hidden={{ kind: "expense_variable" }}
          rows={by("expense_variable")}
          columns={columns(true)}
          emptyTitle="Nenhuma despesa variável"
          emptyDescription="Mercado, restaurante, transporte, compras."
        />
      </div>
    </>
  );
}
