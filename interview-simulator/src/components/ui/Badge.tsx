import React from "react";

type BadgeVariant = "brand" | "accent" | "success" | "warning" | "danger" | "neutral" | "new";

const variantClasses: Record<BadgeVariant, string> = {
  brand:   "bg-brand-500/15 text-brand-300 border-brand-500/30",
  accent:  "bg-accent-500/15 text-accent-300 border-accent-500/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  danger:  "bg-red-500/15 text-red-300 border-red-500/30",
  neutral: "bg-surface-600/40 text-slate-300 border-surface-500/30",
  new:     "bg-violet-500/15 text-violet-300 border-violet-500/30",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ variant = "brand", children, className = "", dot }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {children}
    </span>
  );
}
