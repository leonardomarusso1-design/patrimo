import { Wallet, CreditCard } from "lucide-react";
import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const metadata = { title: "Contas e cartões" };

type Acc = Tables<"accounts">;
type Card = Tables<"cards">;

const TYPE_LABEL: Record<string, string> = {
  corrente: "Conta corrente",
  poupanca: "Poupança",
  carteira: "Carteira / dinheiro",
  investimento: "Investimento",
  outro: "Outro",
};

const ACC_FIELDS: Field[] = [
  { name: "name", label: "Nome", type: "text", required: true, placeholder: "Nubank, Itaú, Carteira…" },
  {
    name: "type",
    label: "Tipo",
    type: "select",
    required: true,
    defaultValue: "corrente",
    options: Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "opening_balance", label: "Saldo inicial (R$)", type: "number", step: "0.01" },
];

const CARD_FIELDS: Field[] = [
  { name: "name", label: "Nome", type: "text", required: true, placeholder: "Nubank Ultravioleta…" },
  { name: "brand", label: "Bandeira (opcional)", type: "text", placeholder: "Visa, Master…" },
  { name: "limit_amount", label: "Limite (R$)", type: "money" },
  { name: "closing_day", label: "Dia de fechamento", type: "day" },
  { name: "due_day", label: "Dia de vencimento", type: "day" },
];

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default async function ContasPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const [{ data: accData }, { data: cardData }, { data: entries }] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", user.id).eq("archived", false).order("created_at"),
    supabase.from("cards").select("*").eq("user_id", user.id).eq("archived", false).order("created_at"),
    supabase
      .from("budget_entries")
      .select("kind, amount, account_id, card_id, pending, reference_month")
      .eq("user_id", user.id),
  ]);

  const allAccounts = (accData ?? []) as Acc[];
  const allCards = (cardData ?? []) as Card[];
  const accounts = allAccounts.filter((a) => a.source === "manual");
  const cards = allCards.filter((c) => c.source === "manual");
  const syncedAccounts = allAccounts.filter((a) => a.source !== "manual");
  const syncedCards = allCards.filter((c) => c.source !== "manual");
  const rows = entries ?? [];
  const refMonth = monthKey();

  // saldo corrente por conta = saldo inicial + entradas − saídas (não previstas)
  const balanceOf = (id: string) => {
    const acc = allAccounts.find((a) => a.id === id);
    let b = Number(acc?.opening_balance ?? 0);
    for (const e of rows) {
      if (e.account_id !== id || e.pending) continue;
      b += e.kind === "income" ? Number(e.amount) : -Number(e.amount);
    }
    return b;
  };
  // fatura do mês por cartão = todas as compras do cartão no mês (pagas ou não —
  // a fatura existe independente de você já ter quitado o boleto)
  const faturaOf = (id: string) =>
    rows
      .filter((e) => e.card_id === id && e.reference_month === refMonth && e.kind !== "income")
      .reduce((s, e) => s + Number(e.amount), 0);

  const totalBalance = allAccounts.reduce((s, a) => s + balanceOf(a.id), 0);
  const totalFatura = allCards.reduce((s, c) => s + faturaOf(c.id), 0);

  return (
    <>
      <PageHeader
        title="Contas e cartões"
        subtitle="Onde seu dinheiro está. Cadastre à mão ou, em breve, conecte o banco via Open Finance para preencher sozinho."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Saldo somado das contas" value={formatCurrency(totalBalance, cur)} tone="ink" />
        <StatTile label="Fatura aberta (mês)" value={formatCurrency(totalFatura, cur)} />
      </div>

      {(syncedAccounts.length > 0 || syncedCards.length > 0) && (
        <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Sincronizado via Open Finance · não editável aqui
          </p>
          <ul className="mt-2 divide-y divide-border text-sm">
            {[...syncedAccounts, ...syncedCards].map((x) => (
              <li key={x.id} className="flex justify-between py-2">
                <span className="text-ink">{x.name}</span>
                <span className="tabular-nums text-muted">
                  {"opening_balance" in x
                    ? formatCurrency(balanceOf(x.id), cur)
                    : formatCurrency(faturaOf(x.id), cur)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink">
          <Wallet className="h-4 w-4" /> Contas
        </h2>
        <EntityManager
          table="accounts"
          path="/app/contas"
          title=""
          addLabel="Nova conta"
          fields={ACC_FIELDS}
          flat
          rows={accounts.map((a) => ({
            id: a.id,
            raw: { name: a.name, type: a.type, opening_balance: Number(a.opening_balance) },
            node: (
              <>
                <span className="font-medium text-ink">
                  {a.name}
                  <span className="ml-2 text-xs text-muted">{TYPE_LABEL[a.type] ?? a.type}</span>
                </span>
                <span className="tabular-nums text-ink sm:text-right">
                  {formatCurrency(balanceOf(a.id), cur)}
                </span>
              </>
            ),
          }))}
          emptyTitle="Nenhuma conta ainda"
          emptyDescription="Adicione suas contas (Nubank, Itaú…) com o saldo de hoje."
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-ink">
          <CreditCard className="h-4 w-4" /> Cartões de crédito
        </h2>
        <EntityManager
          table="cards"
          path="/app/contas"
          title=""
          addLabel="Novo cartão"
          fields={CARD_FIELDS}
          flat
          rows={cards.map((c) => {
            const fatura = faturaOf(c.id);
            const lim = Number(c.limit_amount);
            return {
              id: c.id,
              raw: {
                name: c.name,
                brand: c.brand,
                limit_amount: lim,
                closing_day: c.closing_day,
                due_day: c.due_day,
              },
              node: (
                <>
                  <span className="font-medium text-ink">
                    {c.name}
                    <span className="ml-2 text-xs text-muted">
                      {c.brand ? `${c.brand} · ` : ""}
                      {c.due_day ? `vence dia ${c.due_day}` : ""}
                    </span>
                  </span>
                  <span className="tabular-nums text-ink sm:text-right">
                    {formatCurrency(fatura, cur)}
                    {lim > 0 && (
                      <span className="ml-2 text-xs text-muted">
                        de {formatCurrency(lim, cur)}
                      </span>
                    )}
                  </span>
                </>
              ),
            };
          })}
          emptyTitle="Nenhum cartão ainda"
          emptyDescription="Cadastre o cartão e ligue as despesas variáveis a ele no Orçamento."
        />
      </div>
    </>
  );
}
