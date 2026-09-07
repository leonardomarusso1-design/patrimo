"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { getConnectToken, saveConnection } from "@/app/app/conexoes/actions";
import { Button } from "@/components/ui/Button";

export function PluggyButton({ label = "Conectar banco" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setBusy(true);
    try {
      const { token, error: tokErr } = await getConnectToken();
      if (tokErr || !token) {
        setBusy(false);
        return setError(tokErr ?? "Não foi possível iniciar.");
      }

      const { PluggyConnect } = await import("pluggy-connect-sdk");
      const pluggy = new PluggyConnect({
        connectToken: token,
        includeSandbox: process.env.NODE_ENV !== "production",
        onSuccess: async (data) => {
          const itemId = data?.item?.id;
          if (itemId) {
            const res = await saveConnection(String(itemId));
            if (res.error) setError(res.error);
          }
          setBusy(false);
          router.refresh();
        },
        onError: () => {
          setError("Conexão cancelada ou falhou.");
          setBusy(false);
        },
        onClose: () => setBusy(false),
      });
      pluggy.init();
    } catch (err) {
      setBusy(false);
      setError(
        err instanceof Error ? `Erro: ${err.message}` : "Não foi possível abrir o Open Finance.",
      );
    }
  }

  return (
    <div>
      <Button onClick={open} loading={busy}>
        <Landmark className="h-4 w-4" /> {label}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
