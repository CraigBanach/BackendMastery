"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigationProps {
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
}

export function MonthNavigation({ currentYear, currentMonth, onMonthChange }: MonthNavigationProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      onMonthChange(currentYear - 1, 12);
    } else {
      onMonthChange(currentYear, currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      onMonthChange(currentYear + 1, 1);
    } else {
      onMonthChange(currentYear, currentMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentYear === now.getFullYear() && currentMonth === now.getMonth() + 1;
  };

  return (
    <div className="flex items-center justify-between">
      <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold">
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        {!isCurrentMonth() && (
          <Button variant="ghost" size="sm" onClick={handleCurrentMonth}>
            Current Month
          </Button>
        )}
      </div>
      
      <Button variant="outline" size="sm" onClick={handleNextMonth}>
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}