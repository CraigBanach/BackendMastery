export interface Category {
  id: number;
  name: string;
  type: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  category: Category;
  createdAt: string;
}
