"use client";

import { useState } from "react";
import { BudgetVarianceDashboard } from "./budgetVarianceDashboard";
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { getBudgetVariance, getBudgetsForMonth } from "@/lib/api/budgetApi";
import { getTransactions } from "@/lib/api/transactionApi";
import { calculateVarianceData } from "@/lib/hooks/useBudgetData";

interface BudgetPageClientProps {
  initialData: BudgetVarianceWithTransactions[];
  currentYear: number;
  currentMonth: number;
}

export function BudgetPageClient({ initialData, currentYear, currentMonth }: BudgetPageClientProps) {
  const [data, setData] = useState(initialData);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const fetchData = async (targetYear: number, targetMonth: number): Promise<BudgetVarianceWithTransactions[]> => {
    try {
      const [budgetVariances, transactionsResponse] = await Promise.all([
        getBudgetVariance(targetYear, targetMonth),
        getTransactions({
          pageSize: 100,
          sortBy: 'TransactionDate',
          sortDescending: true,
        }, 
        `${targetYear}-${targetMonth.toString().padStart(2, '0')}-01`,
        `${targetYear}-${targetMonth.toString().padStart(2, '0')}-${new Date(targetYear, targetMonth, 0).getDate().toString().padStart(2, '0')}`)
      ]);

      return calculateVarianceData(budgetVariances || [], transactionsResponse?.items || []);
    } catch (error: unknown) {
      console.error('Error fetching budget data:', error);
      return [];
    }
  };

  const handleMonthChange = async (newYear: number, newMonth: number): Promise<BudgetVarianceWithTransactions[]> => {
    setYear(newYear);
    setMonth(newMonth);
    const newData = await fetchData(newYear, newMonth);
    setData(newData);
    return newData;
  };

  const handleBudgetSaved = async () => {
    // TODO: Replace full page reload with proper state update
    // The ideal approach would be:
    // 1. const newData = await fetchData(year, month);
    // 2. setData(newData);
    // 3. Force re-render of BudgetVarianceDashboard with updated data
    // Issue: React state wasn't updating properly after budget save
    // For now using full page reload as quick fix
    window.location.reload();
  };

  // Extract categories from current data for modal
  const categories = data.map(item => item.category);
  const existingBudgets = data.map(item => ({
    categoryId: item.category.id,
    amount: item.budgeted,
  }));

  return (
    <BudgetVarianceDashboard
      initialData={data}
      currentYear={year}
      currentMonth={month}
      onMonthChange={handleMonthChange}
      categories={categories}
      existingBudgets={existingBudgets}
      onBudgetSaved={handleBudgetSaved}
    />
  );
}