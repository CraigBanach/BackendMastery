import { CategoryType } from './budget';

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
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
