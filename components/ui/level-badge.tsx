"use client";

interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
};

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-primary font-display font-bold text-white ${sizeStyles[size]}`}
    >
      {level}
      {level >= 10 && (
        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-xp rounded-full border-2 border-bg-elevated" />
      )}
    </div>
  );
}
