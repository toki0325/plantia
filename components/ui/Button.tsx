import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-[var(--color-primary,#2F4B3C)] text-white hover:bg-[#263D30]",
  secondary:
    "bg-transparent border border-[var(--color-primary,#2F4B3C)] text-[var(--color-primary,#2F4B3C)] hover:bg-[var(--color-ivory,#F5F1E8)]",
  accent:
    "bg-[var(--color-accent,#C6A45C)] text-white hover:bg-[#b8934a]",
  ghost: "bg-transparent text-[var(--color-primary,#2F4B3C)] hover:bg-[var(--color-ivory,#F5F1E8)]",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  href?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center px-6 py-3 text-sm font-medium rounded-[2px] transition-colors disabled:opacity-50 ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
