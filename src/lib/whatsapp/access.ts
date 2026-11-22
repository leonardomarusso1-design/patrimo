import { hasActiveAccess } from "@/lib/plans";
import type { PlanId } from "@/types/database";

/**
 * O teste de 7 dias entra como plano pago com data de fim.
 * Depois disso o acesso acaba por completo: não há plano grátis.
 */
export function whatsappAccess(profile: {
  plan: PlanId;
  plan_expires_at: string | null;
}): "ok" | "blocked" {
  return hasActiveAccess(profile) ? "ok" : "blocked";
}
