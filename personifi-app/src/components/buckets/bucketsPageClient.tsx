"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useModalManager } from "@/lib/providers/modal-provider";
import { BucketDto } from "@/types/bucket";
import {
  createBucket,
  deleteBucket,
  getBuckets,
  updateBucket,
} from "@/lib/api/bucketApi";
import { BucketModal } from "./bucketModal";
import { BucketsTable } from "./bucketsTable";
import { DeleteBucketModal } from "./deleteBucketModal";


interface BucketsPageClientProps {
  initialBuckets: BucketDto[];
}

export function BucketsPageClient({ initialBuckets }: BucketsPageClientProps) {
  const [buckets, setBuckets] = useState(initialBuckets);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBucket, setEditingBucket] = useState<BucketDto | null>(null);
  const [deletingBucket, setDeletingBucket] = useState<BucketDto | null>(null);
  const { isModalOpen } = useModalManager();


  const refreshBuckets = async () => {
    try {
      const updated = await getBuckets();
      setBuckets(updated);
    } catch (error) {
      console.error("Failed to refresh buckets:", error);
    }
  };

  const handleCreateBucket = async (bucketData: {
    name: string;
    color?: string;
    targetAmount?: number;
    currentBalance?: number;
  }) => {
    try {
      await createBucket({
        name: bucketData.name,
        color: bucketData.color,
        targetAmount: bucketData.targetAmount,
        currentBalance: bucketData.currentBalance,
      });
      
      await refreshBuckets();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create bucket:", error);
      throw error;
    }
  };

  const handleUpdateBucket = async (bucketData: {
    name: string;
    color?: string;
    targetAmount?: number;
    currentBalance?: number;
  }) => {
    if (!editingBucket) return;

    try {
      await updateBucket(editingBucket.id, {
        name: bucketData.name,
        color: bucketData.color,
        targetAmount: bucketData.targetAmount,
        currentBalance: bucketData.currentBalance,
      });

      await refreshBuckets();
      setEditingBucket(null);
    } catch (error) {
      console.error("Failed to update bucket:", error);
      throw error;
    }
  };

  const handleDeleteBucket = async () => {
    if (!deletingBucket) return;

    try {
      await deleteBucket(deletingBucket.id);
      await refreshBuckets();
      setDeletingBucket(null);
    } catch (error) {
      console.error("Failed to delete bucket:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-8">
      {/* Add Bucket Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={isModalOpen}
          className="bg-finance-green hover:bg-finance-green-dark"
        >

          <Plus className="h-4 w-4 mr-2" />
          Add Bucket
        </Button>
      </div>

      {/* Buckets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <span className="text-sm text-gray-500">
            {buckets.length} {buckets.length === 1 ? 'bucket' : 'buckets'}
          </span>
        </div>
        
        <BucketsTable
          buckets={buckets}
          onEdit={setEditingBucket}
          onDelete={setDeletingBucket}
        />
      </div>

      {/* Modals */}
      <BucketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateBucket}
        title="Create Bucket"
      />

      <BucketModal
        isOpen={!!editingBucket}
        onClose={() => setEditingBucket(null)}
        onSave={handleUpdateBucket}
        bucket={editingBucket}
        title="Edit Bucket"
      />

      <DeleteBucketModal
        isOpen={!!deletingBucket}
        onClose={() => setDeletingBucket(null)}
        onConfirm={handleDeleteBucket}
        bucket={deletingBucket}
      />
    </div>
  );
}
