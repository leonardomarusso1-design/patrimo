import { ButtonLink } from "@/components/ui/Button";
import { Wordmark } from "@/components/marketing/Wordmark";

export const metadata = { title: "Página não encontrada" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <Wordmark />
      <p className="mt-10 font-display text-6xl font-extrabold text-ink">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">Essa página saiu do orçamento</h1>
      <p className="mt-2 max-w-sm text-muted">
        O link que você abriu não existe ou foi movido. Vamos te levar de volta pra
        um lugar conhecido.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Ir para o início</ButtonLink>
        <ButtonLink href="/app" variant="secondary">
          Meu painel
        </ButtonLink>
      </div>
    </main>
  );
}
