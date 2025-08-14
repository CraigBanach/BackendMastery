"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { TrendingUp, TrendingDown, Receipt } from "lucide-react";

interface MonthlySummaryProps {
  income: number;
  expenses: number;
  transactionCount: number;
}

export function MonthlySummary({ income, expenses, transactionCount }: MonthlySummaryProps) {
  const netAmount = income - expenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(income)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(expenses)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
          <div className={`h-4 w-4 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netAmount >= 0 ? <TrendingUp /> : <TrendingDown />}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netAmount))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <Receipt className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {transactionCount}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}