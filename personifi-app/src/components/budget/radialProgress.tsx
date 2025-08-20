"use client";

import { cn } from "@/lib/utils";

interface RadialProgressProps {
  actual: number;
  budgeted: number;
  title: string;
  type: "income" | "expense";
  className?: string;
  size?: number;
}

export function RadialProgress({ 
  actual, 
  budgeted, 
  title, 
  type,
  className = "",
  size = 120 
}: RadialProgressProps) {
  const percentage = budgeted > 0 ? Math.min((actual / budgeted) * 100, 120) : 0;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color scheme based on type and performance
  const getColors = () => {
    if (type === "income") {
      if (percentage >= 100) return { stroke: "stroke-green-500", bg: "stroke-green-100", text: "text-green-700" };
      if (percentage >= 80) return { stroke: "stroke-blue-500", bg: "stroke-blue-100", text: "text-blue-700" };
      return { stroke: "stroke-yellow-500", bg: "stroke-yellow-100", text: "text-yellow-700" };
    } else {
      // Expense logic
      if (percentage > 100) return { stroke: "stroke-red-500", bg: "stroke-red-100", text: "text-red-700" };
      if (percentage >= 80) return { stroke: "stroke-yellow-500", bg: "stroke-yellow-100", text: "text-yellow-700" };
      return { stroke: "stroke-green-500", bg: "stroke-green-100", text: "text-green-700" };
    }
  };

  const colors = getColors();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      {/* Radial Progress Circle */}
      <div className="relative">
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn("stroke-2", colors.bg)}
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            className={cn("stroke-3 transition-all duration-500 ease-out", colors.stroke)}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={cn("text-lg font-bold", colors.text)}>
            {percentage.toFixed(0)}%
          </div>
          <div className="text-xs text-muted-foreground text-center">
            {title}
          </div>
        </div>
      </div>

      {/* Summary text */}
      <div className="text-center space-y-1">
        <div className={cn("text-sm font-semibold", colors.text)}>
          {formatCurrency(actual)}
        </div>
        <div className="text-xs text-muted-foreground">
          of {formatCurrency(budgeted)}
        </div>
      </div>
    </div>
  );
}