"use client";

import { useEffect, useState } from "react";

interface XPBarProps {
  currentXp: number;
  requiredXp: number;
  animate?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const heightStyles = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function XPBar({
  currentXp,
  requiredXp,
  animate = true,
  showLabel = true,
  size = "md",
}: XPBarProps) {
  const [progress, setProgress] = useState(animate ? 0 : (currentXp / requiredXp) * 100);
  const percent = Math.min((currentXp / requiredXp) * 100, 100);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setProgress(percent), 100);
      return () => clearTimeout(timer);
    }
  }, [percent, animate]);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-baseline mb-1.5">
          <span className="text-xs text-text-secondary">
            <span className="font-mono font-semibold text-xp">{currentXp}</span>
            <span className="text-text-dim"> / {requiredXp} XP</span>
          </span>
          <span className="text-xs text-text-dim font-mono">{Math.round(percent)}%</span>
        </div>
      )}
      <div className={`w-full bg-bg-hover rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
