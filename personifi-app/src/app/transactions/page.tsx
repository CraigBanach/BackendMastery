import { TransactionsPageClient } from "@/components/transactions/transactionsPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { InvitePrompt } from "@/components/ui/invitePrompt";
import { RequireAccount } from "@/components/ui/requireAccount";
import { getTransactions } from "@/lib/api/transactionApi";
import { getCategories } from "@/lib/api/categoryApi";

interface TransactionsPageProps {
  searchParams?: Promise<{
    year?: string;
    month?: string;
  }>;
}

async function fetchTransactionsData(year: number, month: number) {
  try {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;
    
    const [transactionsResponse, categories] = await Promise.all([
      getTransactions({
        pageSize: 100,
        sortBy: 'TransactionDate',
        sortDescending: true,
      }, startDate, endDate),
      getCategories()
    ]);

    return {
      transactions: transactionsResponse?.items || [],
      categories: categories || [],
      pagination: {
        totalCount: transactionsResponse?.totalCount || 0,
        currentPage: transactionsResponse?.currentPage || 1,
        totalPages: transactionsResponse?.totalPages || 1,
      }
    };
  } catch (error: unknown) {
    console.error('Error fetching transactions data:', error);
    return {
      transactions: [],
      categories: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1 }
    };
  }
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const currentDate = new Date();
  const params = await searchParams;
  const year = params?.year ? parseInt(params.year) : currentDate.getFullYear();
  const month = params?.month ? parseInt(params.month) : currentDate.getMonth() + 1;

  const { transactions, categories, pagination } = await fetchTransactionsData(year, month);

  return (
    <RequireAccount>
      <div className="space-y-6">
        <PageHeader
          title="Transactions"
          subTitle="Track and manage your monthly transactions"
        />
        <InvitePrompt />
        <TransactionsPageClient
          initialTransactions={transactions}
          categories={categories}
          currentYear={year}
          currentMonth={month}
          pagination={pagination}
        />
      </div>
    </RequireAccount>
  );
}