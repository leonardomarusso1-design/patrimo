export type FlowItem = {
  date: string; // yyyy-mm-dd
  name: string;
  amount: number; // + entrada, − saída
  kind: "income" | "expense_fixed" | "expense_variable";
  status: "realizado" | "previsto";
  source: "lancamento" | "recorrencia";
};

type Entry = {
  name: string;
  amount: number;
  kind: FlowItem["kind"];
  entry_date: string | null;
  reference_month: string;
  pending: boolean;
  recurring: boolean;
  due_day: number | null;
};

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const signed = (e: { kind: FlowItem["kind"]; amount: number }) =>
  e.kind === "income" ? Number(e.amount) : -Number(e.amount);

/**
 * Monta o fluxo de caixa entre hoje e `days` à frente.
 * Realizado = lançamentos confirmados dos últimos `days`.
 * Previsto  = lançamentos previstos (pending) + próximas ocorrências das
 *             despesas/receitas recorrentes, dentro da janela futura.
 */
export function buildCashflow(entries: Entry[], days: number, today = new Date()): FlowItem[] {
  const t0 = new Date(today);
  t0.setHours(0, 0, 0, 0);
  const past = new Date(t0);
  past.setDate(past.getDate() - days);
  const future = new Date(t0);
  future.setDate(future.getDate() + days);
  const todayStr = iso(t0);

  const out: FlowItem[] = [];

  for (const e of entries) {
    const d = e.entry_date ?? e.reference_month;
    if (!e.pending && d >= iso(past) && d <= todayStr) {
      out.push({ date: d, name: e.name, amount: signed(e), kind: e.kind, status: "realizado", source: "lancamento" });
    }
    if (e.pending && d >= todayStr && d <= iso(future)) {
      out.push({ date: d, name: e.name, amount: signed(e), kind: e.kind, status: "previsto", source: "lancamento" });
    }
  }

  // projeção das recorrências: pega os templates mais recentes por (kind,name)
  const templates = new Map<string, Entry>();
  for (const e of entries) {
    if (!e.recurring) continue;
    const key = `${e.kind}::${e.name.toLowerCase()}`;
    const cur = templates.get(key);
    if (!cur || e.reference_month > cur.reference_month) templates.set(key, e);
  }
  const alreadyByMonth = new Set(
    entries.map((e) => `${e.kind}::${e.name.toLowerCase()}::${e.reference_month.slice(0, 7)}`),
  );

  for (const tpl of templates.values()) {
    const day = Math.min(Math.max(tpl.due_day ?? 1, 1), 28);
    const cursor = new Date(t0.getFullYear(), t0.getMonth(), 1);
    while (cursor <= future) {
      const ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
      const occ = new Date(cursor.getFullYear(), cursor.getMonth(), day);
      const occStr = iso(occ);
      if (
        occStr > todayStr &&
        occStr <= iso(future) &&
        !alreadyByMonth.has(`${tpl.kind}::${tpl.name.toLowerCase()}::${ym}`)
      ) {
        out.push({
          date: occStr,
          name: tpl.name,
          amount: signed(tpl),
          kind: tpl.kind,
          status: "previsto",
          source: "recorrencia",
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}
