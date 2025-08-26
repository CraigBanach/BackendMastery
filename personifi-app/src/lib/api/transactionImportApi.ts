"use server";

import { getAccessToken } from "../AuthProvider";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || 'https://localhost:7106/api';

interface ApiError {
  error: {
    message: string;
    type: string;
  };
}


export interface TransactionImportDto {
  id: number;
  fileName: string;
  totalTransactions: number;
  processedTransactions: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  duplicateTransactions: number;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface PendingTransactionDto {
  id: number;
  amount: number;
  description: string;
  counterParty: string;
  reference: string;
  type: string;
  balance?: number;
  externalSpendingCategory?: string;
  notes?: string;
  transactionDate: string;
  status: string;
  categoryId?: number;
  categoryName?: string;
  createdAt: string;
}

interface PaginationResult<T> {
  items: T[];
  totalCount: number;
}

async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const { token } = await getAccessToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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

export async function importTransactionsFromCSV(file: File): Promise<TransactionImportDto> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_BASE_URL}/TransactionImport`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}

export async function getPendingTransactions(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginationResult<PendingTransactionDto>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  const url = `${API_BASE_URL}/TransactionImport/pending?${params.toString()}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

export async function getPendingTransactionById(id: number): Promise<PendingTransactionDto> {
  const url = `${API_BASE_URL}/TransactionImport/pending/${id}`;
  const response = await fetchWithAuth(url);
  return response.json();
}

export async function approvePendingTransaction(
  id: number,
  categoryId: number,
  notes?: string,
  description?: string
): Promise<void> {
  const url = `${API_BASE_URL}/TransactionImport/pending/${id}/approve`;
  await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ categoryId, notes, description }),
  });
}

export async function rejectPendingTransaction(id: number): Promise<void> {
  const url = `${API_BASE_URL}/TransactionImport/pending/${id}/reject`;
  await fetchWithAuth(url, {
    method: 'POST',
  });
}

export interface TransactionSplit {
  categoryId: number;
  amount: number;
  description?: string;
}

export async function approvePendingTransactionSplit(
  id: number,
  splits: TransactionSplit[]
): Promise<void> {
  const url = `${API_BASE_URL}/TransactionImport/pending/${id}/approve-split`;
  await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ splits }),
  });
}

export async function bulkApproveTransactions(
  transactionIds: number[],
  defaultCategoryId?: number
): Promise<{ approvedCount: number }> {
  const url = `${API_BASE_URL}/TransactionImport/pending/bulk-approve`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ 
      transactionIds, 
      defaultCategoryId 
    }),
  });
  return response.json();
}

export async function bulkRejectTransactions(
  transactionIds: number[]
): Promise<{ rejectedCount: number }> {
  const url = `${API_BASE_URL}/TransactionImport/pending/bulk-reject`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ transactionIds }),
  });
  return response.json();
}

export async function getImportHistory(): Promise<TransactionImportDto[]> {
  const url = `${API_BASE_URL}/TransactionImport/history`;
  const response = await fetchWithAuth(url);
  return response.json();
}