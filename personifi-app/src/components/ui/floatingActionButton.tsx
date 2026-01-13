"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalManager } from "@/lib/providers/modal-provider";


interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  className?: string;
}

export function FloatingActionButton({
  onClick,
  label = "Add Transaction",
  shortcut,
  disabled = false,
  className = "",
}: FloatingActionButtonProps) {
  const { isModalOpen } = useModalManager();

  // Parse shortcut into keys if present (simple split by +)
  const keys = shortcut ? shortcut.split("+").map((k) => k.trim()) : [];

  if (isModalOpen) return null;


  return (
    <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 ${className}`}>
      <Button
        onClick={onClick}
        disabled={disabled}
        size="lg"
        className="h-11 sm:h-12 px-4 sm:px-6 rounded-full bg-finance-green hover:bg-finance-green-dark shadow-lg font-medium transition-all hover:shadow-xl flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base"
        title={shortcut ? `${label} (${shortcut})` : label}
        aria-keyshortcuts={shortcut ? shortcut.replace(/\s/g, "") : undefined}
      >
        <Plus className="h-4 w-4" />
        <span>{label}</span>
        {keys.length > 0 && (
          <span
            className="hidden sm:flex items-center gap-1 ml-1 opacity-90"
            aria-hidden="true"
          >
            {keys.map((key, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <span className="mx-0.5 text-[10px]">+</span>}
                <span className="bg-white/20 border border-white/40 rounded px-1.5 py-0.5 text-[10px] font-mono shadow-sm uppercase leading-none min-w-[20px] text-center">
                  {key}
                </span>
              </span>
            ))}
          </span>
        )}
      </Button>
    </div>
  );

}
