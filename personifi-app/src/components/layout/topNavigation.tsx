import { Button } from "@/components/ui/button";
import { auth0 } from "@/lib/auth0";
import { ArrowLeftIcon } from "lucide-react";
import { headers } from "next/headers";

const TopNavigation = async () => {
  const session = await auth0.getSession();

  if (!session) return <div></div>;

  const headerList = await headers();
  const pathName = headerList.get("x-current-path");
  const isTransactionsPage = pathName?.includes("/transactions/new");

  return (
    <div>
      <Button
        asChild
        size="lg"
        className="bg-finance-green hover:bg-finance-green-dark"
      >
        {isTransactionsPage ? (
          <a href="/dashboard">
            <ArrowLeftIcon />
            Dashboard
          </a>
        ) : (
          <a href="/transactions/new">Add Transaction</a>
        )}
      </Button>
    </div>
  );
};

export default TopNavigation;
