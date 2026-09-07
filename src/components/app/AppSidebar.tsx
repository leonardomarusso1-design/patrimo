"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Lock, MoreHorizontal } from "lucide-react";
import { NAV } from "./nav";
import { cn } from "@/lib/utils";
import { planName } from "@/lib/plans";
import type { PlanId } from "@/types/database";
import { signOut } from "@/app/auth/actions";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-0.5">
      {NAV.map((item) => {
        const active =
          item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/10 text-accent-dim"
                : "text-muted hover:bg-ink/[0.04] hover:text-ink",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.locked && (
              <span
                className="inline-flex items-center gap-1 rounded-md bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted"
                title="Em construção"
              >
                <Lock className="h-3 w-3" />
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

const MOBILE_PRIMARY_NAV = NAV.filter((item) =>
  ["/app", "/app/orcamento", "/app/metas", "/app/investimentos"].includes(item.href),
);

export function AppSidebar({
  name,
  plan,
}: {
  name: string;
  plan: PlanId;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* topbar mobile */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <span className="font-display text-lg font-extrabold text-ink">
          Patri<span className="text-accent">mo</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Abrir menu">
          <Menu className="h-6 w-6 text-ink" />
        </button>
      </div>

      {/* sidebar desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
        <Link href="/" className="px-3 py-2 font-display text-xl font-extrabold text-ink">
          Patri<span className="text-accent">mo</span>
        </Link>
        <div className="mt-4 flex-1">
          <NavLinks />
        </div>
        <SidebarFooter name={name} plan={plan} />
      </aside>

      {/* drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-card p-4">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-display text-lg font-extrabold text-ink">
                Patri<span className="text-accent">mo</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Fechar menu">
                <X className="h-6 w-6 text-ink" />
              </button>
            </div>
            <div className="mt-4 flex-1 overflow-y-auto">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <SidebarFooter name={name} plan={plan} />
          </div>
        </div>
      )}

      <nav
        aria-label="Navegação principal mobile"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_24px_rgba(20,33,28,0.08)] backdrop-blur lg:hidden"
      >
        {MOBILE_PRIMARY_NAV.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold transition-colors active:scale-95",
                active ? "text-accent-dim" : "text-muted",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              <span>{item.label === "Investimentos" ? "Investir" : item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-[10px] font-semibold text-muted transition-colors active:scale-95"
          aria-label="Abrir mais opções"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
          <span>Mais</span>
        </button>
      </nav>
    </>
  );
}

function SidebarFooter({ name, plan }: { name: string; plan: PlanId }) {
  return (
    <div className="border-t border-border pt-3">
      <div className="px-3 py-2">
        <p className="truncate text-sm font-semibold text-ink">{name}</p>
        <p className="text-xs text-muted">Plano {planName(plan)}</p>
      </div>
      <form action={signOut}>
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-ink/[0.04] hover:text-ink">
          <LogOut className="h-[18px] w-[18px]" />
          Sair
        </button>
      </form>
    </div>
  );
}
