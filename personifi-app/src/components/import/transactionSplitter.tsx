"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, AlertCircle } from "lucide-react";
import { TransactionSplit } from "@/lib/api/transactionImportApi";

interface Category {
  id: number;
  name: string;
  type: string;
  icon?: string;
}

interface TransactionSplitterProps {
  originalAmount: number;
  categories: Category[];
  onSplitComplete: (splits: TransactionSplit[]) => void;
  onCancel: () => void;
  isProcessing: boolean;
  defaultDescription?: string;
}

interface SplitItem extends TransactionSplit {
  tempId: string;
}

export function TransactionSplitter({
  originalAmount,
  categories,
  onSplitComplete,
  onCancel,
  isProcessing,
  defaultDescription
}: TransactionSplitterProps) {
  const [splits, setSplits] = useState<SplitItem[]>([]);
  const [hasManuallyModified, setHasManuallyModified] = useState(false);
  const [selectedCategoryType, setSelectedCategoryType] = useState<string | null>(null);

  // Always work with positive amounts in the UI for simplicity
  const getDisplayAmount = (amount: number) => Math.abs(amount);
  
  // Get the correct signed amount based on category type and original transaction type
  const getCorrectAmount = (displayAmount: number, categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return displayAmount;
    
    // With canonical storage: positive = income, negative = expense
    // Apply same logic as approval process for cross-type assignments
    const isOriginalIncome = originalAmount > 0;
    const isIncomeCategory = category.type === 'Income';
    
    return (isOriginalIncome === isIncomeCategory)
      ? Math.abs(displayAmount)  // Same type: positive
      : -Math.abs(displayAmount); // Cross type: negative
  };

  // Initialize with two empty splits
  useEffect(() => {
    const halfDisplay = getDisplayAmount(originalAmount) / 2;
    const initialSplits: SplitItem[] = [
      { tempId: "1", categoryId: 0, amount: halfDisplay, description: "" },
      { tempId: "2", categoryId: 0, amount: halfDisplay, description: "" }
    ];
    setSplits(initialSplits);
  }, [originalAmount, defaultDescription]);

  const totalSplitAmount = splits.reduce((sum, split) => sum + split.amount, 0);
  const originalAbsAmount = Math.abs(originalAmount);
  const remainingAmount = originalAbsAmount - totalSplitAmount;
  const isValidTotal = Math.abs(remainingAmount) < 0.01; // Allow for small rounding differences

  const addSplit = () => {
    const newSplit: SplitItem = {
      tempId: Date.now().toString(),
      categoryId: 0,
      amount: Math.max(0, remainingAmount / (splits.length + 1)),
      description: ""
    };

    // Auto-distribute remaining amount if not manually modified
    if (!hasManuallyModified) {
      const evenDisplayAmount = originalAbsAmount / (splits.length + 1);
      const updatedSplits = splits.map(split => ({
        ...split,
        amount: evenDisplayAmount
      }));
      setSplits([...updatedSplits, { ...newSplit, amount: evenDisplayAmount }]);
    } else {
      setSplits([...splits, newSplit]);
    }
  };

  const removeSplit = (tempId: string) => {
    if (splits.length <= 2) return; // Minimum 2 splits required
    
    const updatedSplits = splits.filter(split => split.tempId !== tempId);
    
    // Auto-redistribute if not manually modified
    if (!hasManuallyModified) {
      const evenDisplayAmount = originalAbsAmount / updatedSplits.length;
      const redistributedSplits = updatedSplits.map(split => ({
        ...split,
        amount: evenDisplayAmount
      }));
      setSplits(redistributedSplits);
    } else {
      setSplits(updatedSplits);
    }
  };

  const updateSplit = (tempId: string, field: keyof TransactionSplit, value: string | number) => {
    if (field === 'categoryId') {
      const categoryId = Number(value);
      const category = categories.find(c => c.id === categoryId);
      
      // Set the category type when first category is selected
      if (category && !selectedCategoryType) {
        setSelectedCategoryType(category.type);
      }
      
      // Prevent selecting categories of different types
      if (category && selectedCategoryType && category.type !== selectedCategoryType) {
        return; // Don't allow the update
      }
      
      // If deselecting (setting to 0), check if we should reset the category type
      if (categoryId === 0) {
        // Update the split first
        setSplits(prevSplits => {
          const updatedSplits = prevSplits.map(split => 
            split.tempId === tempId ? { ...split, categoryId: 0 } : split
          );
          
          // Check if any splits still have categories selected
          const hasSelectedCategories = updatedSplits.some(split => split.categoryId > 0);
          if (!hasSelectedCategories) {
            setSelectedCategoryType(null);
          }
          
          return updatedSplits;
        });
        return;
      }
    }
    
    setSplits(splits.map(split => 
      split.tempId === tempId 
        ? { 
            ...split, 
            [field]: field === 'amount' ? Math.abs(Number(value)) : value 
          }
        : split
    ));
    
    if (field === 'amount') {
      setHasManuallyModified(true);
    }
  };

  const handleSubmit = () => {
    const validSplits = splits.filter(split => split.categoryId > 0);
    if (validSplits.length < 2) return;
    
    // Convert to API format with correct signs based on category type
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const apiSplits: TransactionSplit[] = validSplits.map(({ tempId: _, ...split }) => ({
      ...split,
      amount: getCorrectAmount(split.amount, split.categoryId)
    }));
    onSplitComplete(apiSplits);
  };

  const canSubmit = splits.filter(split => split.categoryId > 0).length >= 2;

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Split Transaction</h3>
        <div className="text-sm text-gray-600">
          Original: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(originalAbsAmount)}
        </div>
      </div>

      {/* Split Items */}
      <div className="space-y-3">
        {splits.map((split, index) => (
          <div key={split.tempId} className="border rounded p-3 bg-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">Split {index + 1}</span>
              {splits.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSplit(split.tempId)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  disabled={isProcessing}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">Category</label>
                <select
                  value={split.categoryId}
                  onChange={(e) => updateSplit(split.tempId, 'categoryId', Number(e.target.value))}
                  disabled={isProcessing}
                  className="w-full text-sm border rounded px-2 py-1"
                >
                  <option value={0}>Select category...</option>
                  {categories
                    .filter(category => !selectedCategoryType || category.type === selectedCategoryType)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon && `${category.icon} `}{category.name}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">
                  Amount
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={split.amount || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string or valid numbers (including partial like "12.")
                    if (value === '' || !isNaN(Number(value))) {
                      updateSplit(split.tempId, 'amount', value === '' ? 0 : Number(value));
                    }
                  }}
                  disabled={isProcessing}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Description (optional)</label>
                <Input
                  type="text"
                  value={split.description || ""}
                  onChange={(e) => updateSplit(split.tempId, 'description', e.target.value)}
                  disabled={isProcessing}
                  placeholder={defaultDescription || "Description..."}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Split Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={addSplit}
        disabled={isProcessing}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Another Split
      </Button>

      {/* Summary */}
      <div className="bg-white border rounded p-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Split Amount:</span>
          <span className={isValidTotal ? "text-green-600" : "text-orange-600"}>
            {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(totalSplitAmount)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Original Amount:</span>
          <span>{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(originalAbsAmount)}</span>
        </div>
        
        {!isValidTotal && (
          <div className="flex items-start gap-2 text-sm text-orange-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium">Amount mismatch:</div>
              <div>
                {Math.abs(remainingAmount) > 0.01 && (
                  remainingAmount > 0 
                    ? `${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(remainingAmount)} remaining` 
                    : `${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(remainingAmount))} over total`
                )}
              </div>
            </div>
          </div>
        )}
        
        {isValidTotal && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <span>✓ Amounts match perfectly</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isProcessing}
          className="flex-1"
        >
          {isProcessing ? "Processing..." : "Approve Split"}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}