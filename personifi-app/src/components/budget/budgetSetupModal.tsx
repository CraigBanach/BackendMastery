"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data types
interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
}

interface BudgetAmount {
  categoryId: number;
  amount: number;
}

// Mock categories - this will come from API
const mockCategories: Category[] = [
  { id: 1, name: "Housing", type: 'expense' },
  { id: 2, name: "Food", type: 'expense' },
  { id: 3, name: "Transportation", type: 'expense' },
  { id: 4, name: "Entertainment", type: 'expense' },
  { id: 5, name: "Utilities", type: 'expense' },
  { id: 6, name: "Healthcare", type: 'expense' },
  { id: 7, name: "Salary", type: 'income' },
  { id: 8, name: "Freelance", type: 'income' },
  { id: 9, name: "Investments", type: 'income' },
];

// Mock existing budget amounts
const mockExistingBudgets: BudgetAmount[] = [
  { categoryId: 1, amount: 1500 },
  { categoryId: 2, amount: 500 },
  { categoryId: 3, amount: 300 },
  { categoryId: 4, amount: 200 },
  { categoryId: 7, amount: 4500 },
  { categoryId: 8, amount: 800 },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
}

export function BudgetSetupModal({ isOpen, onClose, currentMonth }: BudgetSetupModalProps) {
  const [budgetAmounts, setBudgetAmounts] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    mockExistingBudgets.forEach(budget => {
      initial[budget.categoryId] = budget.amount.toString();
    });
    return initial;
  });

  const monthName = currentMonth.toLocaleDateString('en-GB', { 
    month: 'long', 
    year: 'numeric' 
  });

  const handleAmountChange = (categoryId: number, value: string) => {
    setBudgetAmounts(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const handleSave = () => {
    // This will make API call to save budget amounts
    console.log('Saving budget amounts:', budgetAmounts);
    onClose();
  };

  const expenseCategories = mockCategories.filter(cat => cat.type === 'expense');
  const incomeCategories = mockCategories.filter(cat => cat.type === 'income');

  const totalBudgetedIncome = incomeCategories.reduce((sum, cat) => {
    const amount = parseFloat(budgetAmounts[cat.id] || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalBudgetedExpenses = expenseCategories.reduce((sum, cat) => {
    const amount = parseFloat(budgetAmounts[cat.id] || '0');
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const netBudget = totalBudgetedIncome - totalBudgetedExpenses;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Budget - {monthName}</CardTitle>
                <CardDescription>
                  Set your budgeted amounts for each category. These amounts will persist for future months until changed.
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={onClose}>✕</Button>
            </div>
          </CardHeader>
        </Card>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(totalBudgetedIncome)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(totalBudgetedExpenses)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Net Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${netBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netBudget)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Income Categories</CardTitle>
                <CardDescription>Set your expected income for each source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {incomeCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <Label htmlFor={`income-${category.id}`} className="text-sm font-medium">
                      {category.name}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        £
                      </span>
                      <Input
                        id={`income-${category.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetAmounts[category.id] || ''}
                        onChange={(e) => handleAmountChange(category.id, e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Set your budget for each expense category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {expenseCategories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <Label htmlFor={`expense-${category.id}`} className="text-sm font-medium">
                      {category.name}
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        £
                      </span>
                      <Input
                        id={`expense-${category.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetAmounts[category.id] || ''}
                        onChange={(e) => handleAmountChange(category.id, e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-finance-green hover:bg-finance-green-dark">
            Save Budget
          </Button>
        </div>
      </div>
    </div>
  );
}