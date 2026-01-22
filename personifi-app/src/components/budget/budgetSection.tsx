import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { CategoryIcon } from "@/components/ui/categoryIcon";
import { BudgetProgressBar } from "./budgetProgressBar";
import { TransactionTable } from "./transactionTable";
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { Pill } from "@/components/ui/pill";
import { cn } from "@/lib/utils";
import { CategoryType } from "@/types/budget";

interface BudgetSectionProps {
  title: string;
  description: string;
  data: BudgetVarianceWithTransactions[];
  type: "income" | "expense";
  expandedCategories: Set<number>;
  onToggleExpand: (categoryId: number) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};

export function BudgetSection({
  title,
  description,
  data,
  type,
  expandedCategories,
  onToggleExpand,
}: BudgetSectionProps) {
  const categoryType =
    type === "income" ? CategoryType.Income : CategoryType.Expense;
  const actualColorClass =
    categoryType === CategoryType.Income ? "text-green-600" : "text-red-600";
  const categoryCellClass =
    categoryType === CategoryType.Income
      ? "bg-blue-50 border-r border-blue-100"
      : "bg-red-50 border-r border-red-100";
  const totalActual = data.reduce((sum, item) => sum + item.actual, 0);
  const totalBudgeted = data.reduce((sum, item) => sum + item.budgeted, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap justify-end gap-2">
            <Pill>
              <span className="text-[0.65rem] sm:text-xs font-medium">
                actual
              </span>
              <span>{formatCurrency(totalActual)}</span>
            </Pill>
            <Pill variant="muted">
              <span className="text-[0.65rem] sm:text-xs font-medium">
                budgeted
              </span>
              <span>{formatCurrency(totalBudgeted)}</span>
            </Pill>
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="px-3 sm:px-6">
        {/* Mobile Card Layout */}
        <div className="block md:hidden space-y-3">
          {data.map((item) => (
            <div key={item.category.id} className="border rounded-lg">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onToggleExpand(item.category.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CategoryIcon
                        icon={item.category.icon}
                        color={item.category.color}
                        size="lg"
                      />
                      <div>
                        <div className="font-semibold text-base">
                          {item.category.name}
                        </div>
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">
                            Actual:{" "}
                            <span
                              className={cn("font-medium", actualColorClass)}
                            >
                              {formatCurrency(item.actual)}
                            </span>
                          </div>
                          <div className="text-muted-foreground">
                            Budget:{" "}
                            <span className="font-medium">
                              {formatCurrency(item.budgeted)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {expandedCategories.has(item.category.id) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <BudgetProgressBar
                    actual={item.actual}
                    budgeted={item.budgeted}
                    monthlyPaceStatus={item.monthlyPaceStatus}
                    className="w-full"
                    showPercentage={true}
                    categoryType={categoryType}
                  />
                </div>
              </div>
              {expandedCategories.has(item.category.id) && (
                <div className="border-t bg-gray-50/50">
                  <TransactionTable
                    transactions={item.recentTransactions}
                    variant={type}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed min-w-[600px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium rounded-tl-lg text-xs sm:text-sm w-1/4">
                  Category
                </th>
                <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">
                  Actual
                </th>
                <th className="text-center py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">
                  Progress
                </th>
                <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">
                  Budget
                </th>
                <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium rounded-tr-lg text-xs sm:text-sm w-1/12"></th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <React.Fragment key={item.category.id}>
                  <tr
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => onToggleExpand(item.category.id)}
                  >
                    <td
                      className={cn(
                        "py-2 sm:py-3 px-2 sm:px-4 font-medium text-xs sm:text-sm",
                        categoryCellClass,
                      )}
                    >
                      <div className="flex items-center space-x-2">
                        <CategoryIcon
                          icon={item.category.icon}
                          color={item.category.color}
                          size="sm"
                        />
                        <span>{item.category.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-2 sm:py-3 px-1 sm:px-4 font-semibold text-xs sm:text-sm">
                      {formatCurrency(item.actual)}
                    </td>
                    <td className="py-2 sm:py-3 px-1 sm:px-4">
                      <BudgetProgressBar
                        actual={item.actual}
                        budgeted={item.budgeted}
                        monthlyPaceStatus={item.monthlyPaceStatus}
                        className="w-full"
                        showPercentage={false}
                        categoryType={categoryType}
                      />
                    </td>
                    <td className="text-right py-2 sm:py-3 px-1 sm:px-4 text-xs sm:text-sm">
                      {formatCurrency(item.budgeted)}
                    </td>
                    <td className="text-right py-2 sm:py-3 px-1 sm:px-4">
                      {expandedCategories.has(item.category.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  {expandedCategories.has(item.category.id) && (
                    <tr>
                      <td colSpan={5} className="p-0">
                        <TransactionTable
                          transactions={item.recentTransactions}
                          variant={type}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
