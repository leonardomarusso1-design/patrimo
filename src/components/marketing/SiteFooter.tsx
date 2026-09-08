import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { COMPANY } from "@/components/LegalPage";

const COLS = [
  {
    title: "Produto",
    links: [
      { href: "/#funcionalidades", label: "Funcionalidades" },
      { href: "/precos", label: "Preços" },
      { href: "/#escola", label: "Escola" },
      { href: "/blog", label: "Blog" },
      { href: "/parceria", label: "Seja parceiro" },
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
      { href: "/privacidade", label: "Política de Privacidade" },
      { href: "/cookies", label: "Política de Cookies" },
      { href: "/contrato-assinatura", label: "Contrato de assinatura" },
      { href: "/seguranca", label: "Segurança" },
    ],
  },
  {
    title: "Contato",
    links: [
      { href: `mailto:${COMPANY.supportEmail}`, label: "Suporte" },
      { href: `mailto:${COMPANY.privacyEmail}?subject=LGPD`, label: "Privacidade / LGPD" },
      { href: COMPANY.instagramUrl, label: `Instagram ${COMPANY.instagram}` },
      { href: "/parceria", label: "Seja parceiro" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
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
                {col.links.map((l) => {
                  const external = l.href.startsWith("http") || l.href.startsWith("mailto:");
                  const cls = "text-sm text-muted transition-colors hover:text-ink";
                  return (
                    <li key={l.href}>
                      {external ? (
                        <a
                          href={l.href}
                          className={cls}
                          {...(l.href.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className={cls}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <p className="font-display text-lg font-bold text-ink">
            Todo mês que passa sem controle é dinheiro que não volta.
          </p>
          <p className="mt-1 text-sm text-muted">
            © {new Date().getFullYear()} Ordre · Leonardo Marusso · CPF 473.503.798-54
          </p>
        </div>
      </div>
    </footer>
  );
}
