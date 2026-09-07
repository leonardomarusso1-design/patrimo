import type { Indicators } from "@/lib/market";

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="shrink-0 rounded-xl border border-border bg-card px-3.5 py-2 shadow-[var(--shadow-card)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 font-display text-sm font-bold text-ink tabular-nums">{value}</p>
    </div>
  );
}

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const brl = (n: number, d = 2) =>
  `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d })}`;

/** Faixa de indicadores de mercado (BCB + câmbio + cripto). Somente leitura. */
export function IndicadoresPanel({ data }: { data: Indicators }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <Chip label="CDI a.a." value={pct(data.cdi)} />
      <Chip label="Selic" value={pct(data.selic)} />
      <Chip label="IPCA 12m" value={pct(data.ipca12m)} />
      <Chip label="Dólar" value={brl(data.usd)} />
      <Chip label="Euro" value={brl(data.eur)} />
      {data.btc > 0 && <Chip label="Bitcoin" value={brl(data.btc, 0)} />}
    </div>
  );
}
