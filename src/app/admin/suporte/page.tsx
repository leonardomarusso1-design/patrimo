import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { resolveSupport } from "./actions";

export default async function SuportePage() {
  const db = createAdminClient();
  const { data } = await db
    .from("support_messages")
    .select("id, name, email, message, status, created_at, user_id")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const open = rows.filter((r) => r.status !== "done");

  return (
    <>
      <h1 className="font-display text-2xl font-extrabold text-ink">Suporte</h1>
      <p className="mt-1 text-sm text-muted">
        {open.length} em aberto · {rows.length} no total (últimas 200).
      </p>

      <ul className="mt-6 space-y-3">
        {rows.map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border p-4 shadow-[var(--shadow-card)] ${
              m.status === "done" ? "border-border bg-surface opacity-70" : "border-border bg-card"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-display font-bold text-ink">{m.name}</span>{" "}
                <a href={`mailto:${m.email}`} className="text-sm text-accent-dim hover:underline">
                  {m.email}
                </a>
                {m.user_id && <span className="ml-2 text-xs text-muted">· tem conta</span>}
              </div>
              <span className="text-xs tabular-nums text-muted">{formatDate(m.created_at)}</span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{m.message}</p>
            {m.status !== "done" && (
              <form action={resolveSupport} className="mt-3">
                <input type="hidden" name="id" value={m.id} />
                <button className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink">
                  Marcar como resolvida
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
