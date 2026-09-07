"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { getConnectToken, saveConnection } from "@/app/app/conexoes/actions";
import { Button } from "@/components/ui/Button";

const SCRIPT = "https://cdn.pluggy.ai/pluggy-connect/v2.9.0/pluggy-connect.js";

type PluggyOnSuccess = (data: { item?: { id?: string }; itemId?: string }) => void;
type PluggyOpts = {
  connectToken: string;
  includeSandbox?: boolean;
  onSuccess?: PluggyOnSuccess;
  onError?: () => void;
  onClose?: () => void;
};
type PluggyInstance = { init: () => void };

declare global {
  interface Window {
    PluggyConnect?: new (opts: PluggyOpts) => PluggyInstance;
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PluggyConnect) return resolve();
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("script"));
    document.head.appendChild(s);
  });
}

export function PluggyButton({ label = "Conectar banco" }: { label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setError(null);
    setBusy(true);
    try {
      const [{ token, error: tokErr }] = await Promise.all([getConnectToken(), loadScript()]);
      if (tokErr || !token) {
        setBusy(false);
        return setError(tokErr ?? "Não foi possível iniciar.");
      }
      const Ctor = window.PluggyConnect;
      if (!Ctor) {
        setBusy(false);
        return setError("Widget do Open Finance não carregou.");
      }
      const pluggy = new Ctor({
        connectToken: token,
        includeSandbox: process.env.NODE_ENV !== "production",
        onSuccess: async (data) => {
          const itemId = data?.item?.id ?? data?.itemId;
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
    } catch {
      setBusy(false);
      setError("Não foi possível abrir o Open Finance.");
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
