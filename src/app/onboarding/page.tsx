import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";
import { OnboardingWizard } from "./OnboardingWizard";

export const metadata = { title: "Personalizar conta", robots: { index: false } };

export default async function OnboardingPage() {
  const profile = await getProfile();
  if (profile.onboarding_completed) redirect("/app");

  const firstName = (profile.full_name ?? "").split(" ")[0] || "por aqui";

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-4 py-12">
      <OnboardingWizard firstName={firstName} />
    </main>
  );
}
