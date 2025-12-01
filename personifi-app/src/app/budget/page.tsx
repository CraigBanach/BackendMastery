import { BudgetPageClient } from "@/components/budget/budgetPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { getBudgetVariance } from "@/lib/api/budgetApi";
import { getTransactions } from "@/lib/api/transactionApi";
import { calculateVarianceData } from "@/lib/hooks/useBudgetData";

export const dynamic = "force-dynamic";

interface BudgetPageProps {
  searchParams?: Promise<{
    year?: string;
    month?: string;
  }>;
}

async function fetchBudgetData(year: number, month: number) {
  try {
    const [budgetVariances, transactionsResponse] = await Promise.all([
      getBudgetVariance(year, month),
      getTransactions(
        {
          pageSize: 1000,
          sortBy: "TransactionDate",
          sortDescending: true,
        },
        `${year}-${month.toString().padStart(2, "0")}-01`,
        new Date(new Date(year, month, 1).getTime() - 1).toISOString()
      ),
    ]);

    return calculateVarianceData(
      budgetVariances || [],
      transactionsResponse?.items || []
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching budget data:", errorMessage);

    // If it's an account-related error, return null to indicate no data available
    if (
      errorMessage.includes("Bad Request") ||
      errorMessage.includes("account")
    ) {
      return null;
    }

    // For other errors, return empty array
    return [];
  }
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const currentDate = new Date();
  const params = await searchParams;
  const year = params?.year ? parseInt(params.year) : currentDate.getFullYear();
  const month = params?.month
    ? parseInt(params.month)
    : currentDate.getMonth() + 1;

  const initialData = await fetchBudgetData(year, month);

  return (
    <RequireAccount>
      <div className="space-y-6">
        <PageHeader
          title="Budget Overview"
          subTitle="Track your spending against budgeted amounts"
        />
        <BudgetPageClient data={initialData || []} year={year} month={month} />
      </div>
    </RequireAccount>
  );
}
