import { requireOnboarded } from "@/lib/data";
import { AppSidebar } from "@/components/app/AppSidebar";

export const metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireOnboarded();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar name={profile.full_name ?? "Você"} plan={profile.plan} />
      <div className="flex-1 bg-bg">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</div>
      </div>
    </div>
  );
}
