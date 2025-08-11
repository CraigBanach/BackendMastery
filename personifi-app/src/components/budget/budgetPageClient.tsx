"use client";

import { BudgetVarianceDashboard } from "./budgetVarianceDashboard";
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { getBudgetVariance } from "@/lib/api/budgetApi";
import { getTransactions } from "@/lib/api/transactionApi";
import { calculateVarianceData } from "@/lib/hooks/useBudgetData";

interface BudgetPageClientProps {
  initialData: BudgetVarianceWithTransactions[];
  currentYear: number;
  currentMonth: number;
}

export function BudgetPageClient({ initialData, currentYear, currentMonth }: BudgetPageClientProps) {
  const handleMonthChange = async (year: number, month: number): Promise<BudgetVarianceWithTransactions[]> => {
    try {
      const [budgetVariances, transactions] = await Promise.all([
        getBudgetVariance(year, month),
        getTransactions({
          pageSize: 100,
          sortBy: 'TransactionDate',
          sortDescending: true,
        }, 
        `${year}-${month.toString().padStart(2, '0')}-01`,
        `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`)
      ]);

      return calculateVarianceData(budgetVariances, transactions.data);
    } catch (error: unknown) {
      console.error('Error fetching budget data:', error);
      throw error;
    }
  };

  return (
    <BudgetVarianceDashboard
      initialData={initialData}
      currentYear={currentYear}
      currentMonth={currentMonth}
      onMonthChange={handleMonthChange}
    />
  );
}