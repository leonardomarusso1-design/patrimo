import {
  LayoutGrid,
  ArrowLeftRight,
  ShieldCheck,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const NAV: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutGrid, label: "Início", active: true },
  { icon: ArrowLeftRight, label: "Orçamento" },
  { icon: ShieldCheck, label: "Reserva" },
  { icon: Target, label: "Metas" },
  { icon: TrendingUp, label: "Investimentos" },
];

const DONUT = [
  { pct: 41, color: "#C98A00" },
  { pct: 32, color: "#0B7A55" },
  { pct: 19, color: "#16A06C" },
  { pct: 8, color: "#4FBF8B" },
];

function MiniDonut() {
  const C = 2 * Math.PI * 34;
  const segments = DONUT.reduce<{ len: number; offset: number; color: string }[]>(
    (acc, s) => {
      const len = (s.pct / 100) * C;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
      acc.push({ len, offset, color: s.color });
      return acc;
    },
    [],
  );
  return (
    <svg viewBox="0 0 84 84" className="h-20 w-20 -rotate-90">
      {segments.map((s, i) => (
        <circle
          key={i}
          cx="42"
          cy="42"
          r="34"
          fill="none"
          stroke={s.color}
          strokeWidth="14"
          strokeDasharray={`${s.len} ${C - s.len}`}
          strokeDashoffset={-s.offset}
        />
      ))}
    </svg>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? "brand-panel rounded-xl p-3 text-[#eaf5ee]"
          : "rounded-xl border border-border bg-card p-3"
      }
    >
      <p
        className={`text-[0.6rem] font-semibold uppercase tracking-wide ${accent ? "text-[#eaf5ee]/70" : "text-muted"}`}
      >
        {label}
      </p>
      <p className={`mt-1 font-display text-sm font-extrabold ${accent ? "" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}

/** Mock do painel do Ordre — sem screenshot, é DOM estilizado com os tokens reais. */
export function AppPreview() {
  return (
    <div>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_70px_-25px_rgba(20,33,28,0.3)]">
        {/* barra do navegador */}
        <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          <span className="ml-3 rounded-md bg-card px-3 py-1 text-[0.65rem] text-muted">
            app.ordre.app
          </span>
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="hidden w-40 shrink-0 flex-col gap-1 border-r border-border p-3 sm:flex">
            <p className="px-2 py-1 font-display text-sm font-extrabold text-ink">
              Patri<span className="text-brand">mo</span>
            </p>
            {NAV.map((item) => (
              <span
                key={item.label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${
                  item.active ? "bg-brand-50 font-medium text-brand-700" : "text-muted"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </span>
            ))}
          </div>

          {/* conteúdo */}
          <div className="flex-1 p-4 sm:p-5">
            <p className="text-[0.65rem] text-muted">Olá, você</p>
            <p className="font-display text-lg font-extrabold text-ink">Seu dinheiro hoje</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Tile label="Saldo do mês" value="R$ 3.240" accent />
              <Tile label="Patrimônio líquido" value="R$ 148.320" />
              <Tile label="Carteira" value="R$ 44.200" />
              <Tile label="Metas" value="R$ 12.500" />
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                <MiniDonut />
                <div className="space-y-1 text-[0.65rem]">
                  <p className="font-display font-bold text-ink">Despesas por categoria</p>
                  {["Casa 41%", "Cartão 32%", "Família 19%"].map((t) => (
                    <p key={t} className="text-muted">
                      {t}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-3">
                <p className="text-[0.65rem] font-bold text-ink">Reserva de emergência</p>
                <p className="mt-1 font-display text-sm font-extrabold text-ink">
                  R$ 70.000 <span className="text-[0.65rem] font-medium text-muted">de R$ 90.000</span>
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/[0.08]">
                  <div className="h-full w-[78%] rounded-full bg-brand" />
                </div>
                <p className="mt-1 text-[0.6rem] text-muted">78% protegido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
