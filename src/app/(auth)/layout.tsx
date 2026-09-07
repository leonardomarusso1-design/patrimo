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
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-[#f7f5f1] lg:flex">
        <div
          aria-hidden
          className="absolute -right-24 top-1/3 h-96 w-96 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,77,109,0.35) 0%, rgba(139,92,246,0.12) 55%, transparent 70%)",
          }}
        />
        <Link href="/" className="relative">
          <span className="font-display text-xl font-extrabold">
            Patri<span className="text-accent">mo</span>
          </span>
        </Link>
        <div className="relative">
          <h2 className="max-w-sm text-3xl font-extrabold leading-tight">
            Suas finanças, finalmente no controle.
          </h2>
          <p className="mt-4 max-w-sm text-[#f7f5f1]/70">
            O dinheiro inteiro — orçamento a patrimônio — num lugar só.
          </p>
          <ul className="mt-8 space-y-3">
            {PROOF.map((p) => (
              <li key={p.text} className="flex items-center gap-3 text-sm text-[#f7f5f1]/80">
                <p.icon className="h-4 w-4 text-accent" />
                {p.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-[#f7f5f1]/40">
          © {new Date().getFullYear()} Patrimo · Marusso Produções
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
