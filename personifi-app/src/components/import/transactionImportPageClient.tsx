"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountRequiredWrapper } from "@/components/ui/accountRequiredWrapper";
import { PageHeader } from "@/components/ui/pageHeader";
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  importTransactionsFromCSV,
  getImportHistory,
  getPendingTransactions,
  TransactionImportDto,
} from "@/lib/api/transactionImportApi";
import { useEffect } from "react";
import { format } from "date-fns";

export default function TransactionImportPageClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<TransactionImportDto | null>(
    null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importHistory, setImportHistory] = useState<TransactionImportDto[]>(
    []
  );
  const [hasPendingTransactions, setHasPendingTransactions] = useState(false);
  const [isCheckingPending, setIsCheckingPending] = useState(true);

  useEffect(() => {
    loadImportHistory();
    checkPendingTransactions();
  }, []);

  // Refresh pending check when the page becomes visible (user returns from review page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPendingTransactions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const checkPendingTransactions = async () => {
    try {
      setIsCheckingPending(true);
      const pendingResult = await getPendingTransactions(1, 1);
      const hasPending = pendingResult.totalCount > 0;
      console.log('Pending transactions check:', { totalCount: pendingResult.totalCount, hasPending });
      setHasPendingTransactions(hasPending);
    } catch (error: unknown) {
      console.error("Failed to check pending transactions:", error);
      setHasPendingTransactions(false);
    } finally {
      setIsCheckingPending(false);
    }
  };

  const loadImportHistory = async () => {
    try {
      const history = await getImportHistory();
      setImportHistory(history);
    } catch (error: unknown) {
      console.error("Failed to load import history:", error);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setUploadError("Please select a CSV file");
        return;
      }

      setSelectedFile(file);
      setUploadError(null);
      setUploadResult(null);

      // Auto-import the file
      await handleUpload(file);
    }
  };

  const handleUpload = async (file?: File) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await importTransactionsFromCSV(fileToUpload);
      setUploadResult(result);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("csv-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh import history and check pending
      await loadImportHistory();
      await checkPendingTransactions();

      // Auto-redirect to review page if there are processed transactions
      if (result.processedTransactions > 0) {
        setTimeout(() => {
          window.location.href = "/import/review";
        }, 1500); // Brief delay to show success message
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  };

  return (
    <AccountRequiredWrapper>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Import Transactions"
          subTitle="Upload and process bank transaction files"
        />

        {/* Pending Transactions Alert */}
        {!isCheckingPending && hasPendingTransactions && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-orange-800">
                      Pending Transactions Need Review
                    </h4>
                    <p className="text-sm text-orange-700">
                      You have transactions waiting to be reviewed and
                      categorized.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => (window.location.href = "/import/review")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Review Now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Select CSV file from your bank</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <p className="text-sm text-gray-600">
                Currently supports Starling Bank CSV exports. Ensure your file
                includes Date, Counter Party, Amount, and other standard fields.
              </p>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-md">
                <Clock className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-blue-800">
                  Importing transactions...
                </span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{uploadError}</p>
              </div>
            )}

            {uploadResult && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">
                    Import Successful!
                  </h4>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>File: {uploadResult.fileName}</p>
                  <p>Total transactions: {uploadResult.totalTransactions}</p>
                  <p>Processed: {uploadResult.processedTransactions}</p>
                  {uploadResult.duplicateTransactions > 0 && (
                    <p className="text-amber-700">
                      Duplicates detected: {uploadResult.duplicateTransactions}
                    </p>
                  )}
                  {uploadResult.processedTransactions > 0 && (
                    <p className="text-blue-700 font-medium mt-2">
                      Redirecting to review page...
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Import History */}
        <Card>
          <CardHeader>
            <CardTitle>Import History</CardTitle>
          </CardHeader>
          <CardContent>
            {importHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No imports yet</p>
            ) : (
              <div className="space-y-3">
                {importHistory.map((importRecord) => (
                  <div
                    key={importRecord.id}
                    className="flex items-center justify-between p-3 border rounded-md"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(importRecord.status)}
                      <div>
                        <p className="font-medium">{importRecord.fileName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(importRecord.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p>{importRecord.totalTransactions} transactions</p>
                      <div className="flex gap-3 text-xs mt-1">
                        {importRecord.approvedTransactions > 0 && (
                          <span className="text-green-600">
                            ✓ {importRecord.approvedTransactions} approved
                          </span>
                        )}
                        {importRecord.rejectedTransactions > 0 && (
                          <span className="text-red-600">
                            ✗ {importRecord.rejectedTransactions} rejected
                          </span>
                        )}
                        {(importRecord.totalTransactions - importRecord.approvedTransactions - importRecord.rejectedTransactions) > 0 && (
                          <span className="text-blue-600">
                            ⏳ {importRecord.totalTransactions - importRecord.approvedTransactions - importRecord.rejectedTransactions} pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountRequiredWrapper>
  );
}
