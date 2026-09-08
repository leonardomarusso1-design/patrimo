import { requirePaidAccess } from "@/lib/data";
import { PageHeader } from "@/components/app/PageHeader";
import { Chat } from "./Chat";

export const metadata = { title: "Assistente" };

export default async function AssistentePage() {
  await requirePaidAccess();
  return (
    <>
      <PageHeader
        title="Assistente"
        subtitle="Tire dúvidas sobre suas finanças com base nos seus próprios números."
      />
      <Chat />
    </>
  );
}
