import { requireOnboarded } from "@/lib/data";
import { AppSidebar } from "@/components/app/AppSidebar";
import { TopBarActions } from "@/components/app/TopBarActions";

export const metadata = { title: "Painel", robots: { index: false, follow: false } };

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireOnboarded();
  const firstName = (profile.full_name ?? "").split(" ")[0] || "Você";

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <AppSidebar name={profile.full_name ?? "Você"} plan={profile.plan} />
      <div className="flex-1 bg-bg">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-8 sm:py-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <p className="text-sm text-muted">
              Olá, <span className="font-semibold text-ink">{firstName}</span>
            </p>
            <TopBarActions />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
