import { cn } from "@/lib/utils";
import { clamp } from "@/lib/utils";

export function Progress({
  value,
  className,
  tone = "accent",
}: {
  value: number;
  className?: string;
  tone?: "accent" | "success" | "violet";
}) {
  const pct = clamp(value, 0, 100);
  const bar =
    tone === "success"
      ? "bg-brand-600"
      : tone === "violet"
        ? "bg-brand-700"
        : "bg-brand";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-ink/[0.08]", className)}>
      <div
        className={cn("h-full rounded-full transition-[width] duration-500", bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "bg-ink/[0.06] text-muted",
    accent: "bg-accent/12 text-accent-dim",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      {icon && <div className="mb-4 text-accent">{icon}</div>}
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "ink";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        tone === "ink"
          ? "brand-panel border-transparent text-[#eaf5ee]"
          : "border-border bg-card shadow-[var(--shadow-card)]",
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          tone === "ink" ? "text-[#eaf5ee]/70" : "text-muted",
        )}
      >
        {label}
      </p>
      <p className="money mt-2 font-display text-2xl font-extrabold">{value}</p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-sm",
            tone === "ink" ? "text-[#eaf5ee]/70" : "text-muted",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
