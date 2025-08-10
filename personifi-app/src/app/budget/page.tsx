import { BudgetVarianceDashboard } from "@/components/budget/budgetVarianceDashboard";
import { PageHeader } from "@/components/ui/pageHeader";

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget Overview"
        description="Track your spending against budgeted amounts"
      />
      <BudgetVarianceDashboard />
    </div>
  );
}