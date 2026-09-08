import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";
import { TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

const PROOF = [
  { icon: TrendingUp, text: "Entradas e saídas em tempo real" },
  { icon: ShieldCheck, text: "Dados protegidos, sessão em cookie httpOnly" },
  { icon: Sparkles, text: "IA que lê o mercado e sugere aportes" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="brand-panel relative hidden flex-col justify-between overflow-hidden p-10 text-[#eaf5ee] lg:flex">
        <div
          aria-hidden
          className="absolute -right-40 top-24 h-[26rem] w-[26rem] rounded-full border border-white/15"
        />
        <div
          aria-hidden
          className="absolute -right-24 top-40 h-72 w-72 rounded-full border border-white/10"
        />
        <Link href="/" className="relative">
          <span className="font-display text-xl font-extrabold">
            Ord<span className="text-gold">re</span>
          </span>
        </Link>
        <div className="relative">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            Suas finanças, finalmente no controle.
          </h2>
          <p className="mt-4 max-w-sm text-[#eaf5ee]/75">
            O Ordre reúne tudo o que você precisa para entender, planejar e fazer
            seu dinheiro render — num só lugar.
          </p>

          <div className="mt-8 max-w-xs rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[0.7rem] font-semibold uppercase tracking-widest text-[#eaf5ee]/60">
              Patrimônio líquido
            </p>
            <p className="mt-1 font-display text-2xl font-extrabold">R$ 148.320,00</p>
            <div className="mt-3 flex items-end gap-1.5">
              {[38, 52, 44, 61, 70, 58, 82].map((h, i) => (
                <span
                  key={i}
                  className="w-full rounded-sm bg-white/25"
                  style={{ height: `${h * 0.5}px` }}
                />
              ))}
            </div>
          </div>

          <ul className="mt-8 space-y-3">
            {PROOF.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-[#eaf5ee]/85">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                  <p.icon className="h-3.5 w-3.5" />
                </span>
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-[#eaf5ee]/40">
          © {new Date().getFullYear()} Ordre · Leonardo Marusso
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Wordmark />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
