"use client";

import { useEffect, useState } from "react";
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
  fabLabel = "[A]dd Transaction",
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && event.key.toLowerCase() === "a") {
        handleFabClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
