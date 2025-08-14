import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { PieChart, Receipt } from "lucide-react";
import { headers } from "next/headers";
import { MobileNavMenu } from "./mobileNavMenu";

const TopNavigation = async () => {
  const session = await auth0.getSession();

  if (!session) return <div></div>;

  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isBudgetPage = pathName?.includes("/budget");
  const isTransactionsPage = pathName?.includes("/transactions");
  const isCategoriesPage = pathName?.includes("/categories");

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2">
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
          <Button
            asChild
            variant={isTransactionsPage ? "default" : "ghost"}
            size="sm"
          >
            <a href="/transactions" className="flex items-center">
              <Receipt className="h-4 w-4 mr-2" />
              Transactions
            </a>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="flex md:hidden">
        <MobileNavMenu 
          isBudgetPage={isBudgetPage}
          isTransactionsPage={isTransactionsPage}
          isCategoriesPage={isCategoriesPage}
        />
      </div>
    </>
  );
};

export default TopNavigation;
