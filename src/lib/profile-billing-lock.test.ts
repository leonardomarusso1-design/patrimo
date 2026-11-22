import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const migration = readFileSync(
  resolve(root, "supabase/migrations/0025_lock_profile_billing.sql"),
  "utf8",
);
const verify = readFileSync(
  resolve(root, "supabase/tests/verify_profile_billing.sql"),
  "utf8",
);

const PROTECTED = [
  "plan",
  "plan_expires_at",
  "trial_started_at",
  "renewal_reminded_at",
] as const;

const EDITABLE = [
  "email",
  "full_name",
  "avatar_url",
  "display_currency",
  "income_band",
  "occupation",
  "country",
  "state",
  "city",
  "onboarding_completed",
  "marketing_opt_in",
  "investor_profile",
  "investor_profile_at",
  "theme",
  "dashboard_cards",
  "invest_pct",
] as const;

function grantColumns(sql: string): string[] {
  const match = sql.match(
    /grant update \(\s*([\s\S]*?)\)\s*on table public\.profiles to authenticated/i,
  );
  if (!match) throw new Error("GRANT UPDATE de authenticated não encontrado");
  return match[1]
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean);
}

describe("trava de billing em profiles", () => {
  const granted = grantColumns(migration);

  it("tira o UPDATE da tabela de anon e authenticated e devolve só as colunas de perfil", () => {
    expect(migration).toMatch(
      /revoke update on table public\.profiles from public, anon, authenticated/i,
    );
    expect(granted).toEqual([...EDITABLE]);
    for (const column of PROTECTED) {
      expect(granted).not.toContain(column);
    }
    expect(granted).not.toContain("id");
    expect(granted).not.toContain("created_at");
    expect(granted).not.toContain("updated_at");
  });

  it("mantém o service_role capaz de atualizar a tabela", () => {
    expect(migration).toMatch(/grant update on table public\.profiles to service_role/i);
  });

  it("bloqueia mudança dos quatro campos fora de postgres, service_role e supabase_admin", () => {
    expect(migration).toMatch(/current_user in \('postgres', 'service_role', 'supabase_admin'\)/);
    for (const column of PROTECTED) {
      expect(migration).toContain(`new.${column} is distinct from old.${column}`);
      expect(verify).toContain(`'${column}'`);
    }
    expect(migration).toContain("new.plan::text is distinct from 'free'");
    expect(migration).toContain("before insert or update on public.profiles");
  });
});
