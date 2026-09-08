import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="font-display text-lg font-extrabold text-ink">
              Patri<span className="text-accent">mo</span>{" "}
              <span className="text-sm font-semibold text-muted">admin</span>
            </span>
            <nav className="flex gap-3 text-sm">
              <Link href="/admin" className="text-muted hover:text-ink">Resumo</Link>
              <Link href="/admin/assinantes" className="text-muted hover:text-ink">Assinantes</Link>
              <Link href="/admin/eventos" className="text-muted hover:text-ink">Webhooks</Link>
            </nav>
          </div>
          <Link href="/app" className="text-sm text-accent-dim hover:underline">
            ← voltar ao app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
