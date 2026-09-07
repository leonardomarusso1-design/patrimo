import { requireUser, getProfile } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { EscolaList } from "./ui";

export const metadata = { title: "Escola" };

export default async function EscolaPage() {
  const [{ user, supabase }, profile] = await Promise.all([requireUser(), getProfile()]);
  const { data } = await supabase
    .from("school_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completed = (data ?? []).map((r) => r.lesson_id);

  return (
    <>
      <PageHeader
        title="Escola"
        subtitle="Domine seu dinheiro, uma aula por vez. Vídeos em gravação — o cadeado abre quando ficam prontos."
      />
      <EscolaList plan={profile.plan} completed={completed} />
    </>
  );
}
