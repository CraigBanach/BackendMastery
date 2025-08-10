import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { ArrowLeftIcon, PieChart, Plus, Home } from "lucide-react";
import { headers } from "next/headers";

const TopNavigation = async () => {
  const session = await auth0.getSession();

  if (!session) return <div></div>;

  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isTransactionsPage = pathName?.includes("/transactions/new");
  const isBudgetPage = pathName?.includes("/budget");

  return (
    <div className="flex items-center space-x-4">
      {/* Main Navigation Links */}
      <div className="flex items-center space-x-2">
        <Button
          asChild
          variant={pathName === "/dashboard" ? "default" : "ghost"}
          size="sm"
        >
          <a href="/dashboard" className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </a>
        </Button>
        
        <Button
          asChild
          variant={isBudgetPage ? "default" : "ghost"}
          size="sm"
        >
          <a href="/budget" className="flex items-center">
            <PieChart className="h-4 w-4 mr-2" />
            Budget
          </a>
        </Button>
      </div>

      {/* Action Button */}
      <Button
        asChild
        size="sm"
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        {isTransactionsPage ? (
          <a href="/dashboard">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Dashboard
          </a>
        ) : (
          <a href="/transactions/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </a>
        )}
      </Button>
    </div>
  );
};

export default TopNavigation;
