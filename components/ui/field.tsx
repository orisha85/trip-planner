import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1 text-sm", className)}>
      <span className="text-[color:var(--color-muted)]">{label}</span>
      {children}
      {hint && <span className="text-xs text-[color:var(--color-muted)]">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-elev)] px-3 py-2 text-[color:var(--color-fg)] outline-none focus:border-[color:var(--color-accent)] disabled:opacity-50";

export const buttonClass =
  "inline-flex items-center justify-center rounded-md bg-[color:var(--color-accent)] px-4 py-2 font-medium text-[color:var(--color-accent-fg)] transition hover:opacity-90 disabled:opacity-50";

export const buttonGhostClass =
  "inline-flex items-center justify-center rounded-md border border-[color:var(--color-border)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-fg)] transition hover:bg-[color:var(--color-bg-elev)]";

export const buttonDangerClass =
  "inline-flex items-center justify-center rounded-md border border-[color:var(--color-danger)] bg-transparent px-3 py-2 text-sm text-[color:var(--color-danger)] transition hover:bg-[color:var(--color-danger)] hover:text-white";
