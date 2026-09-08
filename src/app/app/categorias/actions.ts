"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";

const HEX = /^#[0-9a-fA-F]{6}$/;

const createSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().regex(HEX),
  bucket: z.enum(["income", "expense"]),
});

export type CatState = { error?: string; ok?: boolean };

function refresh() {
  revalidatePath("/app/categorias");
  revalidatePath("/app/orcamento");
}

export async function createCategory(_prev: CatState, fd: FormData): Promise<CatState> {
  const p = createSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: "Dados inválidos." };
  try {
    const { user, supabase } = await requireUser();
    const { error } = await supabase.from("budget_categories").insert({
      user_id: user.id,
      name: p.data.name,
      color: p.data.color,
      kind: p.data.bucket === "income" ? "income" : "expense_variable",
    });
    if (error) {
      return { error: error.code === "23505" ? "Já existe uma categoria com esse nome." : safeError("cat.create", error) };
    }
    refresh();
    return { ok: true };
  } catch (err) {
    return { error: safeError("cat.create", err) };
  }
}

export async function updateCategory(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const color = String(fd.get("color") ?? "");
  const patch: { name?: string; color?: string } = {};
  if (name && name.length <= 40) patch.name = name;
  if (HEX.test(color)) patch.color = color;
  if (!id || (patch.name === undefined && patch.color === undefined)) return;
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("budget_categories").update(patch).eq("id", id).eq("user_id", user.id);
    refresh();
  } catch (err) {
    safeError("cat.update", err);
  }
}

export async function toggleArchive(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const archived = fd.get("archived") === "1";
  if (!id) return;
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("budget_categories").update({ archived }).eq("id", id).eq("user_id", user.id);
    refresh();
  } catch (err) {
    safeError("cat.archive", err);
  }
}

export async function deleteCategory(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  try {
    const { user, supabase } = await requireUser();
    await supabase.from("budget_categories").delete().eq("id", id).eq("user_id", user.id);
    refresh();
  } catch (err) {
    safeError("cat.delete", err);
  }
}
