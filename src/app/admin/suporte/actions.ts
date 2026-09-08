"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeError } from "@/lib/logger";

export async function resolveSupport(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  try {
    await requireAdmin();
    await createAdminClient()
      .from("support_messages")
      .update({ status: "done" })
      .eq("id", id);
    revalidatePath("/admin/suporte");
  } catch (err) {
    safeError("admin.support.resolve", err);
  }
}
