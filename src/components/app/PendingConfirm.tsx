"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { confirmPending } from "@/app/app/orcamento/actions";

export function PendingConfirm({
  id,
  path,
  kind,
}: {
  id: string;
  path: string;
  kind: string;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  if (done) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await confirmPending(id, path);
          setDone(true);
        })
      }
      className="inline-flex items-center gap-1 rounded-md bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-[#8a5e00] hover:bg-gold/25"
    >
      <Check className="h-3 w-3" />
      {kind === "income" ? "recebi" : "paguei"}
    </button>
  );
}
