"use client";

import React, { useState, useEffect } from "react";
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
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { CategoryDto } from "@/types/budget";

interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  notes?: string;
}

interface BudgetVarianceDashboardProps {
  initialData?: BudgetVarianceWithTransactions[];
  currentYear?: number;
  currentMonth?: number;
  onMonthChange?: (year: number, month: number) => Promise<BudgetVarianceWithTransactions[]>;
  categories?: CategoryDto[];
  existingBudgets?: Array<{ categoryId: number; amount: number; }>;
  onBudgetSaved?: () => void;
}

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
  if (monthlyPaceStatus === 'ahead') return "text-yellow-600"; // Spending fast
  return "text-blue-600"; // On track
};

const getExpenseStatusText = (variance: number, monthlyPaceStatus: string) => {
  if (variance > 0) return "Over Budget";
  if (monthlyPaceStatus === 'ahead') return "Spending Fast";
  return "On Track";
};

export function BudgetVarianceDashboard({ 
  initialData = [], 
  currentYear = new Date().getFullYear(),
  currentMonth: initialMonth = new Date().getMonth() + 1,
  onMonthChange,
  categories = [],
  existingBudgets = [],
  onBudgetSaved
}: BudgetVarianceDashboardProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [year, setYear] = useState(currentYear);
  const [budgetData, setBudgetData] = useState<BudgetVarianceWithTransactions[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ name: string; type: 'income' | 'expense' } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [transactionLimit, setTransactionLimit] = useState<3 | 5 | 10>(5);

  const monthName = new Date(year, currentMonth - 1).toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });

  const navigateMonth = async (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = year;
    
    if (direction === 'prev') {
      newMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      newYear = currentMonth === 1 ? year - 1 : year;
    } else {
      newMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      newYear = currentMonth === 12 ? year + 1 : year;
    }
    
    setCurrentMonth(newMonth);
    setYear(newYear);
    
    if (onMonthChange) {
      setLoading(true);
      try {
        const newData = await onMonthChange(newYear, newMonth);
        setBudgetData(newData);
      } catch (error) {
        console.error('Error loading month data:', error);
      } finally {
        setLoading(false);
      }
    }
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

  const expenseData = budgetData.filter(item => item.category.type === 'expense');
  const incomeData = budgetData.filter(item => item.category.type === 'income');

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
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">{monthName}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading budget data...</span>
            </div>
          </CardContent>
        </Card>
      )}

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
                  <React.Fragment key={item.category.id}>
                    <tr 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.category.id)}
                    >
                      <td className="py-3 px-4 font-medium bg-blue-50 border-r border-blue-100">{item.category.name}</td>
                      <td className="text-right py-3 px-4"></td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.actual)}</td>
                      <td className="text-right py-3 px-4">
                        {expandedCategories.has(item.category.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedCategories.has(item.category.id) && (
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
                  </React.Fragment>
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
                  <React.Fragment key={item.category.id}>
                    <tr 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.category.id)}
                    >
                      <td className="py-3 px-4 font-medium bg-red-50 border-r border-red-100">{item.category.name}</td>
                      <td className={cn("text-right py-3 px-4 text-sm font-medium", getExpenseStatusColor(item.variance, item.monthlyPaceStatus))}>
                        {getExpenseStatusText(item.variance, item.monthlyPaceStatus)}
                      </td>
                      <td className="text-right py-3 px-4">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-3 px-4 font-semibold">{formatCurrency(item.actual)}</td>
                      <td className="text-right py-3 px-4">
                        {expandedCategories.has(item.category.id) ? (
                          <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    </tr>
                    {expandedCategories.has(item.category.id) && (
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
                  </React.Fragment>
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
        currentMonth={new Date(year, currentMonth - 1)}
        categories={categories}
        existingBudgets={existingBudgets}
        onBudgetSaved={() => {
          onBudgetSaved?.();
          setIsSetupModalOpen(false);
        }}
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