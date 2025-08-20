"use client";

import { useState } from "react";
import { TransactionDto } from "@/lib/api/transactionApi";
import { Category } from "@/types/transaction";
import { MonthNavigation } from "./monthNavigation";
import { TransactionsList } from "./transactionsList";
import { CreateAccountModal } from "@/components/ui/createAccountModal";
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
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    // Navigate to new URL to trigger server-side data fetch
    window.location.href = `/transactions?year=${newYear}&month=${newMonth}`;
  };


  const handleTransactionUpdated = () => {
    // Refresh the page to show updated transaction
    window.location.reload();
  };

  const handleAccountCreated = () => {
    setShowCreateAccount(false);
    // Refresh the page to load account-aware data
    window.location.reload();
  };

  // const handleApiError = (error: unknown) => {
  //   const errorMessage = error instanceof Error ? error.message : "";
  //   if (errorMessage.includes("Please create an account first")) {
  //     setShowCreateAccount(true);
  //   }
  // };

  // Filter transactions by selected category and type
  const filteredTransactions = transactions
    .filter(t => selectedCategoryId ? t.category.id === selectedCategoryId : true)
    .filter(t => typeFilter === 'all' ? true : t.category.type === typeFilter);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="w-full max-w-4xl mx-auto">
        <MonthNavigation
          currentYear={year}
          currentMonth={month}
          onMonthChange={handleMonthChange}
        />
      </div>
      
      <div className="w-full max-w-4xl mx-auto">
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

      <CreateAccountModal
        isOpen={showCreateAccount}
        onClose={() => setShowCreateAccount(false)}
        onSuccess={handleAccountCreated}
      />
    </div>
  );
}