import { TransactionForm } from "@/components/transactions/new/transactionForm";
import { PageHeader } from "@/components/ui/pageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Transaction | Personifi",
  description: "Add a new transaction to your personal finance tracker",
};

export default function NewTransactionPage() {
  return (
    <div className="@container">
      <PageHeader
        title="New Transaction"
        subTitle="Record a new income or expense transaction"
      />
      <TransactionForm />
    </div>
  );
}
