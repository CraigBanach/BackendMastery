"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CsvColumnMapping } from "@/lib/api/transactionImportApi";
import { ImportPreview } from "./importPreview";

interface ColumnMappingFormProps {
  headers: string[];
  previewRows: string[][];
  onImport: (mapping: CsvColumnMapping) => void;
  isImporting?: boolean;
}

// Auto-detect column mappings based on header names
const detectColumnMapping = (headers: string[]): CsvColumnMapping => {
  const findColumn = (patterns: string[]) => {
    return (
      headers.find((header) =>
        patterns.some((pattern) =>
          header.toLowerCase().includes(pattern.toLowerCase())
        )
      ) || ""
    );
  };

  return {
    dateColumn: findColumn([
      "date",
      "transaction date",
      "transaction_date",
      "tran date",
    ]),
    descriptionColumn: findColumn([
      "description",
      "merchant",
      "counter party",
      "counterparty",
      "payee",
      "reference",
      "details",
    ]),
    amountColumn: findColumn([
      "amount",
      "value",
      "debit",
      "credit",
      "gbp",
      "usd",
      "eur",
    ]),
    expensesArePositive: true, // Default to Starling Bank convention
  };
};

export function ColumnMappingForm({
  headers,
  previewRows,
  onImport,
  isImporting = false,
}: ColumnMappingFormProps) {
  const [lastHeaders, setLastHeaders] = useState<string[]>(headers);
  const [mapping, setMapping] = useState<CsvColumnMapping>(() => {
    // Only auto-detect if we have at least 3 columns
    return headers.length >= 3
      ? detectColumnMapping(headers)
      : {
          dateColumn: "",
          descriptionColumn: "",
          amountColumn: "",
          expensesArePositive: true,
        };
  });

  // Sync state with props if headers change (Recommended pattern for derived state with user edits)
  if (headers !== lastHeaders) {
    setLastHeaders(headers);
    if (headers.length >= 3) {
      setMapping(detectColumnMapping(headers));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !mapping.dateColumn ||
      !mapping.descriptionColumn ||
      !mapping.amountColumn
    ) {
      alert("Please select all required columns");
      return;
    }

    onImport(mapping);
  };

  const isFormValid =
    mapping.dateColumn && mapping.descriptionColumn && mapping.amountColumn;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Column Mapping</CardTitle>
        <p className="text-sm text-gray-600">
          Map your CSV columns to the required transaction fields
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {/* Date Column */}
            <div className="space-y-2">
              <Label htmlFor="date-column" className="text-sm font-medium">
                Date Column *
              </Label>
              <Select
                value={mapping.dateColumn}
                onValueChange={(value) =>
                  setMapping((prev) => ({ ...prev, dateColumn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description Column */}
            <div className="space-y-2">
              <Label
                htmlFor="description-column"
                className="text-sm font-medium"
              >
                Description Column *
              </Label>
              <Select
                value={mapping.descriptionColumn}
                onValueChange={(value) =>
                  setMapping((prev) => ({ ...prev, descriptionColumn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select description column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Column */}
            <div className="space-y-2">
              <Label htmlFor="amount-column" className="text-sm font-medium">
                Amount Column *
              </Label>
              <Select
                value={mapping.amountColumn}
                onValueChange={(value) =>
                  setMapping((prev) => ({ ...prev, amountColumn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select amount column" />
                </SelectTrigger>
                <SelectContent>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount Convention */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Amount Convention *</Label>
              <RadioGroup
                value={mapping.expensesArePositive ? "positive" : "negative"}
                onValueChange={(value) =>
                  setMapping((prev) => ({
                    ...prev,
                    expensesArePositive: value === "positive",
                  }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="positive" />
                  <Label htmlFor="positive" className="text-sm">
                    Expenses Positive (e.g., 50.00 in CSV = £50 expense)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="negative" />
                  <Label htmlFor="negative" className="text-sm">
                    Expenses Negative (e.g., -50.00 in CSV = £50 expense)
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500">
                Choose how expenses appear in your CSV. Most banks use
                &quot;Expenses Negative&quot;.
              </p>
            </div>
          </div>

          {/* Import Preview */}
          <ImportPreview
            headers={headers}
            previewRows={previewRows}
            mapping={mapping}
          />

          <Button
            type="submit"
            disabled={!isFormValid || isImporting}
            className="w-full"
          >
            {isImporting ? "Importing..." : "Import with these settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
