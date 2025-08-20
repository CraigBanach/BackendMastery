"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { Category } from "@/types/transaction";
import { createTransaction } from "@/lib/api/createTransaction";

interface QuickAddTransactionCardProps {
  categories: Category[];
  onTransactionAdded: () => void;
}

export function QuickAddTransactionCard({ categories, onTransactionAdded }: QuickAddTransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.categoryId) return;

    setIsLoading(true);
    try {
      await createTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        transactionDate: new Date(),
        transactionType: "expense", // Default to expense
      });

      // Reset form
      setFormData({
        amount: '',
        description: '',
        categoryId: '',
      });
      setIsExpanded(false);
      onTransactionAdded();
    } catch (error: unknown) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-3 sm:py-4">
          <Button
            variant="ghost"
            onClick={() => setIsExpanded(true)}
            className="w-full text-muted-foreground font-bold"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Quick Add</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Select
              value={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
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

          <Input
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="order-1 sm:order-2">
              {isLoading ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}