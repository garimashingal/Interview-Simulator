import React from "react";

// Simple CVA-like helper (no external dep)
const buttonVariants = {
  primary:   "bg-brand-500 hover:bg-brand-600 text-white shadow-glow-brand hover:shadow-[0_0_32px_rgba(99,102,241,0.7)]",
  secondary: "bg-surface-700 hover:bg-surface-600 text-white border border-surface-500",
  accent:    "bg-accent-500 hover:bg-accent-400 text-white shadow-glow-accent",
  ghost:     "bg-transparent hover:bg-surface-700 text-slate-300 hover:text-white",
  danger:    "bg-red-600 hover:bg-red-700 text-white",
  outline:   "border border-brand-500 text-brand-400 hover:bg-brand-500/10",
} as const;

const sizeVariants = {
  sm:  "px-3 py-1.5 text-sm gap-1.5",
  md:  "px-5 py-2.5 text-sm gap-2",
  lg:  "px-7 py-3.5 text-base gap-2.5",
  xl:  "px-9 py-4 text-lg gap-3",
  icon:"p-2.5",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize    = keyof typeof sizeVariants;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, leftIcon, rightIcon, children, className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-xl
          transition-all duration-200 cursor-pointer
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonVariants[variant]}
          ${sizeVariants[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : leftIcon}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";
