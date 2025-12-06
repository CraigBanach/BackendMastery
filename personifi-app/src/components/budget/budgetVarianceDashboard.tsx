import React, { useState } from "react";
import { BudgetSetupModal } from "./budgetSetupModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { CategoryDto, CategoryType } from "@/types/budget";
import { RadialProgress } from "./radialProgress";
import { BudgetSection } from "./budgetSection";

interface BudgetVarianceDashboardProps {
  data?: BudgetVarianceWithTransactions[];
  year?: number;
  month?: number;
  onMonthChange?: (year: number, month: number) => Promise<void>;
  categories?: CategoryDto[];
  existingBudgets?: Array<{ categoryId: number; amount: number }>;
  onBudgetSaved?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};

export function BudgetVarianceDashboard({
  data: budgetData = [],
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  onMonthChange,
  categories = [],
  existingBudgets = [],
  onBudgetSaved,
}: BudgetVarianceDashboardProps = {}) {
  const [loading, setLoading] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );

  const monthName = new Date(year, month - 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const monthNameMobile = new Date(year, month - 1).toLocaleDateString(
    "en-GB",
    {
      month: "short",
      year: "2-digit",
    }
  );

  const navigateMonth = async (direction: "prev" | "next") => {
    let newMonth = month;
    let newYear = year;

    if (direction === "prev") {
      newMonth = month === 1 ? 12 : month - 1;
      newYear = month === 1 ? year - 1 : year;
    } else {
      newMonth = month === 12 ? 1 : month + 1;
      newYear = month === 12 ? year + 1 : year;
    }

    if (onMonthChange) {
      setLoading(true);
      try {
        await onMonthChange(newYear, newMonth);
      } catch (error) {
        console.error("Error loading month data:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const expenseData = budgetData.filter(
    (item) => item.category.type === CategoryType.Expense
  );
  const incomeData = budgetData.filter(
    (item) => item.category.type === CategoryType.Income
  );

  const totalBudgetedExpenses = expenseData.reduce(
    (sum, item) => sum + item.budgeted,
    0
  );
  const totalActualExpenses = expenseData.reduce(
    (sum, item) => sum + item.actual,
    0
  );

  const totalBudgetedIncome = incomeData.reduce(
    (sum, item) => sum + item.budgeted,
    0
  );
  const totalActualIncome = incomeData.reduce(
    (sum, item) => sum + item.actual,
    0
  );

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <Card>
        <CardHeader className="space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Mobile: Full-width navigation with pinned arrows */}
            <div className="flex sm:hidden items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                disabled={loading}
                className="flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg font-semibold text-center flex-1">
                {monthNameMobile}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                disabled={loading}
                className="flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Desktop: Grouped navigation */}
            <div className="hidden sm:flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl font-semibold">
                {monthName}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                disabled={loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSetupModalOpen(true)}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Budgets
            </Button>
          </div>
        </CardHeader>
      </Card>

      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              {/* TODO: Replace loading spinner with skeleton components that match layout structure */}
              {/* - Budget variance table skeleton */}
              {/* - Summary cards skeleton */}
              {/* - Transaction list skeleton */}
              {/* - Category rows skeleton */}
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading budget data...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2">
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-bold">
                  {formatCurrency(totalActualIncome)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Budget: {formatCurrency(totalBudgetedIncome)}
                </div>
              </div>
              <RadialProgress
                actual={totalActualIncome}
                budgeted={totalBudgetedIncome}
                title=""
                type="income"
                size={60}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base sm:text-xl md:text-2xl font-bold">
                  {formatCurrency(totalActualExpenses)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Budget: {formatCurrency(totalBudgetedExpenses)}
                </div>
              </div>
              <RadialProgress
                actual={totalActualExpenses}
                budgeted={totalBudgetedExpenses}
                title=""
                type="expense"
                size={60}
                className="flex-shrink-0"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Income Section */}
      <BudgetSection
        title="Income"
        description={`Your income sources for ${monthName}`}
        data={incomeData}
        type="income"
        expandedCategories={expandedCategories}
        onToggleExpand={toggleCategoryExpansion}
      />

      {/* Expenses Section */}
      <BudgetSection
        title="Expenses"
        description={`Your spending by category for ${monthName}`}
        data={expenseData}
        type="expense"
        expandedCategories={expandedCategories}
        onToggleExpand={toggleCategoryExpansion}
      />

      <BudgetSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentMonth={new Date(year, month - 1)}
        categories={categories}
        existingBudgets={existingBudgets}
        onBudgetSaved={() => {
          onBudgetSaved?.();
          setIsSetupModalOpen(false);
        }}
      />
    </div>
  );
}
