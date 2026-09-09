import { requireUser } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { AcademiaList } from "./ui";

export const metadata = { title: "Academia" };

export default async function EscolaPage() {
  const { user, supabase } = await requireUser();
  const { data } = await supabase
    .from("school_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .eq("completed", true);

  const completed = (data ?? []).map((r) => r.lesson_id);

  return (
    <>
      <PageHeader
        title="Academia Ordre"
        subtitle="Domine seu dinheiro, uma aula por vez. Vídeos em gravação — o cadeado abre quando ficam prontos."
      />
      <AcademiaList completed={completed} />
    </>
  );
}
