"use server";

import { getAccessToken } from "../AuthProvider";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || 'https://localhost:7106/api';

interface ApiError {
  error: {
    message: string;
    type: string;
  };
}

interface CategoryDto {
  id: number;
  name: string;
  type: 'expense' | 'income';
}

export interface TransactionDto {
  id: number;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  category: CategoryDto;
  createdAt: string;
}

interface PaginationRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

interface PagedResponse<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { token } = await getAccessToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json() as ApiError;
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function getTransactions(
  pagination?: PaginationRequest,
  startDate?: string,
  endDate?: string,
  categoryId?: number
): Promise<PagedResponse<TransactionDto>> {
  const params = new URLSearchParams();
  
  if (pagination?.page) params.append('page', pagination.page.toString());
  if (pagination?.pageSize) params.append('pageSize', pagination.pageSize.toString());
  if (pagination?.sortBy) params.append('sortBy', pagination.sortBy);
  if (pagination?.sortDescending) params.append('sortDescending', pagination.sortDescending.toString());
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (categoryId) params.append('categoryId', categoryId.toString());

  const url = `${API_BASE_URL}/Transaction${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetchWithAuth(url);
  return response.json();
}