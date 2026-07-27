"use client";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-[color:var(--ring)]";
  const sizes = size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm";
  const styles: Record<Variant, string> = {
    primary:
      "bg-linear-to-l from-[color:var(--gc-accent)] to-[color:var(--gc-primary)] text-white shadow-[0_10px_30px_rgba(21,185,198,0.22)] hover:brightness-110",
    secondary:
      "border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-2)]",
    ghost:
      "text-[color:var(--muted)] hover:bg-[color:var(--surface-2)] hover:text-[color:var(--foreground)]",
    danger:
      "text-red-700 hover:bg-red-50",
  };

  return <button className={cn(base, sizes, styles[variant], className)} {...props} />;
}

