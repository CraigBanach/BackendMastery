import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

const bills = [
  {
    id: "b1",
    name: "Rent",
    amount: 1200,
    dueDate: "31/07/2023",
    daysLeft: 5,
  },
  {
    id: "b2",
    name: "Virgin Media",
    amount: 65,
    dueDate: "03/08/2023",
    daysLeft: 8,
  },
  {
    id: "b3",
    name: "EE Mobile",
    amount: 45,
    dueDate: "05/08/2023",
    daysLeft: 10,
  },
];

export const UpcomingBills = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle>Upcoming Bills</CardTitle>
      <CardDescription>Bills due in the next 14 days</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {bills.map((bill) => (
          <div key={bill.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-finance-navy-light">
                <CalendarIcon className="h-5 w-5 text-finance-navy" />
              </div>
              <div>
                <p className="text-sm font-medium">{bill.name}</p>
                <p className="text-xs text-muted-foreground">
                  Due {bill.dueDate}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-medium">£{bill.amount}</p>
              <p
                className={cn(
                  "text-xs",
                  bill.daysLeft <= 3
                    ? "text-finance-red"
                    : "text-muted-foreground"
                )}
              >
                {bill.daysLeft} days left
              </p>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
