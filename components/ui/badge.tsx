import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "primary" | "xp" | "streak" | "success";
  size?: "sm" | "md";
}

const variants = {
  default: "bg-surface-light text-text-secondary",
  primary: "bg-primary-muted text-primary",
  xp: "bg-xp/10 text-xp",
  streak: "bg-streak-muted text-streak",
  success: "bg-success-muted text-success",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}
