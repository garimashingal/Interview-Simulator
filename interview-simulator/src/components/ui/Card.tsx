import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "bordered" | "highlight";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses = {
  default:   "bg-surface-800 shadow-card",
  glass:     "bg-white/5 backdrop-blur-md border border-white/10 shadow-card",
  bordered:  "bg-surface-800 border border-surface-600 shadow-card",
  highlight: "bg-card-gradient border border-brand-500/30 shadow-glow-brand/20 shadow-card",
} as const;

const paddingClasses = {
  none: "",
  sm:   "p-4",
  md:   "p-6",
  lg:   "p-8",
} as const;

export function Card({ variant = "default", padding = "md", className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-4 ${className}`} {...props}>{children}</div>;
}

export function CardTitle({ className = "", children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold text-white ${className}`} {...props}>{children}</h3>;
}

export function CardContent({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>;
}
