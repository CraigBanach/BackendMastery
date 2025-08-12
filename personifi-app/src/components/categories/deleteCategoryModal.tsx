"use client";

import { useState } from "react";
import { CategoryDto } from "@/types/budget";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  category: CategoryDto | null;
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onConfirm,
  category,
}: DeleteCategoryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error)?.message || "Failed to delete category";
      
      // Check if error indicates existing transactions/budgets
      if (errorMessage.includes("transaction") || errorMessage.includes("budget")) {
        setDeleteError(
          "Cannot delete this category because it has existing transactions or budgets. " +
          "Please remove all associated data before deleting the category."
        );
      } else {
        setDeleteError(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setDeleteError("");
    onClose();
  };

  if (!category) return null;

  const footer = (
    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        onClick={handleConfirm}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete Category"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Category"
      description="This action cannot be undone"
      maxWidth="md"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Are you sure you want to delete the category &ldquo;{category.name}&rdquo;?
            </p>
            <p className="text-sm text-muted-foreground">
              This category will be permanently removed. If this category has existing 
              transactions or budgets, the deletion will be prevented to maintain data integrity.
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.icon || "📁"}</span>
            <span className="font-medium">{category.name}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              category.type === "Expense" 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {category.type}
            </span>
          </div>
        </div>

        {deleteError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
            {deleteError}
          </div>
        )}
      </div>
    </Modal>
  );
}