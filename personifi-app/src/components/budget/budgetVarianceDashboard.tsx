"use client";

import { useState } from "react";
import { BudgetSetupModal } from "./budgetSetupModal";
import { TransactionModal } from "./transactionModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Settings, Plus, ChevronDown, ChevronUp } from "lucide-react";

// Mock data types
interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  notes?: string;
}

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
  recentTransactions: Transaction[];
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
    expectedSpendToDate: 750,
    recentTransactions: [
      { id: 1, amount: 800, description: "Monthly rent", date: "2024-01-01" },
      { id: 2, amount: 400, description: "Council tax", date: "2024-01-05" },
    ]
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
    recentTransactions: [
      { id: 3, amount: 45, description: "Tesco grocery shop", date: "2024-01-03" },
      { id: 4, amount: 65, description: "Sainsbury's weekly shop", date: "2024-01-07" },
      { id: 5, amount: 12, description: "Takeaway coffee", date: "2024-01-08" },
      { id: 6, amount: 28, description: "Restaurant lunch", date: "2024-01-10" },
      { id: 7, amount: 170, description: "Weekly groceries", date: "2024-01-12" },
    ]
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
    recentTransactions: [
      { id: 8, amount: 150, description: "Monthly tube pass", date: "2024-01-01" },
      { id: 9, amount: 25, description: "Uber ride", date: "2024-01-06" },
      { id: 10, amount: 105, description: "Petrol fill-up", date: "2024-01-09" },
    ]
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
    recentTransactions: [
      { id: 11, amount: 45, description: "Cinema tickets", date: "2024-01-04" },
      { id: 12, amount: 80, description: "Concert tickets", date: "2024-01-08" },
      { id: 13, amount: 125, description: "Weekend trip", date: "2024-01-11" },
    ]
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
    recentTransactions: [
      { id: 14, amount: 4500, description: "Monthly salary", date: "2024-01-01" },
    ]
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
    recentTransactions: [
      { id: 15, amount: 300, description: "Website project", date: "2024-01-05" },
      { id: 16, amount: 300, description: "Consulting work", date: "2024-01-10" },
    ]
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

const getExpenseStatusColor = (variance: number, monthlyPaceStatus: string) => {
  if (variance > 0) return "text-red-600"; // Over budget
  if (monthlyPaceStatus === 'ahead') return "text-orange-600"; // Spending fast
  return "text-blue-600"; // On track
};

const getExpenseStatusText = (variance: number, monthlyPaceStatus: string) => {
  if (variance > 0) return "Over Budget";
  if (monthlyPaceStatus === 'ahead') return "Spending Fast";
  return "On Track";
};

export function BudgetVarianceDashboard() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; type: 'income' | 'expense' } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [transactionLimit, setTransactionLimit] = useState<3 | 5 | 10>(5);

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

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const openTransactionModal = (categoryName?: string, categoryType?: 'income' | 'expense') => {
    if (categoryName && categoryType) {
      setSelectedCategory({ name: categoryName, type: categoryType });
    } else {
      setSelectedCategory(null);
    }
    setIsTransactionModalOpen(true);
  };

  const closeTransactionModal = () => {
    setIsTransactionModalOpen(false);
    setSelectedCategory(null);
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualIncome)}</div>
            <div className="text-sm text-muted-foreground">
              Budget: {formatCurrency(totalBudgetedIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalActualExpenses)}</div>
            <div className="text-sm text-muted-foreground">
              Budget: {formatCurrency(totalBudgetedExpenses)}
            </div>
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
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium rounded-tl-lg w-1/4">Category</th>
                  <th className="text-right py-3 px-4 font-medium w-1/6"></th>
                  <th className="text-right py-3 px-4 font-medium w-1/4">Expected</th>
                  <th className="text-right py-3 px-4 font-medium w-1/4">Actual</th>
                  <th className="text-right py-3 px-4 font-medium rounded-tr-lg w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((item) => (
                  <>
                    <tr 
                      key={item.categoryId} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.categoryId)}
                    >
                      <td className="py-3 px-4 font-medium bg-blue-50 border-r border-blue-100">{item.categoryName}</td>
                      <td className="text-right py-3 px-4"></td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.actual)}</td>
                      <td className="text-right py-3 px-4">
                        {expandedCategories.has(item.categoryId) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedCategories.has(item.categoryId) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-blue-25 border-l-4 border-blue-200">
                          <div className="space-y-1">
                            {item.recentTransactions.slice(0, 5).map((transaction) => (
                              <div key={transaction.id} className="flex justify-between items-center py-1 text-sm">
                                <div className="flex-1">
                                  <span className="font-medium">{transaction.description}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {new Date(transaction.date).toLocaleDateString('en-GB')}
                                  </span>
                                </div>
                                <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                              </div>
                            ))}
                            {item.recentTransactions.length === 0 && (
                              <div className="text-sm text-muted-foreground py-2">
                                No transactions this month
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium rounded-tl-lg w-1/4">Category</th>
                  <th className="text-right py-3 px-4 font-medium w-1/6">On Track</th>
                  <th className="text-right py-3 px-4 font-medium w-1/4">Budgeted</th>
                  <th className="text-right py-3 px-4 font-medium w-1/4">Actual</th>
                  <th className="text-right py-3 px-4 font-medium rounded-tr-lg w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map((item) => (
                  <>
                    <tr 
                      key={item.categoryId} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.categoryId)}
                    >
                      <td className="py-3 px-4 font-medium bg-red-50 border-r border-red-100">{item.categoryName}</td>
                      <td className={cn("text-right py-3 px-4 text-sm font-medium", getExpenseStatusColor(item.variance, item.monthlyPaceStatus))}>
                        {getExpenseStatusText(item.variance, item.monthlyPaceStatus)}
                      </td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.actual)}</td>
                      <td className="text-right py-3 px-4">
                        {expandedCategories.has(item.categoryId) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedCategories.has(item.categoryId) && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 bg-red-25 border-l-4 border-red-200">
                          <div className="space-y-1">
                            {item.recentTransactions.slice(0, 5).map((transaction) => (
                              <div key={transaction.id} className="flex justify-between items-center py-1 text-sm">
                                <div className="flex-1">
                                  <span className="font-medium">{transaction.description}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {new Date(transaction.date).toLocaleDateString('en-GB')}
                                  </span>
                                </div>
                                <span className="font-medium">{formatCurrency(transaction.amount)}</span>
                              </div>
                            ))}
                            {item.recentTransactions.length === 0 && (
                              <div className="text-sm text-muted-foreground py-2">
                                No transactions this month
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => openTransactionModal()}
          size="lg"
          className="h-12 px-6 rounded-full bg-finance-green hover:bg-finance-green-dark shadow-lg font-medium"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Budget Setup Modal */}
      <BudgetSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        currentMonth={currentMonth}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={closeTransactionModal}
        preSelectedCategory={selectedCategory?.name}
        preSelectedType={selectedCategory?.type}
      />
    </div>
  );
}