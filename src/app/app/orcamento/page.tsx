import Link from "next/link";
import { Clock, Repeat } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { PendingConfirm } from "@/components/app/PendingConfirm";
import { RecurringBanner } from "@/components/app/RecurringBanner";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { BudgetTabs } from "@/components/app/BudgetTabs";
import { CategoryPill } from "@/components/app/CategoryPill";
import { MonthPicker } from "@/components/app/MonthPicker";
import { InvestCard } from "@/components/app/InvestCard";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const metadata = { title: "Orçamento" };

type Entry = Tables<"budget_entries">;

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  const s = new Date(y, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const isoDate = (s?: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s ?? "") ? s! : null);

const CAT_FIELD: Field = {
  name: "category",
  label: "Categoria",
  type: "text",
  placeholder: "Casa, Carro, Lazer…",
};

type Opt = { value: string; label: string };

function fieldsFor(
  kind: string,
  refMonth: string,
  entryDate: string,
  accOpts: Opt[],
  cardOpts: Opt[],
): Field[] {
  const isIncome = kind === "income";
  return [
    { name: "name", label: "Nome", type: "text", required: true, placeholder: isIncome ? "Salário, freela…" : "Aluguel, mercado…" },
    ...(isIncome ? [] : [CAT_FIELD]),
    { name: "amount", label: "Valor (R$)", type: "money", required: true },
    { name: "entry_date", label: "Data", type: "date", defaultValue: entryDate, required: true },
    ...(accOpts.length
      ? [{ name: "account_id", label: "Conta (opcional)", type: "select", options: accOpts } as Field]
      : []),
    ...(!isIncome && cardOpts.length
      ? [{ name: "card_id", label: "Cartão de crédito (opcional)", type: "select", options: cardOpts } as Field]
      : []),
    {
      name: "recurring",
      label: "Repetir todos os meses",
      type: "boolean",
      hint: isIncome
        ? "Pra renda fixa, como salário. Se o valor muda a cada mês, deixe desmarcado."
        : "Pra despesa fixa que se repete. O valor pode ser ajustado depois em cada mês.",
    },
    {
      name: "pending",
      label: isIncome ? "Ainda não recebi (previsto)" : "Ainda não paguei (previsto)",
      type: "boolean",
      hint: `Não entra no ${isIncome ? "saldo" : "total de despesas"} até você confirmar.`,
    },
    { name: "due_day", label: "Dia de vencimento (opcional)", type: "day" },
    { name: "reference_month", label: "Mês de referência", type: "text", defaultValue: refMonth, required: true },
  ];
}

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; from?: string; to?: string; new?: string }>;
}) {
  const sp = await searchParams;
  const openKind = ["income", "fixed", "variable"].includes(sp.new ?? "")
    ? sp.new!
    : null;
  const rangeFrom = isoDate(sp.from);
  const rangeTo = isoDate(sp.to);
  const isRange = !!(rangeFrom && rangeTo);

  const current = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m! : monthKey();
  const refMonth = `${current}-01`;
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultEntryDate = isRange ? todayIso : `${current}-01`;

  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);

  const [{ data: catRows }, { data: accs }, { data: crds }] = await Promise.all([
    supabase.from("budget_categories").select("name, color").eq("user_id", user.id),
    supabase.from("accounts").select("id, name").eq("user_id", user.id).eq("archived", false),
    supabase.from("cards").select("id, name").eq("user_id", user.id).eq("archived", false),
  ]);
  const catColor = new Map(
    (catRows ?? []).map((c) => [c.name.toLowerCase(), c.color]),
  );
  const accOpts = (accs ?? []).map((a) => ({ value: a.id, label: a.name }));
  const cardOpts = (crds ?? []).map((c) => ({ value: c.id, label: c.name }));

  let q = supabase.from("budget_entries").select("*").eq("user_id", user.id);
  q = isRange
    ? q.gte("entry_date", rangeFrom).lte("entry_date", rangeTo)
    : q.eq("reference_month", refMonth);
  const { data } = await q.order("entry_date", { ascending: true, nullsFirst: false });

  const rows = (data ?? []) as Entry[];
  const cur = profile.display_currency;
  const by = (k: Entry["kind"]) => rows.filter((r) => r.kind === k);
  // totais ignoram lançamentos previstos (pending); a lista mostra todos.
  const sum = (list: Entry[]) =>
    list.reduce((s, r) => (r.pending ? s : s + Number(r.amount)), 0);

  const income = sum(by("income"));
  const fixed = sum(by("expense_fixed"));
  const variable = sum(by("expense_variable"));
  const balance = income - fixed - variable;
  const pendingIncome = by("income")
    .filter((r) => r.pending)
    .reduce((s, r) => s + Number(r.amount), 0);

  const byCategory = new Map<string, number>();
  for (const r of rows) {
    if (r.kind === "income" || r.pending) continue;
    const key = r.category?.trim() || "Sem categoria";
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(r.amount));
  }
  const donut = [...byCategory.entries()].map(([name, value]) => ({ name, value }));

  // recorrentes do mês passado ainda não trazidos para este mês
  let missingRecurring = 0;
  if (!isRange) {
    const [py, pm] = current.split("-").map(Number);
    const prev = new Date(py, pm - 2, 1);
    const prevMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-01`;
    const { data: prevRec } = await supabase
      .from("budget_entries")
      .select("kind, name")
      .eq("user_id", user.id)
      .eq("reference_month", prevMonth)
      .eq("recurring", true);
    const have = new Set(rows.map((r) => `${r.kind}::${r.name.toLowerCase()}`));
    missingRecurring = (prevRec ?? []).filter(
      (t) => !have.has(`${t.kind}::${t.name.toLowerCase()}`),
    ).length;
  }

  const path = isRange
    ? `/app/orcamento?from=${rangeFrom}&to=${rangeTo}`
    : `/app/orcamento?m=${current}`;
  const periodLabel = isRange
    ? `${formatDate(rangeFrom)} – ${formatDate(rangeTo)}`
    : monthLabel(current);

  const toRows = (list: Entry[], withCat: boolean) =>
    list.map((r) => ({
      id: r.id,
      raw: {
        name: r.name,
        category: r.category,
        amount: Number(r.amount),
        entry_date: r.entry_date ?? undefined,
        account_id: r.account_id ?? undefined,
        card_id: r.card_id ?? undefined,
        recurring: r.recurring,
        pending: r.pending,
        due_day: r.due_day,
        reference_month: r.reference_month,
      },
      node: (
        <>
          <span className="flex flex-wrap items-center gap-2 font-medium text-ink">
            {r.entry_date && (
              <span className="text-xs tabular-nums text-muted">
                {r.entry_date.slice(8, 10)}/{r.entry_date.slice(5, 7)}
              </span>
            )}
            {r.pending && <Clock className="h-3.5 w-3.5 text-gold" />}
            {r.recurring && <Repeat className="h-3.5 w-3.5 text-muted" />}
            <span className={r.pending ? "text-muted" : undefined}>{r.name}</span>
            {withCat && r.category && (
              <CategoryPill name={r.category} color={catColor.get(r.category.toLowerCase())} />
            )}
            {r.pending && <PendingConfirm id={r.id} path={path} kind={r.kind} />}
          </span>
          <span
            className={`tabular-nums sm:text-right ${r.pending ? "text-muted" : "text-ink"}`}
          >
            {formatCurrency(Number(r.amount), cur)}
          </span>
        </>
      ),
    }));

  return (
    <>
      <PageHeader
        title="Orçamento"
        subtitle={isRange ? "Lançamentos do período escolhido." : "Receita, despesa fixa e variável do mês."}
        action={
          <MonthPicker
            month={current}
            label={monthLabel(current)}
            range={isRange ? { from: rangeFrom, to: rangeTo } : null}
          />
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Receita" value={formatCurrency(income, cur)} />
        <InvestCard income={income} pct={profile.invest_pct} currency={cur} />
        <StatTile label="Despesa fixa" value={formatCurrency(fixed, cur)} />
        <StatTile label="Despesa variável" value={formatCurrency(variable, cur)} />
        <StatTile
          label={isRange ? "Saldo do período" : "Saldo do mês"}
          value={formatCurrency(balance, cur)}
          tone="ink"
          hint={
            pendingIncome > 0
              ? `+ ${formatCurrency(pendingIncome, cur)} previsto (não contado)`
              : balance >= 0
                ? "Sobrou — direcione para metas"
                : "No vermelho — corte o variável"
          }
        />
      </div>

      {!isRange && (
        <RecurringBanner
          count={missingRecurring}
          refMonth={refMonth}
          monthLabel={monthLabel(current)}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <BudgetTabs
            referenceMonth={refMonth}
            monthLabel={periodLabel}
            initialTab={openKind ?? undefined}
            tabs={[
              {
                key: "income",
                label: "Receita",
                total: formatCurrency(income, cur),
                node: (
                  <EntityManager
                    table="budget_entries"
                    path={path}
                    title="Receita"
                    addLabel="Adicionar receita"
                    fields={fieldsFor("income", refMonth, defaultEntryDate, accOpts, cardOpts)}
                    hidden={{ kind: "income" }}
                    autoOpen={openKind === "income"}
                    flat
                    filterable
                    rows={toRows(by("income"), false)}
                    emptyTitle="Nenhuma receita no período"
                    emptyDescription="Salário, freelas, aluguéis recebidos, rendimentos."
                  />
                ),
              },
              {
                key: "fixed",
                label: "Despesa fixa",
                total: formatCurrency(fixed, cur),
                node: (
                  <EntityManager
                    table="budget_entries"
                    path={path}
                    title="Despesa fixa"
                    addLabel="Adicionar despesa fixa"
                    fields={fieldsFor("expense_fixed", refMonth, defaultEntryDate, accOpts, cardOpts)}
                    hidden={{ kind: "expense_fixed" }}
                    autoOpen={openKind === "fixed"}
                    flat
                    filterable
                    rows={toRows(by("expense_fixed"), true)}
                    emptyTitle="Nenhuma despesa fixa no período"
                    emptyDescription="Aluguel, plano de saúde, escola, assinaturas."
                  />
                ),
              },
              {
                key: "variable",
                label: "Despesa variável",
                total: formatCurrency(variable, cur),
                node: (
                  <EntityManager
                    table="budget_entries"
                    path={path}
                    title="Despesa variável"
                    addLabel="Adicionar despesa variável"
                    fields={fieldsFor("expense_variable", refMonth, defaultEntryDate, accOpts, cardOpts)}
                    hidden={{ kind: "expense_variable" }}
                    autoOpen={openKind === "variable"}
                    flat
                    filterable
                    rows={toRows(by("expense_variable"), true)}
                    emptyTitle="Nenhuma despesa variável no período"
                    emptyDescription="Mercado, restaurante, transporte, compras."
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Despesas por categoria</h3>
            <Link href="/app/categorias" className="text-xs font-medium text-accent-dim hover:underline">
              Gerenciar categorias
            </Link>
          </div>
          {donut.length > 0 ? (
            <Donut data={donut} currency={cur} centerLabel={isRange ? "no período" : "no mês"} />
          ) : (
            <p className="text-sm text-muted">
              Adicione despesas com categoria para ver o gráfico.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
