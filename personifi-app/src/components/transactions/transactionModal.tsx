"use client";

import React, { useEffect, useState } from "react";
import { Check, ChevronsUpDown, PoundSterlingIcon } from "lucide-react";

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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createTransaction } from "@/lib/api/createTransaction";
import { trackEvent, trackEventOnce } from "@/lib/analytics";
import { cn } from "@/lib/utils";



enum TransactionType {
  Expense = "Expense",
  Income = "Income",
}

import { CategoryIcon } from "@/components/ui/categoryIcon";
import { CategoryDto, CategoryType } from "@/types/budget";

const now = new Date();

const formSchema = z.object({
  type: z.enum(TransactionType),
  amount: z.coerce.number() as z.ZodNumber,
  description: z
    .string()
    .min(1, { message: "Description must be provided" })
    .max(10000, { message: "Description must be 10000 characters or less" }),
  date: z
    .date()
    .max(
      new Date(now.getFullYear() + 1, now.getMonth(), now.getDate(), 23, 59, 59)
    ),
  categoryId: z.number().min(1),
  notes: z.string().max(10000).optional(),
});

export type CreateTransaction = z.infer<typeof formSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedCategory?: string;
  preSelectedType?: "income" | "expense";
  onTransactionSaved?: () => void;
  categories?: CategoryDto[];
}

export function TransactionModal({
  isOpen,
  onClose,
  preSelectedType,
  onTransactionSaved,
  categories = [],
}: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),

    defaultValues: {
      type:
        preSelectedType === "income"
          ? TransactionType.Income
          : TransactionType.Expense,
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
  const filteredCategories = categories.filter(
    (cat) =>
      cat.type ===
      (selectedType === TransactionType.Income
        ? CategoryType.Income
        : CategoryType.Expense)
  );

  const selectedCategoryId = form.watch("categoryId");
  const selectedCategory = filteredCategories.find(
    (category) => category.id === selectedCategoryId
  );
  const [categorySearch, setCategorySearch] = useState("");

  // Update categoryId when type changes
  useEffect(() => {
    if (filteredCategories.length === 0) {
      return;
    }

    const hasValidSelection = filteredCategories.some(
      (category) => category.id === selectedCategoryId
    );

    if (!hasValidSelection) {
      form.setValue("categoryId", filteredCategories[0].id);
    }
  }, [selectedType, filteredCategories, selectedCategoryId, form]);

  useEffect(() => {
    if (!isOpen) {
      setIsCategoryOpen(false);
      setCategorySearch("");
      return;
    }

    trackEvent("feature_transaction_modal_opened");
  }, [isOpen]);


  const filteredComboboxCategories = categorySearch
    ? filteredCategories.filter((category) =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : filteredCategories;




  const onSubmit = async (values: CreateTransaction) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await createTransaction({
        categoryId: values.categoryId,
        amount: values.amount,
        transactionType: values.type,
        description: values.description,
        notes: values.notes,
        transactionDate: values.date,
      });
      trackEventOnce("first_meaningful_action");
      trackEvent("transaction_created");
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
      <Button
        onClick={form.handleSubmit(onSubmit)}
        disabled={isSubmitting}
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        {isSubmitting ? "Adding..." : "Add Transaction"}
      </Button>
      <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
        Cancel
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
                        autoFocus
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
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value && !isNaN(field.value.getTime())
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          field.onChange(new Date(e.target.value));
                        } else {
                          field.onChange(new Date()); // Default to today when cleared
                        }
                      }}
                    />
                  </FormControl>
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
              name="type"
              render={({ field }) => (
                <FormItem>
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

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Popover
                    open={isCategoryOpen}
                    onOpenChange={(open) => {
                      setIsCategoryOpen(open);
                      if (!open) {
                        setCategorySearch("");
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isCategoryOpen}
                          className="w-full justify-between"
                          onKeyDown={(event) => {
                            if (
                              event.key.length === 1 &&
                              !event.metaKey &&
                              !event.ctrlKey &&
                              !event.altKey &&
                              event.key !== " "
                            ) {
                              event.preventDefault();
                              setIsCategoryOpen(true);
                              setCategorySearch(event.key);
                            }
                          }}
                        >
                          {selectedCategory ? (
                            <div className="flex items-center gap-2">
                              <CategoryIcon
                                icon={selectedCategory.icon}
                                color={selectedCategory.color}
                                size="sm"
                              />
                              <span>{selectedCategory.name}</span>
                            </div>
                          ) : (
                            "Select a category"
                          )}
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search category..."
                          className="h-9"
                          autoFocus
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                          onInput={(event) =>
                            setCategorySearch(
                              (event.target as HTMLInputElement).value
                            )
                          }
                          aria-label="Search category"
                        />
                        <CommandList>
                          <CommandGroup>
                            {filteredComboboxCategories.map((category) => (
                                <CommandItem
                                  key={category.id}
                                  value={category.name}
                                  onSelect={(value) => {
                                    const nextCategory = filteredCategories.find(
                                      (item) =>
                                        item.name.toLowerCase() ===
                                        value.toLowerCase()
                                    );
                                    if (!nextCategory) {
                                      return;
                                    }

                                    field.onChange(nextCategory.id);
                                    form.setValue("categoryId", nextCategory.id, {
                                      shouldValidate: true,
                                    });
                                    setCategorySearch("");
                                    setIsCategoryOpen(false);
                                  }}
                                  data-value={category.name}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCategory?.id === category.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <CategoryIcon
                                    icon={category.icon}
                                    color={category.color}
                                    size="sm"
                                  />
                                  <span>{category.name}</span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                          {filteredComboboxCategories.length === 0 && (
                            <CommandEmpty>No category found.</CommandEmpty>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>

              )}
            />


            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details"
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
