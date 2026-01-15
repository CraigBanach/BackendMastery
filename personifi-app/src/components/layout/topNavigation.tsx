import { Button } from "@/components/ui/button";
import { PieChart, Receipt, Upload } from "lucide-react";
import { headers } from "next/headers";
import { MobileNavMenu } from "./mobileNavMenu";

const TopNavigation = async () => {
  const headerList = await headers();
  const pathName = headerList.get("x-current-path");

  const isBudgetPage = pathName?.includes("/budget") ?? false;
  const isTransactionsPage = pathName?.includes("/transactions") ?? false;
  const isCategoriesPage = pathName?.includes("/categories") ?? false;
  const isBucketsPage = pathName?.includes("/buckets") ?? false;
  const isImportPage = pathName?.includes("/import") ?? false;


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
          <Button
            asChild
            variant={isImportPage ? "default" : "ghost"}
            size="sm"
          >
            <a href="/import" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Import
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
          isBucketsPage={isBucketsPage}
          isImportPage={isImportPage}
        />
      </div>
    </>
  );
};

export default TopNavigation;
