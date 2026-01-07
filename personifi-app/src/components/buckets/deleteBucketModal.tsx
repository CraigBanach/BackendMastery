"use client";

import { useState } from "react";
import { BucketDto } from "@/types/bucket";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, PoundSterling } from "lucide-react";

interface DeleteBucketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bucket: BucketDto | null;
}

export function DeleteBucketModal({
  isOpen,
  onClose,
  onConfirm,
  bucket,
}: DeleteBucketModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleConfirm = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error)?.message || "Failed to delete bucket";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setDeleteError("");
    onClose();
  };

  if (!bucket) return null;

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
        {isDeleting ? "Deleting..." : "Delete Bucket"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Delete Bucket"
      description="This action cannot be undone"
      maxWidth="md"
      footer={footer}
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Are you sure you want to delete the bucket &ldquo;{bucket.name}&rdquo;?
            </p>
            <p className="text-sm text-muted-foreground">
              This bucket will be permanently removed.
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: bucket.color || "#64748b" }}
            >
              <PoundSterling className="h-4 w-4" />
            </div>
            <span className="font-medium">{bucket.name}</span>
            <span className="text-sm text-muted-foreground ml-auto">
              Balance: {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(bucket.currentBalance)}
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
