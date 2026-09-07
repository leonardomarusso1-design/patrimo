"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./Wordmark";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/#funcionalidades", label: "Funcionalidades" },
  { href: "/precos", label: "Preços" },
  { href: "/blog", label: "Blog" },
  { href: "/#escola", label: "Escola" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Wordmark />

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Entrar
          </ButtonLink>
          <ButtonLink href="/cadastro" size="sm">
            Começar
          </ButtonLink>
        </div>

        <button
          className="rounded-lg p-2 text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-card md:hidden">
          <div className="space-y-1 px-4 py-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-2 py-2.5 text-ink hover:bg-surface"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <ButtonLink href="/login" variant="secondary" size="sm">
                Entrar
              </ButtonLink>
              <ButtonLink href="/cadastro" size="sm">
                Começar
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
