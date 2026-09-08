"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-semibold text-muted hover:text-ink"
    >
      <Printer className="h-4 w-4" /> Imprimir
    </button>
  );
}
