import { Suspense } from "react";
import { BudgetProgress } from "@/components/dashboard/budgetProgress";
import { OverviewCards } from "@/components/dashboard/overviewCards";
import { RecentTransactions } from "@/components/dashboard/recentTransactions";
import { SavingsGoals } from "@/components/dashboard/savingsGoals";
import { SpendingChart } from "@/components/dashboard/spendingChart";
import { UpcomingBills } from "@/components/dashboard/upcomingBills";
import { PageHeader } from "@/components/ui/pageHeader";
import { AccountSetupPrompt } from "@/components/ui/accountSetupPrompt";
import { hasAccount } from "@/lib/api/accountApi";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your personal finances with ease",
};

const DashboardContent = async () => {
  const userHasAccount = await hasAccount();

  if (!userHasAccount) {
    return <AccountSetupPrompt />;
  }

  return (
    <section className="flex flex-col gap-6">
      <OverviewCards />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <SpendingChart />
        <BudgetProgress />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <RecentTransactions />
        <div className="flex flex-col gap-6 col-span-4 lg:col-span-3">
          <UpcomingBills />
          <SavingsGoals />
        </div>
      </div>
    </section>
  );
};

const DashboardLoading = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={`card-${index}`} className="h-24 rounded-lg bg-muted" />
      ))}
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <div className="h-64 rounded-lg bg-muted lg:col-span-4" />
      <div className="h-64 rounded-lg bg-muted lg:col-span-3" />
    </div>
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
      <div className="h-64 rounded-lg bg-muted lg:col-span-4" />
      <div className="h-64 rounded-lg bg-muted lg:col-span-3" />
    </div>
  </div>
);

const Dashboard = async () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subTitle="Get an overview of your financial health"
      />
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContent />
      </Suspense>
    </>
  );
};

export default Dashboard;

