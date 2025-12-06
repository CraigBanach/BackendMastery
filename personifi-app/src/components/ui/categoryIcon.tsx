import React from "react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: string;
  color?: string | null;
  size?: "sm" | "lg";
  className?: string;
}

export function CategoryIcon({ icon, color, size = "sm", className }: CategoryIconProps) {
  const iconSizeClass = size === "lg" ? "text-2xl" : "text-lg";
  const badgeSizeClass = size === "lg" ? "h-3 w-3" : "h-2.5 w-2.5";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <span className={iconSizeClass}>{icon}</span>
      {color && (
        <span
          className={cn(
            "absolute -bottom-1 -right-1 rounded-full border-2 border-white",
            badgeSizeClass
          )}
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  );
}
