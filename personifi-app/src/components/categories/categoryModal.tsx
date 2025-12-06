"use client";

import { useState, useEffect } from "react";
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
import { IconPicker } from "@/components/ui/iconPicker";
import { CategoryDto, CategoryType } from "@/types/budget";
import { PoundSterlingIcon, Check } from "lucide-react";
import { getBudget } from "@/lib/api/budgetApi";
import { cn, getContrastingTextColor } from "@/lib/utils";

const CATEGORY_COLOURS = [
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#64748b", // slate-500
  "#71717a", // zinc-500
];

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .max(50, { message: "Category name must be 50 characters or less" }),
  type: z.nativeEnum(CategoryType),
  icon: z.string().min(1, { message: "Icon is required" }),
  color: z.string().min(1, { message: "Colour is required" }), // User-facing message, so "Colour"
  budgetAmount: z.coerce.number().nonnegative().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    type: CategoryType;
    icon?: string;
    color?: string;
    budgetAmount?: number;
  }) => Promise<void>;
  category?: CategoryDto | null;
  title: string;
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  title,
}: CategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      type: category?.type || CategoryType.Expense,
      icon: category?.icon || "",
      color: category?.color || CATEGORY_COLOURS[0], // Code variable: color
      budgetAmount: 0,
    },
  });

  // Reset and populate form when modal opens or category changes
  useEffect(() => {
    if (isOpen) {
      // Reset form with category data
      form.reset({
        name: category?.name || "",
        type: category?.type || CategoryType.Expense,
        icon: category?.icon || "",
        color: category?.color || CATEGORY_COLOURS[0], // Code variable: color
        budgetAmount: 0,
      });

      // Load budget if editing an existing category
      const loadBudget = async () => {
        if (category) {
          try {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // JavaScript months are 0-based
            
            const budget = await getBudget(category.id, year, month);
            if (budget) {
              form.setValue('budgetAmount', budget.amount);
            }
          } catch (error) {
            console.error('Failed to load budget:', error);
            // Don't show error to user, just leave field empty
          }
        }
      };

      loadBudget();
    }
  }, [category, isOpen, form]);

  const selectedType = form.watch("type");

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSave({
        name: values.name,
        type: values.type,
        icon: values.icon,
        color: values.color,
        budgetAmount: values.budgetAmount,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      setSubmitError(
        (error as Error)?.message || "Failed to save category"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset({
      name: "",
      type: CategoryType.Expense,
      icon: "",
      color: CATEGORY_COLOURS[0], // Code variable: color
      budgetAmount: 0,
    });
    setSubmitError("");
    onClose();
  };

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button
        onClick={form.handleSubmit(handleSubmit)}
        disabled={isSubmitting}
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        {isSubmitting ? "Saving..." : category ? "Update Category" : "Create Category"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={
        category
          ? "Update the category details below"
          : "Create a new category and optionally set a budget for this month"
      }
      maxWidth="2xl"
      footer={footer}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Groceries, Salary"
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
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4 mt-2"
                      disabled={!!category} // Disable when editing existing category
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={CategoryType.Expense} disabled={!!category} />
                        </FormControl>
                        <FormLabel className={`font-normal ${category ? 'text-muted-foreground' : ''}`}>
                          Expense
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={CategoryType.Income} disabled={!!category} />
                        </FormControl>
                        <FormLabel className={`font-normal ${category ? 'text-muted-foreground' : ''}`}>
                          Income
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  {category && (
                    <p className="text-xs text-muted-foreground">
                      Category type cannot be changed after creation to maintain data consistency.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <IconPicker
                    value={field.value}
                    onChange={field.onChange}
                    categoryType={selectedType}
                    placeholder="Select an icon for this category"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Colour</FormLabel> {/* User-facing label */}
                  <FormControl>
                    <div>
                      <div className="flex flex-wrap gap-2 items-center mb-4">
                        {CATEGORY_COLOURS.map((colour) => ( // Using CATEGORY_COLOURS
                          <div
                            key={colour}
                            className={cn(
                              "h-6 w-6 rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-110",
                              field.value === colour ? "ring-2 ring-offset-2 ring-black" : ""
                            )}
                            style={{ backgroundColor: colour }}
                            onClick={() => field.onChange(colour)}
                          >
                            {field.value === colour && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <div 
                          className="relative h-10 w-10 rounded-full cursor-pointer overflow-hidden ring-1 ring-gray-200"
                          style={{ backgroundColor: field.value }}
                        >
                          <input
                            type="color"
                            id="custom-color-picker"
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="absolute inset-0 w-full h-full border-none p-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <label htmlFor="custom-color-picker" className="text-sm font-medium cursor-pointer">
                          {
                            !CATEGORY_COLOURS.includes(field.value) // Check against CATEGORY_COLOURS
                              ? "Selected Custom Colour" // User-facing text
                              : "Choose Custom Colour" // User-facing text
                          }
                        </label>
                        {/* Show checkmark if custom color is selected and not one of the presets */}
                        {!CATEGORY_COLOURS.includes(field.value) && ( // Check against CATEGORY_COLOURS
                           <Check className="h-4 w-4 text-white drop-shadow-md -ml-8 pointer-events-none" style={{ color: getContrastingTextColor(field.value) }} /> // Use getContrastingTextColor
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="budgetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {selectedType === CategoryType.Income 
                    ? "Monthly Expected Income (Optional)" 
                    : "Monthly Budget (Optional)"
                  }
                </FormLabel>
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
                <p className="text-sm text-muted-foreground">
                  {selectedType === CategoryType.Income
                    ? "Set an expected income amount for this category for the current month"
                    : "Set a budget amount for this category for the current month"
                  }
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

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