export enum CategoryType {
  Expense = 'Expense',
  Income = 'Income'
}

export interface CategoryDto {
  id: number;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface BudgetVarianceDto {
  category: CategoryDto;
  budgeted: number;
  actual: number;
  monthlyPaceStatus: 'on-track' | 'ahead' | 'behind';
  expectedSpendToDate: number;
}

export interface BudgetDto {
  id: number;
  category: CategoryDto;
  amount: number;
  year: number;
  month: number;
}

export interface SetBudgetDto {
  categoryId: number;
  amount: number;
}