"use client";

import { useState, useTransition } from "react";
import { Lock, Play, Check, Zap, ArrowRight } from "lucide-react";
import { LESSONS } from "@/lib/school";
import { toggleLesson } from "./actions";
import { Progress } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

const XP_PER_LESSON = 100;

export function AcademiaList({ completed }: { completed: number[] }) {
  const [done, setDone] = useState<number[]>(completed);
  const [pending, start] = useTransition();
  const [active, setActive] = useState<number | null>(null);

  const withVideo = LESSONS.filter((l) => l.videoUrl).length;
  const pct = withVideo ? (done.length / withVideo) * 100 : 0;
  const xp = done.length * XP_PER_LESSON;
  const nextLesson =
    LESSONS.find((l) => l.videoUrl && !done.includes(l.id)) ??
    LESSONS.find((l) => !done.includes(l.id));

  const activeLesson = LESSONS.find((l) => l.id === active);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        {activeLesson ? (
          <div>
            <div className="flex aspect-video items-center justify-center rounded-xl bg-ink text-[#eaf5ee]">
              <div className="text-center">
                {activeLesson.videoUrl ? (
                  <Play className="mx-auto h-10 w-10 text-accent" />
                ) : (
                  <Lock className="mx-auto h-8 w-8 text-[#eaf5ee]/60" />
                )}
                <p className="mt-3 text-sm text-[#eaf5ee]/70">
                  {activeLesson.videoUrl ? "Assista a aula" : "Aula em gravação — disponível em breve"}
                </p>
              </div>
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-ink">{activeLesson.title}</h2>
            <p className="mt-1 text-sm text-muted">{activeLesson.description}</p>

            {activeLesson.videoUrl ? (
              <button
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const next = !done.includes(activeLesson.id);
                    await toggleLesson(activeLesson.id, next);
                    setDone((d) =>
                      next ? [...d, activeLesson.id] : d.filter((x) => x !== activeLesson.id),
                    );
                  })
                }
                className={cn(
                  "mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                  done.includes(activeLesson.id)
                    ? "bg-success/12 text-success"
                    : "bg-ink text-[#eaf5ee]",
                )}
              >
                <Check className="h-4 w-4" />
                {done.includes(activeLesson.id) ? "Concluída" : "Marcar como concluída"}
              </button>
            ) : (
              <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink/[0.05] px-3 py-2 text-xs font-medium text-muted">
                <Lock className="h-3.5 w-3.5" />
                Marcar como concluída fica liberado quando o vídeo sair.
              </p>
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-surface text-sm text-muted">
            Selecione uma aula ao lado para começar.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <p className="font-display text-sm font-bold text-ink">Seu progresso</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-[#8a5e00]">
            <Zap className="h-3 w-3" /> {xp} XP
          </span>
        </div>
        <p className="text-xs text-muted">
          {done.length} de {LESSONS.length} aulas concluídas
        </p>
        <div className="mt-3">
          <Progress value={pct} tone="success" />
          <p className="mt-1.5 text-xs text-muted">
            {withVideo === 0
              ? "Vídeos em gravação — concluir libera quando saírem"
              : `${done.length} de ${withVideo} disponíveis concluídas`}
          </p>
        </div>

        {nextLesson && (
          <button
            onClick={() => setActive(nextLesson.id)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-brand/30 bg-brand-50 p-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                Próxima aula
              </p>
              <p className="truncate text-sm font-medium text-ink">{nextLesson.title}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-brand-700" />
          </button>
        )}

        <ul className="mt-4 space-y-1">
          {LESSONS.map((l) => {
            const isDone = done.includes(l.id);
            const noVideo = !l.videoUrl;
            return (
              <li key={l.id}>
                <button
                  onClick={() => setActive(l.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
                    active === l.id ? "bg-accent/10" : "hover:bg-ink/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isDone ? "bg-success/15 text-success" : "bg-ink/[0.06] text-ink",
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : noVideo ? <Lock className="h-3 w-3" /> : l.id}
                  </span>
                  <span className={cn("flex-1", noVideo && "text-muted")}>{l.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
