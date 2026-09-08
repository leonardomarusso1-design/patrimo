import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  className,
  href = "/",
}: {
  className?: string;
  href?: string | null;
}) {
  const inner = (
    <span className={cn("font-display text-xl font-extrabold tracking-tight text-ink", className)}>
      Ord<span className="text-accent">re</span>
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Ordre — início">
      {inner}
    </Link>
  ) : (
    inner
  );
}
