"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/data";
import { LESSONS } from "@/lib/school";
import { planAllows } from "@/lib/plans";
import { getProfile } from "@/lib/data";
import { safeError } from "@/lib/logger";

export async function toggleLesson(lessonId: number, completed: boolean) {
  const lesson = LESSONS.find((l) => l.id === lessonId);
  if (!lesson) return;
  // sem vídeo publicado, não dá pra concluir
  if (completed && !lesson.videoUrl) return;

  const profile = await getProfile();
  if (!planAllows(profile.plan, lesson.planRequired)) return;

  try {
    const { user, supabase } = await requireUser();
    await supabase.from("school_progress").upsert(
      {
        user_id: user.id,
        lesson_id: lessonId,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,lesson_id" },
    );
    revalidatePath("/app/escola");
  } catch (err) {
    safeError("escola.toggle", err);
  }
}
