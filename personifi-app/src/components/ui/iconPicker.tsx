"use client";

import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

// Predefined emoji categories for different types
const EXPENSE_ICONS = [
  "🏠", "🍔", "🚗", "⛽", "🎬", "🛒", "👕", "💊", 
  "📱", "💻", "✈️", "🏥", "🎓", "🍺", "🎮", "📚",
  "🧾", "🔧", "🎵", "🏋️", "💇", "🐕", "💳", "📦"
];

const INCOME_ICONS = [
  "💰", "💼", "🏦", "📈", "💵", "🎁", "💎", "🏆",
  "📊", "🤝", "💻", "🎯", "📝", "⭐", "🎪", "🎭"
];

interface IconPickerProps {
  value?: string;
  onChange: (icon: string) => void;
  categoryType?: "Expense" | "Income";
  placeholder?: string;
}

export function IconPicker({ value, onChange, categoryType, placeholder = "Select an icon" }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customIcon, setCustomIcon] = useState(value || "");

  const icons = categoryType === "Income" ? INCOME_ICONS : EXPENSE_ICONS;

  const handleIconSelect = (icon: string) => {
    setCustomIcon(icon);
    onChange(icon);
    setIsOpen(false);
  };

  const handleCustomIconChange = (icon: string) => {
    setCustomIcon(icon);
    onChange(icon);
  };

  return (
    <div className="space-y-2">
      <Label>Icon</Label>
      
      {/* Selected icon display and trigger */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal"
      >
        {value ? (
          <span className="flex items-center gap-2">
            <span className="text-lg">{value}</span>
            <span className="text-muted-foreground">Click to change</span>
          </span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </Button>

      {/* Icon picker dropdown */}
      {isOpen && (
        <div className="border rounded-lg p-4 bg-background shadow-lg">
          {/* Custom icon input */}
          <div className="mb-4">
            <Label htmlFor="custom-icon" className="text-sm font-medium">
              Custom Icon (paste any emoji)
            </Label>
            <Input
              id="custom-icon"
              value={customIcon}
              onChange={(e) => handleCustomIconChange(e.target.value)}
              placeholder="🎯"
              className="mt-1"
              maxLength={2}
            />
          </div>

          {/* Predefined icons grid */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Suggested {categoryType === "Income" ? "Income" : "Expense"} Icons
            </Label>
            <div className="grid grid-cols-8 gap-2">
              {icons.map((icon) => (
                <Button
                  key={icon}
                  type="button"
                  variant={value === icon ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleIconSelect(icon)}
                  className="h-10 w-10 p-0 text-lg"
                >
                  {icon}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}