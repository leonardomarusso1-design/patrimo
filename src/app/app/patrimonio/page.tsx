import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EntityManager, type Field } from "@/components/app/EntityManager";
import { Donut } from "@/components/app/Donut";
import { StatTile, Progress } from "@/components/ui/Misc";
import { FipeConsulta } from "@/components/app/FipeConsulta";
import { formatCurrency, clamp } from "@/lib/utils";
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
  const debtById = new Map(debts.map((d) => [d.id, d]));

  // valor de mercado de um bem (avaliação, se houver)
  const marketValue = (it: Item) => Number(it.appraised_value ?? it.value);
  // saldo da dívida vinculada
  const linkedBalance = (it: Item) =>
    it.linked_debt_id
      ? Number(debtById.get(it.linked_debt_id)?.remaining_amount ?? 0)
      : 0;
  // patrimônio que o bem representa de fato (avaliação − saldo do financiamento)
  const itemEquity = (it: Item) => marketValue(it) - linkedBalance(it);

  const linkedDebtIds = new Set(
    items.map((i) => i.linked_debt_id).filter(Boolean) as string[],
  );

  const grossAssets = items.reduce((s, it) => s + marketValue(it), 0);
  const equityAssets = items.reduce((s, it) => s + itemEquity(it), 0);
  // dívidas que NÃO estão amarradas a um bem (senão contariam duas vezes)
  const freeDebts = debts.filter((d) => !linkedDebtIds.has(d.id));
  const freeDebtsTotal = freeDebts.reduce((s, d) => s + Number(d.remaining_amount), 0);
  const allDebtsTotal = debts.reduce((s, d) => s + Number(d.remaining_amount), 0);
  const netWorth = equityAssets - freeDebtsTotal;

  const compMap = new Map<string, number>();
  for (const it of items) {
    const v = itemEquity(it);
    if (v <= 0) continue;
    compMap.set(KIND_LABEL[it.kind], (compMap.get(KIND_LABEL[it.kind]) ?? 0) + v);
  }
  const composition = [...compMap.entries()].map(([name, value]) => ({ name, value }));

  const itemFields: Field[] = [
    {
      name: "kind",
      label: "Tipo",
      type: "select",
      required: true,
      options: Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label })),
    },
    { name: "name", label: "Nome", type: "text", required: true, placeholder: "Casa, BYD Dolphin, Conta corrente…" },
    { name: "value", label: "Valor de compra / referência (R$)", type: "money", required: true },
    { name: "appraised_value", label: "Valor de mercado hoje (R$) — opcional", type: "money" },
    ...(debts.length
      ? [
          {
            name: "linked_debt_id",
            label: "Está financiado? (deixe em branco se não)",
            type: "select",
            options: debts.map((d) => ({
              value: d.id,
              label: `${d.name} — saldo ${formatCurrency(Number(d.remaining_amount), cur)}`,
            })),
          } as Field,
        ]
      : []),
    { name: "fipe_code", label: "Código FIPE (opcional, veículos)", type: "text", placeholder: "095010-6" },
  ];

  return (
    <>
      <PageHeader
        title="Patrimônio"
        subtitle="Tudo que você tem, menos tudo que você deve. Bens financiados contam só o que já foi quitado."
        action={<FipeConsulta />}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile label="Patrimônio líquido" value={formatCurrency(netWorth, cur)} tone="ink" />
        <StatTile
          label="Bens (valor de mercado)"
          value={formatCurrency(grossAssets, cur)}
          hint={`líquido nos bens: ${formatCurrency(equityAssets, cur)}`}
        />
        <StatTile label="Dívidas" value={formatCurrency(allDebtsTotal, cur)} />
        <StatTile
          label="Itens"
          value={`${items.length + debts.length}`}
          hint={`${items.length} bens · ${debts.length} dívidas`}
        />
      </div>

      {composition.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h3 className="mb-4 font-display text-base font-bold text-ink">
            Composição do patrimônio (líquido)
          </h3>
          <Donut data={composition} currency={cur} centerLabel="líquido" />
        </div>
      )}

      <div className="mt-6 space-y-6">
        {debts.length === 0 && (
          <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted">
            Comprou algo financiado? Cadastre o financiamento em <strong>Dívidas</strong>{" "}
            (abaixo) primeiro, depois edite o bem para vincular e ver quanto já está quitado.
          </p>
        )}
        <EntityManager
          table="patrimony_items"
          path="/app/patrimonio"
          title="Bens e liquidez"
          addLabel="Adicionar item"
          fields={itemFields}
          rows={items.map((r) => {
            const debt = r.linked_debt_id ? debtById.get(r.linked_debt_id) : undefined;
            const mv = marketValue(r);
            const bal = linkedBalance(r);
            const paidPct =
              debt && Number(debt.total_amount) > 0
                ? clamp(
                    ((Number(debt.total_amount) - Number(debt.remaining_amount)) /
                      Number(debt.total_amount)) *
                      100,
                    0,
                    100,
                  )
                : 0;
            return {
              id: r.id,
              raw: {
                kind: r.kind,
                name: r.name,
                value: Number(r.value),
                appraised_value: r.appraised_value,
                linked_debt_id: r.linked_debt_id,
                fipe_code: r.fipe_code,
              },
              node: (
                <>
                  <span className="flex flex-col gap-1">
                    <span className="font-medium text-ink">
                      {r.name}
                      <span className="ml-2 text-xs text-muted">{KIND_LABEL[r.kind]}</span>
                    </span>
                    {debt && (
                      <span className="text-xs text-muted">
                        financiado ({debt.name}) · saldo {formatCurrency(bal, cur)} ·{" "}
                        {Math.round(paidPct)}% quitado
                      </span>
                    )}
                    {debt && (
                      <span className="mt-0.5 block max-w-[220px]">
                        <Progress value={paidPct} tone="success" />
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums text-ink sm:text-right">
                    {debt ? (
                      <>
                        <span className="block">{formatCurrency(mv - bal, cur)}</span>
                        <span className="text-xs font-normal text-muted line-through">
                          {formatCurrency(mv, cur)}
                        </span>
                      </>
                    ) : (
                      formatCurrency(mv, cur)
                    )}
                  </span>
                </>
              ),
            };
          })}
          emptyTitle="Nenhum bem registrado"
          emptyDescription="Imóveis, veículos, saldo em conta. Financiou? Vincule à dívida no formulário."
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
                  {linkedDebtIds.has(r.id) && (
                    <span className="ml-2 text-xs text-brand-700">vinculada a um bem</span>
                  )}
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
