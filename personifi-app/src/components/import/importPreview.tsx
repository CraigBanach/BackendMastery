"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CsvColumnMapping } from "@/lib/api/transactionImportApi";
import { formatCurrency } from "@/lib/currency";

interface ImportPreviewProps {
  headers: string[];
  previewRows: string[][];
  mapping: CsvColumnMapping;
}

export function ImportPreview({ headers, previewRows, mapping }: ImportPreviewProps) {
  const hasRequiredMappings = mapping.dateColumn && mapping.descriptionColumn && mapping.amountColumn;
  
  if (!hasRequiredMappings) {
    return (
      <Card className="mb-6 border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-600">Import Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Select Date, Description, and Amount columns to see how your transactions will be imported.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find column indexes
  const dateIndex = headers.indexOf(mapping.dateColumn);
  const descriptionIndex = headers.indexOf(mapping.descriptionColumn);
  const amountIndex = headers.indexOf(mapping.amountColumn);

  // Transform preview rows to show how they'll be imported
  const transformedRows = previewRows.map((row) => {
    if (row.length <= Math.max(dateIndex, descriptionIndex, amountIndex)) {
      return null; // Skip rows that don't have enough columns
    }

    try {
      const rawAmount = parseFloat(row[amountIndex]?.replace(/[£$,]/g, '') || '0');
      // Preview shows how transactions will be classified during import:
      // - If expensesArePositive=false: positive CSV = income, negative CSV = expense
      // - If expensesArePositive=true: negative CSV = income, positive CSV = expense
      const isIncome = mapping.expensesArePositive ? (rawAmount < 0) : (rawAmount > 0);
      
      return {
        date: row[dateIndex],
        description: row[descriptionIndex],
        rawAmount: rawAmount,
        finalAmount: rawAmount, // Show original amount in preview
        isIncome: isIncome,
      };
    } catch {
      return null; // Skip rows that can't be parsed
    }
  }).filter(Boolean);

  if (transformedRows.length === 0) {
    return (
      <Card className="mb-6 border-orange-200">
        <CardHeader>
          <CardTitle className="text-orange-800">Import Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">
            Unable to preview transactions. Please check your column mappings and CSV format.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-800">Import Preview</CardTitle>
        <p className="text-sm text-blue-600">
          Here&apos;s how your first {transformedRows.length} transactions will be imported
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transformedRows.map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {transaction!.description}
                </div>
                <div className="text-sm text-gray-600">
                  {transaction!.date}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-medium ${
                  transaction!.isIncome ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(Math.abs(transaction!.finalAmount))}
                </div>
                <Badge variant={transaction!.isIncome ? "default" : "destructive"} className="text-xs">
                  {transaction!.isIncome ? 'Income' : 'Expense'}
                </Badge>
              </div>
            </div>
          ))}
          
          {/* Show amount convention explanation */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              <strong>Amount Convention:</strong> {mapping.expensesArePositive ? 'Expenses Positive' : 'Expenses Negative'}
              {' - '}
              {mapping.expensesArePositive 
                ? 'Positive CSV values = expenses, Negative CSV values = income' 
                : 'Negative CSV values = expenses, Positive CSV values = income'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}