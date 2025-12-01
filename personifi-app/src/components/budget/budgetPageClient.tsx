"use client";

import { useRouter } from "next/navigation";
import { BudgetVarianceDashboard } from "./budgetVarianceDashboard";
import { BudgetVarianceWithTransactions } from "@/lib/hooks/useBudgetData";
import { PageWithFab } from "@/components/ui/pageWithFab";

interface BudgetPageClientProps {
  data: BudgetVarianceWithTransactions[];
  year: number;
  month: number;
}

export function BudgetPageClient({ data, year, month }: BudgetPageClientProps) {
  const router = useRouter();

  const handleMonthChange = async (newYear: number, newMonth: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("year", newYear.toString());
    url.searchParams.set("month", newMonth.toString());
    router.push(url.pathname + url.search, { scroll: false });
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
  const categories = data.map((item) => item.category);
  const existingBudgets = data.map((item) => ({
    categoryId: item.category.id,
    amount: item.budgeted,
  }));

  return (
    <PageWithFab categories={categories} onTransactionSaved={handleBudgetSaved}>
      <BudgetVarianceDashboard
        data={data}
        year={year}
        month={month}
        onMonthChange={handleMonthChange}
        categories={categories}
        existingBudgets={existingBudgets}
        onBudgetSaved={handleBudgetSaved}
      />
    </PageWithFab>
  );
}
