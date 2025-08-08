import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
//import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getRecentTransactions } from "@/components/dashboard/getRecentTransactions";
import { Transaction } from "@/types/transaction";

// const transactions = [
//   {
//     id: "t1",
//     description: "Tesco",
//     amount: -120.5,
//     date: "Today",
//     category: "Food",
//     icon: UtensilsIcon,
//   },
//   {
//     id: "t2",
//     description: "Salary Deposit",
//     amount: 2150.0,
//     date: "Yesterday",
//     category: "Income",
//     icon: ArrowUpIcon,
//   },
//   {
//     id: "t3",
//     description: "British Gas",
//     amount: -85.0,
//     date: "Yesterday",
//     category: "Utilities",
//     icon: HomeIcon,
//   },
//   {
//     id: "t4",
//     description: "Amazon",
//     amount: -65.99,
//     date: "12/07/2023",
//     category: "Shopping",
//     icon: ShoppingBagIcon,
//   },
//   {
//     id: "t5",
//     description: "BP Petrol",
//     amount: -45.0,
//     date: "11/07/2023",
//     category: "Transport",
//     icon: CarIcon,
//   },
//   {
//     id: "t6",
//     description: "Nando's",
//     amount: -78.5,
//     date: "10/07/2023",
//     category: "Food",
//     icon: UtensilsIcon,
//   },
// ];

export const RecentTransactions = async () => {
  // const data = [];
  const data = await getRecentTransactions();
  console.log("CBData: ", data);

  // const filteredTransactions = transactions.filter(
  //   (transaction) =>
  //     transaction.description
  //       .toLowerCase()
  //       .includes(searchQuery.toLowerCase()) ||
  //     transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your recent financial activity</CardDescription>
        </div>
        {/* TODO: DO this: https://nextjs.org/learn/dashboard-app/adding-search-and-pagination */}
        {/* <div className="relative w-full max-w-[12rem]">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div> */}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.length > 0 ? (
            data.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full",
                      transaction.amount >= 0
                        ? "bg-finance-green-light"
                        : "bg-finance-red-light"
                    )}
                  >
                    {/* <transaction.icon
                      className={cn(
                        "h-5 w-5",
                        transaction.amount >= 0
                          ? "text-finance-green"
                          : "text-finance-red"
                      )}
                    /> */}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transactionDate} •{" "}
                      {transaction.category.name}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "text-sm font-medium",
                    transaction.amount >= 0 ? "text-finance-green" : ""
                  )}
                >
                  {transaction.amount >= 0 ? "+" : ""}£
                  {Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No transactions found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
