import { Suspense } from "react";
import { BudgetPageClient } from "@/components/budget/budgetPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { hasAccount } from "@/lib/api/accountApi";
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

const missingAccountMessage =
  "Please create an account first using POST /api/account/create";

const isMissingAccountError = (errorMessage: string) =>
  errorMessage.includes(missingAccountMessage);

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

    // If it's an account-related error, return null to indicate no data available
    if (isMissingAccountError(errorMessage) || errorMessage === "Bad Request") {
      const userHasAccount = await hasAccount();
      if (!userHasAccount) {
        console.info("Budget data unavailable until onboarding completes.");
        return null;
      }
    }

    console.error("Error fetching budget data:", errorMessage);

    // For other errors, return empty array
    return [];
  }
}

async function BudgetPageData({ year, month }: { year: number; month: number }) {
  const initialData = await fetchBudgetData(year, month);

  return <BudgetPageClient data={initialData || []} year={year} month={month} />;
}

const BudgetLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-28 rounded-lg bg-muted" />
    <div className="h-64 rounded-lg bg-muted" />
  </div>
);

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const currentDate = new Date();
  const params = await searchParams;
  const year = params?.year ? parseInt(params.year) : currentDate.getFullYear();
  const month = params?.month
    ? parseInt(params.month)
    : currentDate.getMonth() + 1;

  return (
    <RequireAccount>
      <div className="space-y-6">
        <PageHeader
          title="Budget Overview"
          subTitle="Track your spending against budgeted amounts"
        />
        <Suspense fallback={<BudgetLoading />}>
          <BudgetPageData year={year} month={month} />
        </Suspense>
      </div>
    </RequireAccount>
  );
}

