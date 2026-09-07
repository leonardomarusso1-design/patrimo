"use client";

import { useState, useTransition } from "react";
import { Lock, Play, Check } from "lucide-react";
import { LESSONS } from "@/lib/school";
import { planAllows, planName } from "@/lib/plans";
import type { PlanId } from "@/types/database";
import { toggleLesson } from "./actions";
import { Progress } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

export function EscolaList({
  plan,
  completed,
}: {
  plan: PlanId;
  completed: number[];
}) {
  const [done, setDone] = useState<number[]>(completed);
  const [pending, start] = useTransition();
  const [active, setActive] = useState<number | null>(null);

  const unlocked = LESSONS.filter((l) => planAllows(plan, l.planRequired));
  const pct = unlocked.length ? (done.length / unlocked.length) * 100 : 0;

  const activeLesson = LESSONS.find((l) => l.id === active);
  const activeUnlocked = activeLesson && planAllows(plan, activeLesson.planRequired);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        {activeLesson ? (
          <div>
            <div className="flex aspect-video items-center justify-center rounded-xl bg-ink text-[#f7f5f1]">
              {activeUnlocked ? (
                <div className="text-center">
                  <Play className="mx-auto h-10 w-10 text-accent" />
                  <p className="mt-3 text-sm text-[#f7f5f1]/70">
                    Aula em gravação — disponível em breve
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Lock className="mx-auto h-8 w-8 text-[#f7f5f1]/60" />
                  <p className="mt-3 text-sm text-[#f7f5f1]/70">
                    Disponível no plano {planName(activeLesson.planRequired)}
                  </p>
                </div>
              )}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-ink">
              {activeLesson.title}
            </h2>
            <p className="mt-1 text-sm text-muted">{activeLesson.description}</p>
            {activeUnlocked && (
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
                    : "bg-ink text-[#f7f5f1]",
                )}
              >
                <Check className="h-4 w-4" />
                {done.includes(activeLesson.id) ? "Concluída" : "Marcar como concluída"}
              </button>
            )}
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-surface text-sm text-muted">
            Selecione uma aula ao lado para começar.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <p className="font-display text-sm font-bold text-ink">Conteúdo do curso</p>
        <p className="text-xs text-muted">{LESSONS.length} aulas</p>
        <div className="mt-3">
          <Progress value={pct} tone="success" />
          <p className="mt-1.5 text-xs text-muted">
            {done.length} de {unlocked.length} desbloqueadas concluídas
          </p>
        </div>
        <ul className="mt-4 space-y-1">
          {LESSONS.map((l) => {
            const locked = !planAllows(plan, l.planRequired);
            const isDone = done.includes(l.id);
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
                      isDone
                        ? "bg-success/15 text-success"
                        : locked
                          ? "bg-ink/[0.06] text-muted"
                          : "bg-ink/[0.06] text-ink",
                    )}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : locked ? <Lock className="h-3 w-3" /> : l.id}
                  </span>
                  <span className={cn("flex-1", locked && "text-muted")}>{l.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
