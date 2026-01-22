"use client";

import { cn } from "@/lib/utils";
import { CategoryType } from "@/types/budget";

interface BudgetProgressBarProps {
  actual: number;
  budgeted: number;
  monthlyPaceStatus: string;
  categoryType: CategoryType;
  className?: string;
  showPercentage?: boolean;
}

export function BudgetProgressBar({
  actual,
  budgeted,
  monthlyPaceStatus,
  categoryType,
  className = "",
  showPercentage = true,
}: BudgetProgressBarProps) {
  // Calculate percentage of budget used
  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const barPercentage = Math.min(Math.max(percentage, 0), 100);

  // Determine color based on status and amount
  const getBarColor = () => {
    if (actual > budgeted) {
      return categoryType === CategoryType.Expense
        ? "bg-red-500"
        : "bg-green-500"; // Over budget
    }

    if (monthlyPaceStatus === "ahead") {
      return categoryType === CategoryType.Expense
        ? "bg-yellow-500"
        : "bg-green-500"; // Ahead of pace but under budget
    }

    return categoryType === CategoryType.Expense
      ? "bg-green-500"
      : "bg-yellow-500"; // On track or behind
  };

  const getBarBackgroundColor = () => {
    if (actual > budgeted) {
      return categoryType === CategoryType.Expense
        ? "bg-red-100"
        : "bg-green-100"; // Over budget
    }

    if (monthlyPaceStatus === "ahead") {
      return categoryType === CategoryType.Expense
        ? "bg-yellow-100"
        : "bg-green-100"; // Ahead of pace
    }

    return categoryType === CategoryType.Expense
      ? "bg-green-100"
      : "bg-yellow-100"; // On track
  };

  const getTextColor = () => {
    if (actual > budgeted) {
      return categoryType === CategoryType.Expense
        ? "text-red-700"
        : "text-green-700";
    }

    if (monthlyPaceStatus === "ahead") {
      return categoryType === CategoryType.Expense
        ? "text-yellow-700"
        : "text-green-700";
    }

    return categoryType === CategoryType.Expense
      ? "text-green-700"
      : "text-yellow-700";
  };

  return (
    <div className={cn("space-y-1", className)}>
      {/* Progress bar container */}
      <div
        className={cn(
          "relative w-full h-2 rounded-full overflow-hidden",
          getBarBackgroundColor(),
        )}
      >
        {/* Progress bar fill */}
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            getBarColor(),
          )}
          style={{ width: `${barPercentage}%` }}
        />

        {/* Overflow indicator for over-budget */}
        {percentage > 100 && (
          <div
            className={cn(
              "absolute inset-0 opacity-20 animate-pulse",
              getBarColor(),
            )}
          />
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
