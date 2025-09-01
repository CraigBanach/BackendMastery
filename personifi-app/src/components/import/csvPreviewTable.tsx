"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CsvPreviewTableProps {
  headers: string[];
  previewRows: string[][];
  totalRows: number;
}

export function CsvPreviewTable({ headers, previewRows, totalRows }: CsvPreviewTableProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>CSV Preview</CardTitle>
        <p className="text-sm text-gray-600">
          Showing first {previewRows.length} rows of {totalRows} total transactions
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="border border-gray-300 px-3 py-2 text-left text-sm font-medium text-gray-900"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-gray-300 px-3 py-2 text-sm text-gray-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}