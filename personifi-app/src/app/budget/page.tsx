import { BudgetPageClient } from "@/components/budget/budgetPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { getBudgetVariance } from "@/lib/api/budgetApi";
import { getTransactions } from "@/lib/api/transactionApi";
import { calculateVarianceData } from "@/lib/hooks/useBudgetData";

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
      getTransactions({
        pageSize: 100,
        sortBy: 'TransactionDate',
        sortDescending: true,
      }, 
      `${year}-${month.toString().padStart(2, '0')}-01`,
      `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`)
    ]);

    return calculateVarianceData(budgetVariances || [], transactionsResponse?.items || []);
  } catch (error: unknown) {
    console.error('Error fetching budget data:', error);
    // Return empty data instead of redirecting to logout
    return [];
  }
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const currentDate = new Date();
  const params = await searchParams;
  const year = params?.year ? parseInt(params.year) : currentDate.getFullYear();
  const month = params?.month ? parseInt(params.month) : currentDate.getMonth() + 1;

  const initialData = await fetchBudgetData(year, month);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Overview"
        subTitle="Track your spending against budgeted amounts"
      />
      <BudgetPageClient
        initialData={initialData}
        currentYear={year}
        currentMonth={month}
      />
    </div>
  );
}