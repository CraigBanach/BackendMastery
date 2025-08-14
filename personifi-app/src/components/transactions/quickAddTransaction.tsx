"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Category } from "@/types/transaction";
import { createTransaction } from "@/lib/api/createTransaction";

interface QuickAddTransactionProps {
  categories: Category[];
  onTransactionAdded: () => void;
}

export function QuickAddTransaction({ categories, onTransactionAdded }: QuickAddTransactionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    notes: '',
    categoryId: '',
    transactionDate: new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.categoryId) return;

    setIsLoading(true);
    try {
      await createTransaction({
        amount: parseFloat(formData.amount),
        description: formData.description,
        notes: formData.notes || undefined,
        categoryId: parseInt(formData.categoryId),
        transactionDate: formData.transactionDate,
        transactionType: "expense", // Default to expense for now
      });

      // Reset form
      setFormData({
        amount: '',
        description: '',
        notes: '',
        categoryId: '',
        transactionDate: new Date(),
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
        <CardContent className="flex items-center justify-center py-6 xl:py-8">
          <Button
            variant="ghost"
            size="default"
            onClick={() => setIsExpanded(true)}
            className="text-muted-foreground"
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
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Add Transaction</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
          >
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 xl:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Amount *</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="w-full">
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
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <Input
              placeholder="Transaction description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.transactionDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.transactionDate}
                  onSelect={(date) => date && setFormData({ ...formData, transactionDate: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              placeholder="Optional notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}