"use client";

import { PageWithFab } from "@/components/ui/pageWithFab";
import { Category } from "@/types/transaction";

interface TransactionsPageWithFabProps {
  children: React.ReactNode;
  categories: Category[];
}

export function TransactionsPageWithFab({ children, categories }: TransactionsPageWithFabProps) {
  const handleTransactionSaved = () => {
    // Refresh the page to show new transaction
    window.location.reload();
  };

  return (
    <PageWithFab 
      categories={categories}
      onTransactionSaved={handleTransactionSaved}
    >
      {children}
    </PageWithFab>
  );
}