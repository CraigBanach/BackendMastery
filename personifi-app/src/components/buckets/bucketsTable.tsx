"use client";

import { BucketDto } from "@/types/bucket";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Trash2, PoundSterling } from "lucide-react";

interface BucketsTableProps {
  buckets: BucketDto[];
  onEdit: (bucket: BucketDto) => void;
  onDelete: (bucket: BucketDto) => void;
}

export function BucketsTable({ buckets, onEdit, onDelete }: BucketsTableProps) {
  if (buckets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No buckets found. Create your first savings bucket to get started.</p>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  return (
    <>
      {/* Mobile: Card Layout */}
      <div className="block sm:hidden space-y-3">
        {buckets.map((bucket) => (
          <Card key={bucket.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: bucket.color || "#64748b" }}
                >
                  <PoundSterling className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-semibold text-base">{bucket.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(bucket)}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  <Edit className="h-4 w-4 text-blue-600" />
                  <span className="sr-only">Edit bucket</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(bucket)}
                  className="h-8 w-8 p-0 text-destructive hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="sr-only">Delete bucket</span>
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-medium ml-2">{formatCurrency(bucket.currentBalance)}</span>
              </div>
              {bucket.targetAmount !== undefined && bucket.targetAmount !== null && (
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium ml-2">{formatCurrency(bucket.targetAmount)}</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Desktop: Table Layout */}
      <div className="hidden sm:block rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">
                  Color
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                  Name
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Current Balance
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Target Amount
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((bucket) => (
                <tr key={bucket.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="p-4 align-middle">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: bucket.color || "#64748b" }}
                    >
                      <PoundSterling className="h-4 w-4" />
                    </div>
                  </td>
                  <td className="p-4 align-middle font-medium">
                    {bucket.name}
                  </td>
                  <td className="p-4 align-middle text-right font-medium">
                    {formatCurrency(bucket.currentBalance)}
                  </td>
                  <td className="p-4 align-middle text-right text-muted-foreground">
                    {bucket.targetAmount ? formatCurrency(bucket.targetAmount) : '-'}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(bucket)}
                        className="h-8 w-8 p-0 hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                        <span className="sr-only">Edit bucket</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(bucket)}
                        className="h-8 w-8 p-0 text-destructive hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                        <span className="sr-only">Delete bucket</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
