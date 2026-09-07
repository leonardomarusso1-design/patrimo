"use client";

import { useEffect, useRef } from "react";

/**
 * Signature element — pulso de "sinal" atrás do headline.
 * Único elemento de movimento da página. Respeita prefers-reduced-motion.
 */
export function HeroPulse() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const rings = [0, 1, 2].map((i) => ({ t: i / 3 }));

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h * 0.46;
      const max = Math.min(w, h) * 0.62;
      ctx.clearRect(0, 0, w, h);

      for (const ring of rings) {
        if (!reduce) ring.t += 0.0016;
        if (ring.t > 1) ring.t -= 1;
        const r = max * ring.t + 20;
        const alpha = (1 - ring.t) * 0.22;
        const g = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
        g.addColorStop(0, `rgba(255,77,109,0)`);
        g.addColorStop(0.82, `rgba(255,77,109,${alpha})`);
        g.addColorStop(1, `rgba(139,92,246,${alpha * 0.7})`);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 4 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,77,109,0.9)";
      ctx.fill();

      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    if (reduce) draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}
