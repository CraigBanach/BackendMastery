import { Suspense } from "react";
import { TransactionsPageClient } from "@/components/transactions/transactionsPageClient";
import { TransactionsPageWithFab } from "@/components/transactions/transactionsPageWithFab";
import { PageHeader } from "@/components/ui/pageHeader";
import { InvitePrompt } from "@/components/ui/invitePrompt";
import { RequireAccount } from "@/components/ui/requireAccount";
import { getTransactions } from "@/lib/api/transactionApi";
import { getCategories } from "@/lib/api/categoryApi";


export const dynamic = "force-dynamic";

interface TransactionsPageProps {
  searchParams?: Promise<{
    year?: string;
    month?: string;
  }>;
}

async function fetchTransactionsData(year: number, month: number) {
  try {
    // TODO: Stop fucking around with strings here
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
    const lastMillisecond = new Date(year, month, 1).getTime() - 1;
    const endDate = new Date(lastMillisecond).toISOString();

    const [transactionsResponse, categories] = await Promise.all([
      getTransactions(
        {
          pageSize: 1000,
          sortBy: "TransactionDate",
          sortDescending: true,
        },
        startDate,
        endDate
      ),
      getCategories(),
    ]);

    return {
      transactions: transactionsResponse?.items || [],
      categories: categories || [],
      pagination: {
        totalCount: transactionsResponse?.totalCount || 0,
        currentPage: transactionsResponse?.currentPage || 1,
        totalPages: transactionsResponse?.totalPages || 1,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching transactions data:", error);
    return {
      transactions: [],
      categories: [],
      pagination: { totalCount: 0, currentPage: 1, totalPages: 1 },
    };
  }
}

async function TransactionsContent({ year, month }: { year: number; month: number }) {
  const { transactions, categories, pagination } = await fetchTransactionsData(
    year,
    month
  );

  return (
    <TransactionsPageWithFab categories={categories}>
      <TransactionsPageClient
        initialTransactions={transactions}
        categories={categories}
        currentYear={year}
        currentMonth={month}
        pagination={pagination}
      />
    </TransactionsPageWithFab>
  );
}

const TransactionsLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-24 rounded-lg bg-muted" />
    <div className="h-64 rounded-lg bg-muted" />
    <div className="h-64 rounded-lg bg-muted" />
  </div>
);

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
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
          title="Transactions"
          subTitle="Track and manage your monthly transactions"
        />
        <InvitePrompt />
        <Suspense fallback={<TransactionsLoading />}>
          <TransactionsContent year={year} month={month} />
        </Suspense>
      </div>
    </RequireAccount>
  );
}

