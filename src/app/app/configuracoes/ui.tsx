"use client";

import { useActionState } from "react";
import { updateProfile, type SettingsState } from "./actions";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select } from "@/components/ui/Field";
import { CURRENCIES, OCCUPATIONS, BR_STATES } from "@/lib/onboarding";
import type { Tables } from "@/types/database";

const empty: SettingsState = {};

export function SettingsForm({ profile }: { profile: Tables<"profiles"> }) {
  const [state, action, pending] = useActionState(updateProfile, empty);

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      {state.error && (
        <p className="rounded-xl bg-danger/10 px-3.5 py-2.5 text-sm text-danger">{state.error}</p>
      )}
      {state.ok && (
        <p className="rounded-xl bg-success/10 px-3.5 py-2.5 text-sm text-success">Alterações salvas.</p>
      )}

      <div>
        <Label htmlFor="full_name">Nome</Label>
        <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="display_currency">Moeda de exibição</Label>
          <Select id="display_currency" name="display_currency" defaultValue={profile.display_currency}>
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="occupation">Profissão</Label>
          <Select id="occupation" name="occupation" defaultValue={profile.occupation ?? ""}>
            <option value="">—</option>
            {OCCUPATIONS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input id="city" name="city" defaultValue={profile.city ?? ""} />
        </div>
        <div>
          <Label htmlFor="state">Estado</Label>
          <Select id="state" name="state" defaultValue={profile.state ?? ""}>
            <option value="">—</option>
            {BR_STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="marketing_opt_in"
          defaultChecked={profile.marketing_opt_in}
          className="h-4 w-4"
        />
        Quero receber dicas e novidades por e-mail
      </label>

      <div className="pt-2">
        <Button type="submit" loading={pending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
