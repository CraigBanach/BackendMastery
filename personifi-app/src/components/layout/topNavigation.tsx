import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { PieChart, Settings } from "lucide-react";
import { headers } from "next/headers";

const TopNavigation = async () => {
  const session = await auth0.getSession();

  if (!session) return <div></div>;

  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isBudgetPage = pathName?.includes("/budget");
  const isCategoriesPage = pathName?.includes("/categories");

  return (
    <div className="flex items-center space-x-4">
      {/* Main Navigation Links */}
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
          variant={isCategoriesPage ? "default" : "ghost"}
          size="sm"
        >
          <a href="/categories" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </a>
        </Button>
      </div>
    </div>
  );
};

export default TopNavigation;
