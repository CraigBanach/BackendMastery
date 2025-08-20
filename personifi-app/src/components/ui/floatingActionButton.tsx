"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function FloatingActionButton({ 
  onClick, 
  label = "Add Transaction", 
  disabled = false,
  className = ""
}: FloatingActionButtonProps) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className="h-12 px-6 rounded-full bg-finance-green hover:bg-finance-green-dark shadow-lg font-medium transition-all hover:shadow-xl"
      >
        <Plus className="h-4 w-4 mr-2" />
        {label}
      </Button>
    </div>
  );
}