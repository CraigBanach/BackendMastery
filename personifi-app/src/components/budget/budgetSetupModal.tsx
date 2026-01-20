"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setBudgetsForMonth } from "@/lib/api/budgetApi";
import { trackEvent } from "@/lib/analytics";
import { CategoryDto, CategoryType } from "@/types/budget";


interface BudgetAmount {
  categoryId: number;
  amount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
};

interface BudgetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
  categories?: CategoryDto[];
  existingBudgets?: BudgetAmount[];
  onBudgetSaved?: () => void;
}

export function BudgetSetupModal({
  isOpen,
  onClose,
  currentMonth,
  categories = [],
  existingBudgets = [],
  onBudgetSaved,
}: BudgetSetupModalProps) {
  const [budgetAmounts, setBudgetAmounts] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const initial: Record<number, string> = {};
    existingBudgets.forEach((budget) => {
      initial[budget.categoryId] = budget.amount.toString();
    });
    setBudgetAmounts(initial);
  }, [existingBudgets]);

  const monthName = currentMonth.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  const handleAmountChange = (categoryId: number, value: string) => {
    setBudgetAmounts((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
    setSubmitError("");
  };

  const hasNegativeAmounts = Object.values(budgetAmounts).some((value) => {
    if (!value) return false;
    const parsed = parseFloat(value);
    return !Number.isNaN(parsed) && parsed < 0;
  });

  const handleSave = async () => {
    if (hasNegativeAmounts) {
      setSubmitError("Budget amounts must be zero or greater.");
      return;
    }

    setSaving(true);
    try {
      // Convert budget amounts to API format
      const budgetsToSave = Object.entries(budgetAmounts)
        .filter(([, value]) => value !== "")
        .map(([categoryId, value]) => ({
          categoryId: parseInt(categoryId),
          amount: parseFloat(value),
        }))
        .filter((budget) => !Number.isNaN(budget.amount) && budget.amount >= 0);

       if (budgetsToSave.length > 0) {
         await setBudgetsForMonth(
           currentMonth.getFullYear(),
           currentMonth.getMonth() + 1,
           budgetsToSave
         );
         trackEvent("aha_moment");
         trackEvent("budget_saved");
       }

       onBudgetSaved?.();
       onClose();

    } catch (error) {
      console.error("Error saving budgets:", error);
      setSubmitError("Failed to save budgets.");
    } finally {
      setSaving(false);
    }
  };

  const expenseCategories = categories.filter((cat) => cat.type === CategoryType.Expense);
  const incomeCategories = categories.filter((cat) => cat.type === CategoryType.Income);

  const totalBudgetedIncome = incomeCategories.reduce((sum, cat) => {
    const amount = parseFloat(budgetAmounts[cat.id] || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalBudgetedExpenses = expenseCategories.reduce((sum, cat) => {
    const amount = parseFloat(budgetAmounts[cat.id] || "0");
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const validationMessage = hasNegativeAmounts
    ? "Budget amounts must be zero or greater."
    : submitError;

  const isNegativeAmount = (categoryId: number) => {
    const value = budgetAmounts[categoryId];
    if (!value) return false;
    const parsed = parseFloat(value);
    return !Number.isNaN(parsed) && parsed < 0;
  };

  const netBudget = totalBudgetedIncome - totalBudgetedExpenses;

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {validationMessage ? (
        <span className="text-sm text-red-600">{validationMessage}</span>
      ) : (
        <span />
      )}
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || hasNegativeAmounts}
          className="bg-finance-green hover:bg-finance-green-dark"
        >
          {saving ? "Saving..." : "Save Budget"}
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Budget - ${monthName}`}
      description="Set your budgeted amounts for each category. These amounts will persist for future months until changed."
      maxWidth="4xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(totalBudgetedIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {formatCurrency(totalBudgetedExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${
                  netBudget >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
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
              <CardDescription>
                Set your expected income for each source
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <Label
                    htmlFor={`income-${category.id}`}
                    className="text-sm font-medium"
                  >
                    {category.name}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      £
                    </span>
                      <Input
                        id={`income-${category.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetAmounts[category.id] || ""}
                        onChange={(e) =>
                          handleAmountChange(category.id, e.target.value)
                        }
                        className={`pl-8 ${
                          isNegativeAmount(category.id)
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
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
              <CardDescription>
                Set your budget for each expense category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <Label
                    htmlFor={`expense-${category.id}`}
                    className="text-sm font-medium"
                  >
                    {category.name}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      £
                    </span>
                      <Input
                        id={`expense-${category.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={budgetAmounts[category.id] || ""}
                        onChange={(e) =>
                          handleAmountChange(category.id, e.target.value)
                        }
                        className={`pl-8 ${
                          isNegativeAmount(category.id)
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Modal>
  );
}
