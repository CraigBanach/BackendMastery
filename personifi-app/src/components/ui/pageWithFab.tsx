"use client";

import { useState } from "react";
import { FloatingActionButton } from "./floatingActionButton";
import { TransactionModal } from "@/components/transactions/transactionModal";
import { CategoryDto } from "@/types/budget";

interface PageWithFabProps {
  children: React.ReactNode;
  categories?: CategoryDto[];
  onTransactionSaved?: () => void;
  fabLabel?: string;
  disabled?: boolean;
}

export function PageWithFab({
  children,
  categories = [],
  onTransactionSaved,
  fabLabel = "Add Transaction",
  disabled = false,
}: PageWithFabProps) {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  const handleFabClick = () => {
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSaved = () => {
    setIsTransactionModalOpen(false);
    onTransactionSaved?.();
  };

  const handleModalClose = () => {
    setIsTransactionModalOpen(false);
  };

  return (
    <>
      {children}

      <FloatingActionButton
        onClick={handleFabClick}
        label={fabLabel}
        disabled={disabled}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={handleModalClose}
        onTransactionSaved={handleTransactionSaved}
        categories={categories}
      />
    </>
  );
}
