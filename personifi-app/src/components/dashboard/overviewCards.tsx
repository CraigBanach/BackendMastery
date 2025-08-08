import {
  PoundSterlingIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
//import { auth0 } from "@/lib/auth0";
import { toDisplayFormat } from "@/lib/currency";

export const OverviewCards = async () => {
  // TODO: Show loading skeleton, rather than 0 for initial values
  const balances = {
    total: {
      balance: 0,
      change: 0,
    },
    income: {
      balance: 0,
      change: 0,
    },
    expense: {
      balance: 0,
      change: 0,
    },
    saving: {
      balance: 0,
      change: 0,
    },
  };

  try {
    // const token = await auth0.getAccessToken();
    // const data = await fetch(
    //   `${process.env.PERSONIFI_BACKEND_URL}/dashboard/balance`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token.token}`,
    //     },
    //   }
    // );
    // const balancesResponse = await data.json();
    // balances = balancesResponse;
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          <PoundSterlingIcon className="h-4 w-4 text-finance-navy" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{`£ ${toDisplayFormat(
            balances.total.balance
          )}`}</div>
          <p className="text-xs text-muted-foreground">
            {`+£ ${toDisplayFormat(balances.total.change)} from last month`}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-finance-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{`£ ${toDisplayFormat(
            balances.income.balance
          )}`}</div>
          <p className="text-xs text-muted-foreground">{`+${balances.income.change}% from last month`}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Monthly Expenses
          </CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-finance-red" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{`£ ${toDisplayFormat(
            balances.expense.balance
          )}`}</div>
          <p className="text-xs text-muted-foreground">{`+${balances.expense.change}% from last month`}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-finance-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{`${balances.saving.balance}%`}</div>
          <p className="text-xs text-muted-foreground">{`+${balances.saving.change}% from last month`}</p>
        </CardContent>
      </Card>
    </div>
  );
};
