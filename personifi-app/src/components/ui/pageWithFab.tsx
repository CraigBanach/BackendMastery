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
  fabLabel = "Add Transaction",
  fabShortcut = "Shift+A",
  disabled = false,
}: PageWithFabProps & { fabShortcut?: string }) {
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
      // Basic check for the default shortcut. 
      // Ideally this should be dynamic based on fabShortcut, but parsing "Shift+A" is complex.
      // For now, we keep the existing logic which matches the default.
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
        shortcut={fabShortcut}
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
