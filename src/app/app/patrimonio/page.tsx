import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { StatTile } from "@/components/ui/Misc";
import { formatCurrency } from "@/lib/utils";
import type { Tables } from "@/types/database";

export const metadata = { title: "Patrimônio" };

type Item = Tables<"patrimony_items">;
type Debt = Tables<"debts">;

const KIND_LABEL: Record<string, string> = {
  liquidez: "Liquidez",
  investimento: "Investimentos",
  imovel: "Imóvel",
  veiculo: "Veículo",
  outro_bem: "Outro bem",
};

const ITEM_FIELDS: Field[] = [
  {
    name: "kind",
    label: "Tipo",
    type: "select",
    required: true,
    options: Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label })),
  },
  { name: "name", label: "Nome", type: "text", required: true, placeholder: "Apto Centro, BYD Dolphin, Conta corrente…" },
  { name: "value", label: "Valor estimado (R$)", type: "money", required: true },
  { name: "fipe_code", label: "Código FIPE (opcional, para veículos)", type: "text", placeholder: "095010-6" },
];

const DEBT_FIELDS: Field[] = [
  { name: "name", label: "Dívida", type: "text", required: true, placeholder: "Financiamento do carro…" },
  { name: "total_amount", label: "Valor total (R$)", type: "money", required: true },
  { name: "remaining_amount", label: "Saldo devedor (R$)", type: "money", required: true },
  { name: "monthly_interest", label: "Juros ao mês (%) — opcional", type: "number", step: "0.01" },
  { name: "monthly_payment", label: "Parcela mensal (R$) — opcional", type: "money" },
  { name: "due_day", label: "Dia de vencimento — opcional", type: "day" },
];

export default async function PatrimonioPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const cur = profile.display_currency;

  const [{ data: itemsData }, { data: debtsData }] = await Promise.all([
    supabase.from("patrimony_items").select("*").eq("user_id", user.id).order("value", { ascending: false }),
    supabase.from("debts").select("*").eq("user_id", user.id).order("remaining_amount", { ascending: false }),
  ]);

  const items = (itemsData ?? []) as Item[];
  const debts = (debtsData ?? []) as Debt[];
  const assetsTotal = items.reduce((s, r) => s + Number(r.value), 0);
  const debtsTotal = debts.reduce((s, r) => s + Number(r.remaining_amount), 0);
  const netWorth = assetsTotal - debtsTotal;

  const compMap = new Map<string, number>();
  for (const it of items) {
    compMap.set(KIND_LABEL[it.kind], (compMap.get(KIND_LABEL[it.kind]) ?? 0) + Number(it.value));
  }
  const composition = [...compMap.entries()].map(([name, value]) => ({ name, value }));

  return (
    <>
      <PageHeader title="Patrimônio" subtitle="Tudo que você tem, menos tudo que você deve." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Patrimônio líquido" value={formatCurrency(netWorth, cur)} tone="ink" />
        <StatTile label="Bens e liquidez" value={formatCurrency(assetsTotal, cur)} />
        <StatTile label="Dívidas" value={formatCurrency(debtsTotal, cur)} />
        <StatTile
          label="Itens"
          value={`${items.length + debts.length}`}
          hint={`${items.length} bens · ${debts.length} dívidas`}
        />
      </div>

      {composition.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Composição do patrimônio</h3>
          <Donut data={composition} currency={cur} centerLabel="em bens" />
        </div>
      )}

      <div className="mt-6 space-y-6">
        <EntityManager
          table="patrimony_items"
          path="/app/patrimonio"
          title="Bens e liquidez"
          addLabel="Adicionar item"
          fields={ITEM_FIELDS}
          rows={items.map((r) => ({
            id: r.id,
            raw: {
              kind: r.kind,
              name: r.name,
              value: Number(r.value),
              fipe_code: r.fipe_code,
            },
            node: (
              <>
                <span className="font-medium text-ink">
                  {r.name}
                  <span className="ml-2 text-xs text-muted">{KIND_LABEL[r.kind]}</span>
                </span>
                <span className="tabular-nums text-ink sm:text-right">
                  {formatCurrency(Number(r.value), cur)}
                </span>
              </>
            ),
          }))}
          emptyTitle="Nenhum bem registrado"
          emptyDescription="Imóveis, veículos, saldo em conta, investimentos fora da carteira."
        />

        <EntityManager
          table="debts"
          path="/app/patrimonio"
          title="Dívidas"
          addLabel="Adicionar dívida"
          fields={DEBT_FIELDS}
          rows={debts.map((r) => ({
            id: r.id,
            raw: {
              name: r.name,
              total_amount: Number(r.total_amount),
              remaining_amount: Number(r.remaining_amount),
              monthly_interest: r.monthly_interest,
              monthly_payment: r.monthly_payment,
              due_day: r.due_day,
            },
            node: (
              <>
                <span className="font-medium text-ink">
                  {r.name}
                  {r.monthly_payment && (
                    <span className="ml-2 text-xs text-muted">
                      {formatCurrency(Number(r.monthly_payment), cur)}/mês
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-danger sm:text-right">
                  {formatCurrency(Number(r.remaining_amount), cur)}
                </span>
              </>
            ),
          }))}
          emptyTitle="Nenhuma dívida registrada"
          emptyDescription="Financiamentos, empréstimos, cartão parcelado, consignado."
        />
      </div>
    </>
  );
}
