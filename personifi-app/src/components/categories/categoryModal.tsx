"use client";

import { useState } from "react";
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
import { PoundSterlingIcon } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Category name is required" })
    .max(50, { message: "Category name must be 50 characters or less" }),
  type: z.nativeEnum(CategoryType),
  icon: z.string().min(1, { message: "Icon is required" }),
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
      budgetAmount: undefined,
    },
  });

  const selectedType = form.watch("type");

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSave({
        name: values.name,
        type: values.type,
        icon: values.icon,
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
    form.reset();
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
                <FormItem className="space-y-3">
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={CategoryType.Expense} />
                        </FormControl>
                        <FormLabel className="font-normal">Expense</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={CategoryType.Income} />
                        </FormControl>
                        <FormLabel className="font-normal">Income</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="budgetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly Budget (Optional)</FormLabel>
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
                  Set a budget amount for this category for the current month
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