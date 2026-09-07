import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const control =
  "w-full h-11 rounded-xl border border-border bg-surface px-3.5 font-body text-[0.95rem] text-ink placeholder:text-muted/70 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/25 transition";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block font-body text-sm font-medium text-ink", className)}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(control, className)} {...props} />;
  },
);

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(control, "appearance-none pr-9", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(control, "h-auto min-h-24 py-2.5", className)}
      {...props}
    />
  );
});

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-danger">{children}</p>;
}
