"use client";

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { PieChart, Receipt, Menu, Settings, Upload, Cylinder } from "lucide-react";

interface MobileNavMenuProps {
  isBudgetPage: boolean;
  isTransactionsPage: boolean;
  isCategoriesPage: boolean;
  isImportPage: boolean;
  isBucketsPage: boolean;
}

export function MobileNavMenu({ isBudgetPage, isTransactionsPage, isCategoriesPage, isImportPage, isBucketsPage }: MobileNavMenuProps) {
  const handleNavigation = (value: string) => {
    if (value && value !== "placeholder") {
      window.location.href = value;
    }
  };

  const getCurrentValue = () => {
    if (isBudgetPage) return "/budget";
    if (isTransactionsPage) return "/transactions";
    if (isCategoriesPage) return "/categories";
    if (isImportPage) return "/import";
    if (isBucketsPage) return "/buckets";
    return "placeholder";
  };

  const getCurrentLabel = () => {
    if (isBudgetPage) return "Budget";
    if (isTransactionsPage) return "Transactions";
    if (isCategoriesPage) return "Categories";
    if (isImportPage) return "Import";
    if (isBucketsPage) return "Buckets";
    return "Menu";
  };

  return (
    <Select value={getCurrentValue()} onValueChange={handleNavigation}>
      <SelectTrigger className="w-auto border-0 bg-transparent hover:bg-muted p-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Menu className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {getCurrentLabel()}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="/budget">
          <div className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Budget
          </div>
        </SelectItem>
        <SelectItem value="/transactions">
          <div className="flex items-center">
            <Receipt className="h-4 w-4 mr-2" />
            Transactions
          </div>
        </SelectItem>
        <SelectItem value="/buckets">
          <div className="flex items-center">
            <Cylinder className="h-4 w-4 mr-2" />
            Buckets
          </div>
        </SelectItem>
        <SelectItem value="/categories">
          <div className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </div>
        </SelectItem>
        <SelectItem value="/import">
          <div className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
