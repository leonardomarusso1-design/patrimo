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
      Patri<span className="text-accent">mo</span>
    </span>
  );
  return href ? (
    <Link href={href} aria-label="Patrimo — início">
      {inner}
    </Link>
  ) : (
    inner
  );
}
