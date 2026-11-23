"use client";

import { useRef, useState, useTransition } from "react";
import { Lock, Check, Zap, ArrowRight, Download } from "lucide-react";
import { LESSONS, type Lesson } from "@/lib/school";
import { toggleLesson } from "./actions";
import { Progress } from "@/components/ui/Misc";
import { cn } from "@/lib/utils";

const XP_PER_LESSON = 100;

function LessonItem({
  lesson,
  active,
  done,
  onSelect,
}: {
  lesson: Lesson;
  active: boolean;
  done: boolean;
  onSelect: (id: number) => void;
}) {
  const noVideo = !lesson.videoUrl;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(lesson.id)}
        className={cn(
          "flex min-h-11 w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm",
          active ? "bg-accent/10" : "hover:bg-ink/[0.04]",
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            done ? "bg-success/15 text-success" : "bg-ink/[0.06] text-ink",
          )}
        >
          {done ? <Check className="h-3.5 w-3.5" /> : noVideo ? <Lock className="h-3 w-3" /> : lesson.id}
        </span>
        <span className={cn("min-w-0 flex-1", noVideo && "text-muted")}>{lesson.title}</span>
        <span className="shrink-0 text-xs tabular-nums text-muted">{lesson.duration}</span>
      </button>
    </li>
  );
}

export function AcademiaList({ completed }: { completed: number[] }) {
  const [done, setDone] = useState<number[]>(completed);
  const [pending, start] = useTransition();
  const [active, setActive] = useState<number | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const aulas = LESSONS.filter((l) => l.kind === "aula");
  const extras = LESSONS.filter((l) => l.kind === "extra");
  const withVideo = LESSONS.filter((l) => l.videoUrl).length;
  const pct = withVideo ? (done.length / withVideo) * 100 : 0;
  const xp = done.length * XP_PER_LESSON;
  const nextLesson =
    LESSONS.find((l) => l.videoUrl && !done.includes(l.id)) ??
    LESSONS.find((l) => !done.includes(l.id));

  const activeLesson = LESSONS.find((l) => l.id === active);

  function selectLesson(id: number) {
    setActive(id);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() => {
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div
        ref={playerRef}
        className="scroll-mt-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5"
      >
        {activeLesson ? (
          <div>
            {activeLesson.videoUrl ? (
              <video
                key={activeLesson.id}
                className="aspect-video w-full max-w-full rounded-xl bg-ink"
                controls
                preload="metadata"
                playsInline
                crossOrigin="anonymous"
                src={activeLesson.videoUrl}
                aria-label={activeLesson.title}
              >
                {activeLesson.captionUrl ? (
                  <track
                    kind="subtitles"
                    src={activeLesson.captionUrl}
                    srcLang="pt-BR"
                    label="Português"
                    default
                  />
                ) : null}
              </video>
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-xl bg-ink text-[#eaf5ee]">
                <div className="px-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-[#eaf5ee]/60" />
                  <p className="mt-3 text-sm text-[#eaf5ee]/70">
                    Aula em gravação — disponível em breve
                  </p>
                </div>
              </div>
            )}
            <h2 className="mt-4 font-display text-lg font-bold text-ink">{activeLesson.title}</h2>
            <p className="mt-1 text-sm text-muted">{activeLesson.description}</p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {activeLesson.videoUrl ? (
                <button
                  type="button"
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
                    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold",
                    done.includes(activeLesson.id)
                      ? "bg-success/12 text-success"
                      : "bg-ink text-[#eaf5ee]",
                  )}
                >
                  <Check className="h-4 w-4" />
                  {done.includes(activeLesson.id) ? "Concluída" : "Marcar como concluída"}
                </button>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-xl bg-ink/[0.05] px-3 py-2 text-xs font-medium text-muted">
                  <Lock className="h-3.5 w-3.5" />
                  Marcar como concluída fica liberado quando o vídeo sair.
                </p>
              )}

              {activeLesson.ebookUrl ? (
                <a
                  href={activeLesson.ebookUrl}
                  download={`${activeLesson.slug}-ebook.pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-ink hover:bg-ink/[0.04]"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Baixar e-book (PDF)
                </a>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-surface px-6 text-center text-sm text-muted">
            Selecione uma aula para começar.
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
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
            type="button"
            onClick={() => selectLesson(nextLesson.id)}
            className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-xl border border-brand/30 bg-brand-50 p-3 text-left"
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
          {aulas.map((l) => (
            <LessonItem
              key={l.id}
              lesson={l}
              active={active === l.id}
              done={done.includes(l.id)}
              onSelect={selectLesson}
            />
          ))}
        </ul>

        {extras.length > 0 && (
          <div className="mt-4">
            <h3 className="px-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Aulas extras
            </h3>
            <ul className="mt-1 space-y-1">
              {extras.map((l) => (
                <LessonItem
                  key={l.id}
                  lesson={l}
                  active={active === l.id}
                  done={done.includes(l.id)}
                  onSelect={selectLesson}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
