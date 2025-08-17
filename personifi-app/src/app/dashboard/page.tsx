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
  title: "Dashboard | Personifi",
  description: "Manage your personal finances with ease",
};

const Dashboard = async () => {
  const userHasAccount = await hasAccount();

  if (!userHasAccount) {
    return <AccountSetupPrompt />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        subTitle="Get an overview of your financial health"
      />
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
    </>
  );
};

export default Dashboard;
