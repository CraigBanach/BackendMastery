import { BudgetVarianceDto } from "@/types/budget";
import { TransactionDto } from "../api/transactionApi";

export interface BudgetVarianceWithTransactions extends BudgetVarianceDto {
  recentTransactions: Array<{
    id: number;
    amount: number;
    description: string;
    date: string;
    notes?: string;
  }>;
  variance: number;
  variancePercentage: number;
}

export function calculateVarianceData(
  budgetVariances: BudgetVarianceDto[],
  transactions: TransactionDto[]
): BudgetVarianceWithTransactions[] {
  return budgetVariances.map(variance => {
    const categoryTransactions = transactions
      .filter(t => t.category.id === variance.category.id)
      .map(t => ({
        id: t.id,
        amount: t.amount,
        description: t.description,
        date: t.transactionDate,
        notes: t.notes,
      }))
      .slice(0, 5); // Limit to 5 recent transactions

    const varianceAmount = variance.actual - variance.budgeted;
    const variancePercentage = variance.budgeted === 0 ? 0 : (varianceAmount / variance.budgeted) * 100;

    return {
      ...variance,
      recentTransactions: categoryTransactions,
      variance: varianceAmount,
      variancePercentage,
    };
  });
}