"use client";

import { useEffect, useState } from "react";

export type ChartColors = { grid: string; text: string; card: string };

const FALLBACK: ChartColors = { grid: "#E4E8E2", text: "#5B6660", card: "#ffffff" };

/** Lê as cores do tema atual (claro/escuro) das CSS vars pra usar no Recharts. */
export function useChartColors(): ChartColors {
  const [c, setC] = useState<ChartColors>(FALLBACK);
  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    const v = (name: string, fb: string) => s.getPropertyValue(name).trim() || fb;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setC({
      grid: v("--border", FALLBACK.grid),
      text: v("--muted", FALLBACK.text),
      card: v("--card", FALLBACK.card),
    });
  }, []);
  return c;
}
