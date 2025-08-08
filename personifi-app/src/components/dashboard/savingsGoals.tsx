import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const goals = [
  {
    id: "g1",
    name: "Emergency Fund",
    current: 8500,
    target: 10000,
    color: "bg-finance-navy",
  },
  {
    id: "g2",
    name: "Holiday",
    current: 2200,
    target: 3000,
    color: "bg-finance-green",
  },
  {
    id: "g3",
    name: "New Laptop",
    current: 800,
    target: 1500,
    color: "bg-finance-gold",
  },
];

export const SavingsGoals = () => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle>Savings Goals</CardTitle>
      <CardDescription>
        Track your progress towards financial goals
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {goals.map((goal) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("h-3 w-3 ronuded-full", goal.color)} />
                <span className="text-sm font-medium">{goal.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                £{goal.current} / £{goal.target}
              </div>
            </div>
            <Progress
              value={(goal.current / goal.target) * 100}
              className="h-2 bg-gray-200"
              indicatorClassName={goal.color}
            />
            <p className="text-xs text-right text-muted-foreground">
              {Math.round((goal.current / goal.target) * 100)}% complete
            </p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);
