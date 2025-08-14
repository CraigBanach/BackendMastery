"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TransactionDto,
  deleteTransaction,
  updateTransaction,
} from "@/lib/api/transactionApi";
import { Category } from "@/types/transaction";
import { CategoryType } from "@/types/budget";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import { Edit, Trash2, Filter, Check, X } from "lucide-react";

interface TransactionsListProps {
  transactions: TransactionDto[];
  categories: Category[];
  selectedCategoryId: number | null;
  typeFilter: "all" | CategoryType;
  onCategoryFilter: (categoryId: number | null) => void;
  onTypeFilter: (typeFilter: "all" | CategoryType) => void;
  onTransactionUpdated: () => void;
}

export function TransactionsList({
  transactions,
  categories,
  selectedCategoryId,
  typeFilter,
  onCategoryFilter,
  onTypeFilter,
  onTransactionUpdated,
}: TransactionsListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    description: "",
    notes: "",
    categoryId: "",
  });

  const handleEdit = (transaction: TransactionDto) => {
    setEditingId(transaction.id);
    setEditForm({
      amount: transaction.amount.toString(),
      description: transaction.description,
      notes: transaction.notes || "",
      categoryId: transaction.category.id.toString(),
    });
  };

  const handleSaveEdit = async (transaction: TransactionDto) => {
    try {
      await updateTransaction(transaction.id, {
        amount: parseFloat(editForm.amount),
        description: editForm.description,
        notes: editForm.notes || undefined,
        categoryId: parseInt(editForm.categoryId),
        transactionDate: new Date(transaction.transactionDate),
      });
      setEditingId(null);
      onTransactionUpdated();
    } catch (error: unknown) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      amount: "",
      description: "",
      notes: "",
      categoryId: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
        onTransactionUpdated();
      } catch (error: unknown) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Filter categories based on type filter
  const filteredCategories = typeFilter === "all" 
    ? categories 
    : categories.filter(c => c.type === typeFilter);

  // Clear category selection if it's not compatible with current type filter
  const validSelectedCategoryId = selectedCategoryId && 
    filteredCategories.some(c => c.id === selectedCategoryId) 
    ? selectedCategoryId 
    : null;

  // Apply filters first
  const filteredTransactions = transactions
    .filter((t) =>
      validSelectedCategoryId ? t.category.id === validSelectedCategoryId : true
    )
    .filter((t) => {
      if (typeFilter === "all") return true;
      return t.category.type === typeFilter;
    });

  // Group filtered transactions by date
  const groupedTransactions = filteredTransactions.reduce(
    (groups, transaction) => {
      const date = new Date(transaction.transactionDate);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    },
    {} as Record<string, TransactionDto[]>
  );

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTransactions).sort((a, b) =>
    b.localeCompare(a)
  );

  // Helper function to determine amount display and color
  const getAmountDisplay = (transaction: TransactionDto) => {
    const amount = transaction.amount;
    const isIncome = transaction.category.type === CategoryType.Income;

    // Show minus sign only if the value is negative
    const displayValue =
      amount < 0
        ? `-${formatCurrency(Math.abs(amount))}`
        : formatCurrency(amount);

    // Color logic:
    // - Income: green for positive, red for negative (inverted from before)
    // - Expense: red for positive, green for negative
    let colorClass: string;
    if (isIncome) {
      colorClass = amount >= 0 ? "text-green-600" : "text-red-600";
    } else {
      colorClass = amount >= 0 ? "text-red-600" : "text-green-600";
    }

    return { displayValue, colorClass };
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Transactions</CardTitle>
          
          {/* Mobile: Stacked Filters */}
          <div className="flex flex-col space-y-2 sm:hidden">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={typeFilter}
                onValueChange={(value: "all" | CategoryType) =>
                  onTypeFilter(value)
                }
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={CategoryType.Expense}>Expenses</SelectItem>
                  <SelectItem value={CategoryType.Income}>Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Select
              value={validSelectedCategoryId?.toString() || "all"}
              onValueChange={(value) =>
                onCategoryFilter(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Horizontal Filters */}
          <div className="hidden sm:flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={typeFilter}
              onValueChange={(value: "all" | CategoryType) =>
                onTypeFilter(value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={CategoryType.Expense}>Expenses</SelectItem>
                <SelectItem value={CategoryType.Income}>Income</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={validSelectedCategoryId?.toString() || "all"}
              onValueChange={(value) =>
                onCategoryFilter(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center">
                      <span className="mr-2">{category.icon}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {validSelectedCategoryId && selectedCategory && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filtered by:</span>
            <Badge variant="secondary" className="flex items-center">
              <span className="mr-1">{selectedCategory.icon}</span>
              {selectedCategory.name}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryFilter(null)}
              className="text-xs"
            >
              Clear Filter
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {validSelectedCategoryId || typeFilter !== "all" ? (
              <>No transactions found for the current filters this month.</>
            ) : (
              <>No transactions found for this month.</>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((dateKey) => {
              const dateTransactions = groupedTransactions[dateKey];
              const date = new Date(dateKey);

              return (
                <div key={dateKey}>
                  <h3 className="font-semibold text-base mb-2 text-foreground border-b pb-1">
                    {format(date, "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="space-y-2">
                    {dateTransactions.map((transaction, index) => {
                      const { displayValue, colorClass } =
                        getAmountDisplay(transaction);
                      const isEditing = editingId === transaction.id;
                      const isLastInGroup =
                        index === dateTransactions.length - 1;

                      return (
                        <div key={transaction.id}>
                          <div
                            className={`relative p-3 xl:p-2 rounded-lg border-l-4 hover:bg-muted/50 transition-colors ${
                              isEditing
                                ? "bg-muted/50 border-primary"
                                : "border-muted hover:border-muted-foreground"
                            }`}
                            style={{
                              borderLeftColor: isEditing
                                ? undefined
                                : transaction.category.color,
                            }}
                          >
                            {!isEditing ? (
                              // Display Mode
                              <>
                                <div className="flex items-center">
                                  {/* Icon */}
                                  <div className="flex-shrink-0 mr-4">
                                    <span className="text-2xl">
                                      {transaction.category.icon}
                                    </span>
                                  </div>

                                  {/* Main Content - optimized for wide screens */}
                                  <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-2 xl:gap-6 items-center min-w-0">
                                    {/* Primary Info: Description */}
                                    <div className="xl:col-span-1">
                                      <div className="font-bold text-lg xl:text-xl text-foreground truncate">
                                        {transaction.description}
                                      </div>
                                      <div className="text-sm font-medium text-muted-foreground xl:hidden">
                                        {transaction.category.name}
                                      </div>
                                    </div>

                                    {/* Amount - prominent */}
                                    <div className="xl:col-span-1 xl:text-center">
                                      <div
                                        className={`font-bold text-lg xl:text-xl ${colorClass}`}
                                      >
                                        {displayValue}
                                      </div>
                                    </div>

                                    {/* Category Name - only on larger screens */}
                                    <div className="hidden xl:block xl:col-span-1">
                                      <div className="text-sm font-medium text-muted-foreground">
                                        {transaction.category.name}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(transaction)}
                                      className="h-7 w-7 p-0 hover:bg-blue-100"
                                    >
                                      <Edit className="h-3 w-3 text-blue-600" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleDelete(transaction.id)
                                      }
                                      className="h-7 w-7 p-0 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-3 w-3 text-red-600" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Notes - below main content */}
                                {transaction.notes && (
                                  <div className="mt-2 text-xs text-muted-foreground italic bg-muted/30 px-2 py-1 rounded ml-12">
                                    {transaction.notes}
                                  </div>
                                )}
                              </>
                            ) : (
                              // Edit Mode
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Description
                                    </label>
                                    <Input
                                      value={editForm.description}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          description: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">
                                      Amount
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={editForm.amount}
                                      onChange={(e) =>
                                        setEditForm({
                                          ...editForm,
                                          amount: e.target.value,
                                        })
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">
                                    Category
                                  </label>
                                  <Select
                                    value={editForm.categoryId}
                                    onValueChange={(value) =>
                                      setEditForm({
                                        ...editForm,
                                        categoryId: value,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem
                                          key={category.id}
                                          value={category.id.toString()}
                                        >
                                          <div className="flex items-center">
                                            <span className="mr-2">
                                              {category.icon}
                                            </span>
                                            {category.name}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <label className="text-sm font-medium">
                                    Notes
                                  </label>
                                  <Textarea
                                    value={editForm.notes}
                                    onChange={(e) =>
                                      setEditForm({
                                        ...editForm,
                                        notes: e.target.value,
                                      })
                                    }
                                    className="mt-1"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="text-red-600 hover:bg-red-100"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(transaction)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          {!isLastInGroup && (
                            <div className="h-px bg-border/30 mx-2 my-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
