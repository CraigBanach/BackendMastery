"use client";

import { useState } from "react";
import { TransactionDto } from "@/lib/api/transactionApi";
import { Category } from "@/types/transaction";
import { MonthNavigation } from "./monthNavigation";
import { TransactionsList } from "./transactionsList";
import { QuickAddTransactionButton } from "./quickAddTransactionButton";
import { QuickAddTransactionCard } from "./quickAddTransactionCard";
import { CategoryType } from "@/types/budget";

interface TransactionsPageClientProps {
  initialTransactions: TransactionDto[];
  categories: Category[];
  currentYear: number;
  currentMonth: number;
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
  };
}

export function TransactionsPageClient({
  initialTransactions,
  categories,
  currentYear,
  currentMonth,
}: TransactionsPageClientProps) {
  const [transactions] = useState(initialTransactions);
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<'all' | CategoryType>('all');

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    // Navigate to new URL to trigger server-side data fetch
    window.location.href = `/transactions?year=${newYear}&month=${newMonth}`;
  };

  const handleTransactionAdded = () => {
    // Refresh the page to show new transaction
    window.location.reload();
  };

  const handleTransactionUpdated = () => {
    // Refresh the page to show updated transaction
    window.location.reload();
  };

  // Filter transactions by selected category and type
  const filteredTransactions = transactions
    .filter(t => selectedCategoryId ? t.category.id === selectedCategoryId : true)
    .filter(t => typeFilter === 'all' ? true : t.category.type === typeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <MonthNavigation
          currentYear={year}
          currentMonth={month}
          onMonthChange={handleMonthChange}
        />
        
        {/* Add Transaction Button - desktop only */}
        <div className="hidden sm:block">
          <QuickAddTransactionButton
            categories={categories}
            onTransactionAdded={handleTransactionAdded}
          />
        </div>
      </div>
      
      {/* Compact Add Transaction Card - mobile only */}
      <div className="sm:hidden">
        <QuickAddTransactionCard
          categories={categories}
          onTransactionAdded={handleTransactionAdded}
        />
      </div>
      
      <TransactionsList
        transactions={filteredTransactions}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        typeFilter={typeFilter}
        onCategoryFilter={setSelectedCategoryId}
        onTypeFilter={setTypeFilter}
        onTransactionUpdated={handleTransactionUpdated}
      />
    </div>
  );
}