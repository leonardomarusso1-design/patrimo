import "server-only";

import { notFound } from "next/navigation";
import { requireUser } from "@/lib/data";

/** E-mails com acesso ao painel admin. */
const ADMIN_EMAILS = ["leonardomarusso1@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Gate do /admin. Quem não é admin recebe 404 (não revela que a rota existe).
 */
export async function requireAdmin() {
  const { user, supabase } = await requireUser();
  if (!isAdminEmail(user.email)) notFound();
  return { user, supabase };
}
