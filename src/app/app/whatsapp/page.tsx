import { PageHeader } from "@/components/app/PageHeader";
import { getProfile, requirePaidUser } from "@/lib/data";
import { loadPanel } from "@/lib/whatsapp/panel-load";
import { WhatsappPanel } from "./ui";

export const metadata = { title: "WhatsApp" };

export default async function WhatsappPage() {
  const [{ user }, profile] = await Promise.all([requirePaidUser(), getProfile()]);
  const data = await loadPanel(user.id, profile.email);

  return (
    <>
      <PageHeader
        title="WhatsApp"
        subtitle="O mesmo orçamento do painel, por mensagem. Texto ou foto de comprovante."
      />
      <WhatsappPanel data={data} />
    </>
  );
}
