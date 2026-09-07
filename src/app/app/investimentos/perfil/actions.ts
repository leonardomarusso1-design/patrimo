"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/data";
import { safeError } from "@/lib/logger";
import { INVESTOR_QUIZ, scoreToProfile } from "@/lib/investor";

const schema = z.record(z.string(), z.coerce.number().min(0).max(3));

export type PerfilState = { error?: string };

export async function saveInvestorProfile(
  _prev: PerfilState,
  formData: FormData,
): Promise<PerfilState> {
  const answers = schema.safeParse(Object.fromEntries(formData));
  if (!answers.success) return { error: "Responda todas as perguntas." };

  const ids = INVESTOR_QUIZ.map((q) => q.id);
  if (!ids.every((id) => id in answers.data)) {
    return { error: "Responda todas as perguntas." };
  }
  const score = ids.reduce((s, id) => s + (answers.data[id] ?? 0), 0);
  const profile = scoreToProfile(score);

  try {
    const { user, supabase } = await requireUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        investor_profile: profile,
        investor_profile_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return { error: safeError("investor.save", error) };
  } catch (err) {
    return { error: safeError("investor.save", err) };
  }

  revalidatePath("/app/investimentos");
  redirect("/app/investimentos?perfil=ok");
}
