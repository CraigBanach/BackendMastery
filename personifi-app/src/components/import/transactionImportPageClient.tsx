"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountRequiredWrapper } from "@/components/ui/accountRequiredWrapper";
import { PageHeader } from "@/components/ui/pageHeader";
import { Upload, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { importTransactionsFromCSV, getImportHistory, TransactionImportDto } from "@/lib/api/transactionImportApi";
import { useEffect } from "react";
import { format } from "date-fns";

export default function TransactionImportPageClient() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<TransactionImportDto | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [importHistory, setImportHistory] = useState<TransactionImportDto[]>([]);

  useEffect(() => {
    loadImportHistory();
  }, []);

  const loadImportHistory = async () => {
    try {
      const history = await getImportHistory();
      setImportHistory(history);
    } catch (error: unknown) {
      console.error("Failed to load import history:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setUploadError("Please select a CSV file");
        return;
      }
      setSelectedFile(file);
      setUploadError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await importTransactionsFromCSV(selectedFile);
      setUploadResult(result);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh import history
      await loadImportHistory();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
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
        <PageHeader title="Import Transactions" subTitle="Upload and process bank transaction files" />

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
                Currently supports Starling Bank CSV exports. Ensure your file includes Date, Counter Party, Amount, and other standard fields.
              </p>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? "Uploading..." : "Import"}
                </Button>
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
                  <h4 className="font-medium text-green-800">Import Successful!</h4>
                </div>
                <div className="text-sm text-green-700 space-y-1">
                  <p>File: {uploadResult.fileName}</p>
                  <p>Total transactions: {uploadResult.totalTransactions}</p>
                  <p>Processed: {uploadResult.processedTransactions}</p>
                  {uploadResult.duplicateTransactions > 0 && (
                    <p className="text-amber-700">Duplicates detected: {uploadResult.duplicateTransactions}</p>
                  )}
                </div>
                {uploadResult.processedTransactions > 0 && (
                  <div className="mt-3">
                    <Button 
                      onClick={() => window.location.href = '/import/review'}
                      size="sm"
                    >
                      Review Pending Transactions
                    </Button>
                  </div>
                )}
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
                  <div key={importRecord.id} className="flex items-center justify-between p-3 border rounded-md">
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
                      <div className="flex gap-4 text-xs text-gray-500">
                        <span className="text-green-600">✓ {importRecord.approvedTransactions}</span>
                        <span className="text-red-600">✗ {importRecord.rejectedTransactions}</span>
                        {importRecord.duplicateTransactions > 0 && (
                          <span className="text-amber-600">⚠ {importRecord.duplicateTransactions}</span>
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