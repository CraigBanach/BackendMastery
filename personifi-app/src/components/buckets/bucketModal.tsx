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
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { BucketDto } from "@/types/bucket";
import { Check, PoundSterlingIcon } from "lucide-react";
import { cn, getContrastingTextColor } from "@/lib/utils";

const BUCKET_COLOURS = [
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
    .min(1, { message: "Bucket name is required" })
    .max(50, { message: "Bucket name must be 50 characters or less" }),
  color: z.string().min(1, { message: "Colour is required" }),
  targetAmount: z.coerce
    .number()
    .nonnegative()
    .optional() as z.ZodOptional<z.ZodNumber>,
  currentBalance: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
});

type FormData = z.infer<typeof formSchema>;

interface BucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    color?: string;
    targetAmount?: number;
    currentBalance?: number;
  }) => Promise<void>;
  bucket?: BucketDto | null;
  title: string;
}

export function BucketModal({
  isOpen,
  onClose,
  onSave,
  bucket,
  title,
}: BucketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bucket?.name || "",
      color: bucket?.color || BUCKET_COLOURS[0],
      targetAmount: bucket?.targetAmount || undefined,
      currentBalance: bucket?.currentBalance ?? 0,
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: bucket?.name || "",
        color: bucket?.color || BUCKET_COLOURS[0],
        targetAmount: bucket?.targetAmount || undefined,
        currentBalance: bucket?.currentBalance ?? 0,
      });
    }
  }, [bucket, isOpen, form]);

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await onSave({
        name: values.name,
        color: values.color,
        targetAmount: values.targetAmount,
        currentBalance: values.currentBalance,
      });
      form.reset();
    } catch (error) {
      console.error(error);
      setSubmitError((error as Error)?.message || "Failed to save bucket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset({
      name: "",
      color: BUCKET_COLOURS[0],
      targetAmount: undefined,
      currentBalance: 0,
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
        {isSubmitting
          ? "Saving..."
          : bucket
          ? "Update Bucket"
          : "Create Bucket"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      description={
        bucket
          ? "Update the bucket details below"
          : "Create a new savings bucket"
      }
      maxWidth="lg"
      footer={footer}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bucket Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Holiday Fund, Emergency Savings" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Colour</FormLabel>
                <FormControl>
                  <div>
                    <div className="flex flex-wrap gap-2 items-center mb-4">
                      {BUCKET_COLOURS.map((colour) => (
                        <div
                          key={colour}
                          className={cn(
                            "h-6 w-6 rounded-full cursor-pointer flex items-center justify-center transition-all hover:scale-110",
                            field.value === colour
                              ? "ring-2 ring-offset-2 ring-black"
                              : ""
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
                          id="custom-bucket-color-picker"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="absolute inset-0 w-full h-full border-none p-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <label
                        htmlFor="custom-bucket-color-picker"
                        className="text-sm font-medium cursor-pointer"
                      >
                        {
                          !BUCKET_COLOURS.includes(field.value)
                            ? "Selected Custom Colour"
                            : "Choose Custom Colour"
                        }
                      </label>
                      {!BUCKET_COLOURS.includes(field.value) && (
                        <Check
                          className="h-4 w-4 text-white drop-shadow-md -ml-8 pointer-events-none"
                          style={{
                            color: getContrastingTextColor(field.value),
                          }}
                        />
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Amount (Optional)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PoundSterlingIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      aria-label="Target Amount (Optional)"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-muted-foreground">
                  Set a savings goal for this bucket
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Current Balance</FormLabel>
                <FormControl>
                  <div className="relative">
                    <PoundSterlingIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-9"
                      aria-label="Current Balance"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </div>
                </FormControl>
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
