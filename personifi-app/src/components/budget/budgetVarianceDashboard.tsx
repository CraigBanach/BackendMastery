"use client";

import React, { useState } from "react";
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
import { CategoryDto, CategoryType } from "@/types/budget";
import { TransactionTable } from "./transactionTable";

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

  const monthName = new Date(year, currentMonth - 1).toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  const monthNameMobile = new Date(year, currentMonth - 1).toLocaleDateString('en-GB', { 
    month: 'short', 
    year: '2-digit' 
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

  const expenseData = budgetData.filter(item => item.category.type === CategoryType.Expense);
  const incomeData = budgetData.filter(item => item.category.type === CategoryType.Income);

  const totalBudgetedExpenses = expenseData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActualExpenses = expenseData.reduce((sum, item) => sum + item.actual, 0);

  const totalBudgetedIncome = incomeData.reduce((sum, item) => sum + item.budgeted, 0);
  const totalActualIncome = incomeData.reduce((sum, item) => sum + item.actual, 0);

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
                onClick={() => navigateMonth('prev')}
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
                onClick={() => navigateMonth('next')}
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
                onClick={() => navigateMonth('prev')}
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
            <CardTitle className="text-xs sm:text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold">{formatCurrency(totalActualIncome)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Budget: {formatCurrency(totalBudgetedIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
            <div className="text-base sm:text-xl md:text-2xl font-bold">{formatCurrency(totalActualExpenses)}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">
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
        <CardContent className="px-3 sm:px-6">
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {incomeData.map((item) => (
              <div key={item.category.id} className="border rounded-lg">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategoryExpansion(item.category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.category.icon}</span>
                      <div>
                        <div className="font-semibold text-base">{item.category.name}</div>
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">
                            Actual: <span className="font-medium text-green-600">{formatCurrency(item.actual)}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Budget: <span className="font-medium">{formatCurrency(item.budgeted)}</span>
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
                </div>
                {expandedCategories.has(item.category.id) && (
                  <div className="border-t bg-gray-50/50">
                    <TransactionTable 
                      transactions={item.recentTransactions} 
                      variant="income" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed min-w-[500px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium rounded-tl-lg text-xs sm:text-sm w-1/4">Category</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/6"></th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">Expected</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">Actual</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium rounded-tr-lg text-xs sm:text-sm w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                {incomeData.map((item) => (
                  <React.Fragment key={item.category.id}>
                    <tr 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.category.id)}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium bg-blue-50 border-r border-blue-100 text-xs sm:text-sm">{item.category.name}</td>
                      <td className="text-right py-2 sm:py-3 px-1 sm:px-4"></td>
                      <td className="text-right py-2 sm:py-3 px-1 sm:px-4 text-xs sm:text-sm">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-2 sm:py-3 px-1 sm:px-4 font-semibold text-xs sm:text-sm">{formatCurrency(item.actual)}</td>
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
                            variant="income" 
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

      {/* Expenses Section */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
          <CardDescription>Your spending by category for {monthName}</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {/* Mobile Card Layout */}
          <div className="block md:hidden space-y-3">
            {expenseData.map((item) => (
              <div key={item.category.id} className="border rounded-lg">
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategoryExpansion(item.category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.category.icon}</span>
                      <div>
                        <div className="font-semibold text-base">{item.category.name}</div>
                        <div className="text-sm space-y-1">
                          <div className="text-muted-foreground">
                            Actual: <span className="font-medium text-red-600">{formatCurrency(item.actual)}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Budget: <span className="font-medium">{formatCurrency(item.budgeted)}</span>
                          </div>
                          <div className={cn("font-medium", getExpenseStatusColor(item.variance, item.monthlyPaceStatus))}>
                            {getExpenseStatusText(item.variance, item.monthlyPaceStatus)}
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
                </div>
                {expandedCategories.has(item.category.id) && (
                  <div className="border-t bg-gray-50/50">
                    <TransactionTable 
                      transactions={item.recentTransactions} 
                      variant="expense" 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full table-fixed min-w-[500px]">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium rounded-tl-lg text-xs sm:text-sm w-1/4">Category</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/6">On Track</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">Budgeted</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium text-xs sm:text-sm w-1/4">Actual</th>
                  <th className="text-right py-2 sm:py-3 px-1 sm:px-4 font-medium rounded-tr-lg text-xs sm:text-sm w-1/12"></th>
                </tr>
              </thead>
              <tbody>
                {expenseData.map((item) => (
                  <React.Fragment key={item.category.id}>
                    <tr 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleCategoryExpansion(item.category.id)}
                    >
                      <td className="py-2 sm:py-3 px-2 sm:px-4 font-medium bg-red-50 border-r border-red-100 text-xs sm:text-sm">{item.category.name}</td>
                      <td className={cn("text-right py-2 sm:py-3 px-1 sm:px-4 text-xs sm:text-sm font-medium", getExpenseStatusColor(item.variance, item.monthlyPaceStatus))}>
                        {getExpenseStatusText(item.variance, item.monthlyPaceStatus)}
                      </td>
                      <td className="text-right py-2 sm:py-3 px-1 sm:px-4 text-xs sm:text-sm">{formatCurrency(item.budgeted)}</td>
                      <td className="text-right py-2 sm:py-3 px-1 sm:px-4 font-semibold text-xs sm:text-sm">{formatCurrency(item.actual)}</td>
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
                            variant="expense" 
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
        onTransactionSaved={onBudgetSaved}
        categories={categories}
      />
    </div>
  );
}