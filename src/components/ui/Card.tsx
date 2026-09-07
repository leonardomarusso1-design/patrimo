import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 p-5 pb-0", className)}>
      <h3 className="font-display text-base font-bold text-ink">{title}</h3>
      {action}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
