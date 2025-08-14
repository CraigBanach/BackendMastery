"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Category } from "@/types/transaction";
import { QuickAddTransaction } from "./quickAddTransaction";

interface QuickAddTransactionButtonProps {
  categories: Category[];
  onTransactionAdded: () => void;
}

export function QuickAddTransactionButton({ categories, onTransactionAdded }: QuickAddTransactionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isExpanded) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-background rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Transaction</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                ✕
              </Button>
            </div>
            <QuickAddTransaction
              categories={categories}
              onTransactionAdded={() => {
                setIsExpanded(false);
                onTransactionAdded();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Button
      onClick={() => setIsExpanded(true)}
      size="sm"
      className="font-bold whitespace-nowrap"
    >
      <Plus className="h-4 w-4 mr-1" />
      Add Transaction
    </Button>
  );
}