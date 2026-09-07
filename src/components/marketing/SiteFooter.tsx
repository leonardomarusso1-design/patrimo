import Link from "next/link";
import { Wordmark } from "./Wordmark";

const COLS = [
  {
    title: "Produto",
    links: [
      { href: "/#funcionalidades", label: "Funcionalidades" },
      { href: "/precos", label: "Preços" },
      { href: "/#escola", label: "Escola" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: "/login", label: "Entrar" },
      { href: "/cadastro", label: "Criar conta" },
      { href: "/app", label: "Meu painel" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/termos", label: "Termos de Uso" },
      { href: "/privacidade", label: "Privacidade" },
      { href: "/cookies", label: "Cookies" },
      { href: "/contrato-assinatura", label: "Contrato de assinatura" },
      { href: "/seguranca", label: "Segurança" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm text-muted">
              O dinheiro inteiro numa tela só. Feito no Brasil, pronto pro mundo.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-display text-sm font-bold text-ink">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="font-display text-lg font-bold text-ink">
            Todo mês que passa sem controle é dinheiro que não volta.
          </p>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} Patrimo · Marusso Produções. Feito para durar.
          </p>
        </div>
      </div>
    </footer>
  );
}
