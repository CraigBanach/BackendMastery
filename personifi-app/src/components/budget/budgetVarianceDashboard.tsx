"use client";

import { useState } from "react";
import { BudgetSetupModal } from "./budgetSetupModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";

// Mock data types
interface BudgetVariance {
  categoryId: number;
  categoryName: string;
  categoryType: 'expense' | 'income';
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  monthlyPaceStatus: 'on-track' | 'ahead' | 'behind';
  expectedSpendToDate: number;
}

// Mock data - this will be replaced with API calls
const mockBudgetData: BudgetVariance[] = [
  {
    categoryId: 1,
    categoryName: "Housing",
    categoryType: 'expense',
    budgeted: 1500,
    actual: 1200,
    variance: -300,
    variancePercentage: -20,
    monthlyPaceStatus: 'behind',
    expectedSpendToDate: 750, // 15 days into month
  },
  {
    categoryId: 2,
    categoryName: "Food",
    categoryType: 'expense',
    budgeted: 500,
    actual: 320,
    variance: -180,
    variancePercentage: -36,
    monthlyPaceStatus: 'behind',
    expectedSpendToDate: 250,
  },
  {
    categoryId: 3,
    categoryName: "Transportation",
    categoryType: 'expense',
    budgeted: 300,
    actual: 280,
    variance: -20,
    variancePercentage: -6.7,
    monthlyPaceStatus: 'ahead',
    expectedSpendToDate: 150,
  },
  {
    categoryId: 4,
    categoryName: "Entertainment",
    categoryType: 'expense',
    budgeted: 200,
    actual: 250,
    variance: 50,
    variancePercentage: 25,
    monthlyPaceStatus: 'ahead',
    expectedSpendToDate: 100,
  },
  {
    categoryId: 5,
    categoryName: "Salary",
    categoryType: 'income',
    budgeted: 4500,
    actual: 4500,
    variance: 0,
    variancePercentage: 0,
    monthlyPaceStatus: 'on-track',
    expectedSpendToDate: 2250,
  },
  {
    categoryId: 6,
    categoryName: "Freelance",
    categoryType: 'income',
    budgeted: 800,
    actual: 600,
    variance: -200,
    variancePercentage: -25,
    monthlyPaceStatus: 'behind',
    expectedSpendToDate: 400,
  },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

const getVarianceColor = (variance: number, isIncome: boolean) => {
  if (variance === 0) return "text-gray-600";
  
  // For income: positive variance is good (more income), negative is bad (less income)
  // For expenses: negative variance is good (under budget), positive is bad (over budget)
  const isGood = isIncome ? variance > 0 : variance < 0;
  return isGood ? "text-green-600" : "text-red-600";
};

const getPaceStatusColor = (status: string) => {
  switch (status) {
    case 'on-track': return "text-blue-600";
    case 'ahead': return "text-orange-600";
    case 'behind': return "text-green-600";
    default: return "text-gray-600";
  }
};

const getPaceStatusText = (status: string, isIncome: boolean) => {
  if (isIncome) {
    switch (status) {
      case 'on-track': return "On track";
      case 'ahead': return "Ahead of schedule";
      case 'behind': return "Behind schedule";
      default: return "Unknown";
    }
  } else {
    switch (status) {
      case 'on-track': return "On track";
      case 'ahead': return "Spending fast";
      case 'behind': return "Under budget";
      default: return "Unknown";
    }
  }
};

export function BudgetVarianceDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  const monthName = currentMonth.toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const expenseData = mockBudgetData.filter(item => item.categoryType === 'expense');
  const incomeData = mockBudgetData.filter(item => item.categoryType === 'income');

  const totalBudgetedExpenses = expenseData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActualExpenses = expenseData.reduce((sum, item) => sum + item.actual, 0);
  const totalExpenseVariance = totalActualExpenses - totalBudgetedExpenses;

  const totalBudgetedIncome = incomeData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActualIncome = incomeData.reduce((sum, item) => sum + item.actual, 0);
  const totalIncomeVariance = totalActualIncome - totalBudgetedIncome;

  const netBudgeted = totalBudgetedIncome - totalBudgetedExpenses;
  const netActual = totalActualIncome - totalActualExpenses;
  const netVariance = netActual - netBudgeted;

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{monthName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsSetupModalOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Budgets
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualIncome)}</div>
            <div className={cn("text-sm flex items-center space-x-1", getVarianceColor(totalIncomeVariance, true))}>
              <span>{formatCurrency(totalIncomeVariance)}</span>
              <span>vs budget</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualExpenses)}</div>
            <div className={cn("text-sm flex items-center space-x-1", getVarianceColor(totalExpenseVariance, false))}>
              <span>{formatCurrency(Math.abs(totalExpenseVariance))}</span>
              <span>{totalExpenseVariance < 0 ? 'under' : 'over'} budget</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(netActual)}</div>
            <div className={cn("text-sm flex items-center space-x-1", getVarianceColor(netVariance, true))}>
              <span>{formatCurrency(netVariance)}</span>
              <span>vs budget</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15/30</div>
            <div className="text-sm text-muted-foreground">Days into month</div>
          </CardContent>
        </Card>
      </div>

      {/* Income Section */}
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
          <CardDescription>Your income sources for {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-right py-2 font-medium">Budgeted</th>
                  <th className="text-right py-2 font-medium">Actual</th>
                  <th className="text-right py-2 font-medium">Variance</th>
                  <th className="text-right py-2 font-medium">Variance %</th>
                  <th className="text-right py-2 font-medium">Monthly Pace</th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((item) => (
                  <tr key={item.categoryId} className="border-b">
                    <td className="py-3 font-medium">{item.categoryName}</td>
                    <td className="text-right py-3">{formatCurrency(item.budgeted)}</td>
                    <td className="text-right py-3">{formatCurrency(item.actual)}</td>
                    <td className={cn("text-right py-3", getVarianceColor(item.variance, true))}>
                      {formatCurrency(item.variance)}
                    </td>
                    <td className={cn("text-right py-3", getVarianceColor(item.variance, true))}>
                      {item.variancePercentage.toFixed(1)}%
                    </td>
                    <td className={cn("text-right py-3 text-sm", getPaceStatusColor(item.monthlyPaceStatus))}>
                      {getPaceStatusText(item.monthlyPaceStatus, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Your spending by category for {monthName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Category</th>
                  <th className="text-right py-2 font-medium">Budgeted</th>
                  <th className="text-right py-2 font-medium">Actual</th>
                  <th className="text-right py-2 font-medium">Variance</th>
                  <th className="text-right py-2 font-medium">Variance %</th>
                  <th className="text-right py-2 font-medium">Monthly Pace</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map((item) => (
                  <tr key={item.categoryId} className="border-b">
                    <td className="py-3 font-medium">{item.categoryName}</td>
                    <td className="text-right py-3">{formatCurrency(item.budgeted)}</td>
                    <td className="text-right py-3">{formatCurrency(item.actual)}</td>
                    <td className={cn("text-right py-3", getVarianceColor(item.variance, false))}>
                      {formatCurrency(Math.abs(item.variance))}
                      {item.variance !== 0 && (
                        <span className="ml-1 text-xs">
                          {item.variance < 0 ? 'under' : 'over'}
                        </span>
                      )}
                    </td>
                    <td className={cn("text-right py-3", getVarianceColor(item.variance, false))}>
                      {Math.abs(item.variancePercentage).toFixed(1)}%
                    </td>
                    <td className={cn("text-right py-3 text-sm", getPaceStatusColor(item.monthlyPaceStatus))}>
                      {getPaceStatusText(item.monthlyPaceStatus, false)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Budget Setup Modal */}
      <BudgetSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentMonth={currentMonth}
      />
    </div>
  );
}