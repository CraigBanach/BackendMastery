"use client";

import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CalendarIcon, PoundSterlingIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction } from "@/components/transactions/new/createTransaction";

enum TransactionType {
  Expense = "Expense",
  Income = "Income",
}

import { CategoryDto, CategoryType } from "@/types/budget";

const now = new Date();

const formSchema = z.object({
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number().nonnegative().safe(),
  description: z
    .string()
    .min(1, { message: "Description must be provided" })
    .max(10000, { message: "Description must be 10000 characters or less" }),
  date: z
    .date()
    .max(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
    ),
  categoryId: z.number().min(1),
  notes: z.string().max(10000).optional(),
});

export type CreateTransaction = z.infer<typeof formSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCategory?: string;
  preSelectedType?: 'income' | 'expense';
  onTransactionSaved?: () => void;
  categories?: CategoryDto[];
}

export function TransactionModal({ 
  isOpen, 
  onClose, 
  preSelectedCategory,
  preSelectedType,
  onTransactionSaved,
  categories = []
}: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: preSelectedType === 'income' ? TransactionType.Income : TransactionType.Expense,
      amount: 0,
      description: "",
      categoryId: categories.length > 0 ? categories[0].id : 1,
      date: new Date(),
      notes: "",
    },
  });

  // Get current transaction type from form
  const selectedType = form.watch("type");
  
  // Filter categories based on selected transaction type
  const filteredCategories = categories.filter(cat => 
    cat.type === (selectedType === TransactionType.Income ? CategoryType.Income : CategoryType.Expense)
  );

  // Update categoryId when type changes
  React.useEffect(() => {
    if (filteredCategories.length > 0) {
      form.setValue("categoryId", filteredCategories[0].id);
    }
  }, [selectedType, filteredCategories, form]);

  const onSubmit = async (values: CreateTransaction) => {
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      await createTransaction(values);
      form.reset();
      onTransactionSaved?.(); // Trigger data refresh
      onClose();
    } catch (e) {
      console.error(e);
      setSubmitError((e as Error)?.message || "Failed to create transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button 
        onClick={form.handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Transaction"
      description="Enter the details of your transaction"
      maxWidth="2xl"
      footer={footer}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Transaction Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Expense" />
                          </FormControl>
                          <FormLabel className="font-normal">Expense</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Income" />
                          </FormControl>
                          <FormLabel className="font-normal">Income</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (£)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PoundSterlingIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                new Intl.DateTimeFormat('en-GB').format(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Grocery shopping at Tesco"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional details about this transaction"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

          {submitError && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
              {submitError}
            </div>
          )}
        </form>
      </Form>
    </Modal>
  );
}