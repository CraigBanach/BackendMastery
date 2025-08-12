interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  notes?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  variant: 'income' | 'expense';
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
};

export function TransactionTable({ transactions, variant }: TransactionTableProps) {
  const isIncome = variant === 'income';
  
  const colors = {
    bg: isIncome ? 'blue' : 'red',
    bgLight: isIncome ? 'blue-25' : 'red-25',
    bgMedium: isIncome ? 'blue-50' : 'red-50',
    border: isIncome ? 'blue-200' : 'red-200',
    borderLight: isIncome ? 'blue-100' : 'red-100',
    text: isIncome ? 'blue-700' : 'red-700',
    amount: isIncome ? 'green-600' : 'red-600',
  };

  return (
    <div className={`bg-${colors.bgLight} border-l-4 border-${colors.border}`}>
      {transactions.length > 0 ? (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full">
          <thead className={`bg-${colors.bgMedium}`}>
            <tr>
              <th className={`text-left py-2 px-4 text-xs font-medium text-${colors.text} uppercase tracking-wide`}>
                Description
              </th>
              <th className={`text-right py-2 px-4 text-xs font-medium text-${colors.text} uppercase tracking-wide`}>
                Date
              </th>
              <th className={`text-right py-2 px-4 text-xs font-medium text-${colors.text} uppercase tracking-wide`}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 5).map((transaction) => (
              <tr key={transaction.id} className={`border-b border-${colors.borderLight} hover:bg-${colors.bgMedium}`}>
                <td className="py-2 px-4 text-sm">
                  <span className="font-medium text-gray-900">{transaction.description}</span>
                  {transaction.notes && (
                    <div className="text-xs text-gray-500 mt-1">{transaction.notes}</div>
                  )}
                </td>
                <td className="py-2 px-4 text-sm text-right text-gray-600">
                  {new Date(transaction.date).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short',
                    year: '2-digit'
                  })}
                </td>
                <td className="py-2 px-4 text-sm text-right">
                  <span className={`font-semibold text-${colors.amount}`}>
                    {formatCurrency(transaction.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-4 px-4 text-center">
          No transactions this month
        </div>
      )}
    </div>
  );
}