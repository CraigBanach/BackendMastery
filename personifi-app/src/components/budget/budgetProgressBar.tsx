"use client";

import { cn } from "@/lib/utils";

interface BudgetProgressBarProps {
  actual: number;
  budgeted: number;
  monthlyPaceStatus: string;
  className?: string;
  showPercentage?: boolean;
}

export function BudgetProgressBar({
  actual,
  budgeted,
  monthlyPaceStatus,
  className = "",
  showPercentage = true,
}: BudgetProgressBarProps) {
  // Calculate percentage of budget used
  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const barPercentage = Math.min(Math.max(percentage, 0), 100);


  // Determine color based on status and amount
  const getBarColor = () => {
    if (actual > budgeted) {
      return "bg-red-500"; // Over budget - red
    }

    if (monthlyPaceStatus === "ahead") {
      return "bg-yellow-500"; // Ahead of pace but under budget - yellow
    }

    return "bg-green-500"; // On track or behind - green
  };

  const getBarBackgroundColor = () => {
    if (actual > budgeted) {
      return "bg-red-100"; // Over budget - red background
    }

    if (monthlyPaceStatus === "ahead") {
      return "bg-yellow-100"; // Ahead of pace - yellow background
    }

    return "bg-green-100"; // On track - green background
  };

  const getTextColor = () => {
    if (actual > budgeted) {
      return "text-red-700";
    }

    if (monthlyPaceStatus === "ahead") {
      return "text-yellow-700";
    }

    return "text-green-700";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {/* Progress bar container */}
      <div
        className={cn(
          "relative w-full h-2 rounded-full overflow-hidden",
          getBarBackgroundColor()
        )}
      >
        {/* Progress bar fill */}
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            getBarColor()
          )}
          style={{ width: `${barPercentage}%` }}

        />

        {/* Overflow indicator for over-budget */}
        {percentage > 100 && (
          <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse" />
        )}
      </div>

      {/* Percentage text */}
      {showPercentage && (
        <div className={cn("text-xs font-medium text-right", getTextColor())}>
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
}
