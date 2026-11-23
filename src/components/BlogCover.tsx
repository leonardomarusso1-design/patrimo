import Image from "next/image";
import { cn } from "@/lib/utils";
import { safeCover } from "@/lib/markdown-href";

const GRADIENTS = [
  "linear-gradient(135deg,#0b7a55,#08573d)",
  "linear-gradient(135deg,#16a06c,#0b7a55)",
  "linear-gradient(135deg,#0a6a4a,#14211c)",
  "linear-gradient(135deg,#0b7a55,#2f8fa8)",
  "linear-gradient(135deg,#08573d,#0a6a4a)",
];

function pick(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

/**
 * Capa do artigo. Com `coverImage` válido, mostra a foto; senão, o degradê do slug.
 */
export function BlogCover({
  slug,
  tag,
  coverImage,
  className,
  preload = false,
  decorative = false,
  sizes = "(max-width: 768px) 100vw, 40rem",
}: {
  slug: string;
  tag?: string;
  coverImage?: { src: string; alt: string };
  className?: string;
  /** Só na capa do artigo, que é o elemento principal da página. */
  preload?: boolean;
  /** No card, o título do link já nomeia o artigo. */
  decorative?: boolean;
  sizes?: string;
}) {
  const cover = safeCover(coverImage);

  if (cover) {
    return (
      <div className={cn("relative overflow-hidden rounded-xl bg-brand-50", className)}>
        <Image
          src={cover.src}
          alt={decorative ? "" : cover.alt}
          fill
          preload={preload}
          sizes={sizes}
          className="object-cover object-[center_18%]"
        />
        {tag ? (
          <span
            aria-hidden
            className="absolute bottom-3 left-3 rounded-full bg-ink/80 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-white"
          >
            {tag}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("relative flex items-end overflow-hidden rounded-xl", className)}
      style={{ background: pick(slug) }}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 120"
        className="absolute -right-8 -top-8 h-40 w-40 opacity-40"
        preserveAspectRatio="none"
      >
        {[20, 40, 60, 80].map((r) => (
          <circle key={r} cx="150" cy="20" r={r} fill="none" stroke="#eaf5ee" strokeWidth="1" />
        ))}
        <circle cx="150" cy="20" r="4" fill="#c98a00" />
      </svg>
      {tag && (
        <span className="relative m-3 rounded-full bg-white/15 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-[#eaf5ee] backdrop-blur">
          {tag}
        </span>
      )}
    </div>
  );
}
