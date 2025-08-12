"use server";

import { getAccessToken } from "@/lib/AuthProvider";

interface TransactionRequest {
  categoryId: number;
  amount: number;
  transactionType: string;
  description: string;
  notes?: string;
  transactionDate: Date;
}

interface TransactionResponse {
  id: number;
  amount: number;
  description: string;
  notes?: string;
  transactionDate: string;
  category: {
    id: number;
    name: string;
    type: string;
    icon: string;
    color: string;
  };
  createdAt: string;
}

export const createTransaction = async (transaction: TransactionRequest): Promise<TransactionResponse> => {
  const createTransactionDto = {
    categoryId: transaction.categoryId,
    amount: transaction.amount,
    transactionType: transaction.transactionType,
    description: transaction.description,
    notes: transaction.notes,
    transactionDate: transaction.transactionDate,
  };

  try {
    const token = await getAccessToken();

    const res = await fetch(
      `${process.env.PERSONIFI_BACKEND_URL}/transaction`,
      {
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(createTransactionDto),
      }
    );

    if (res?.ok) {
      const transactionResponse = await res.json();
      return transactionResponse;
    } else {
      console.error(
        "Failed to create a new Transaction: ",
        res,
        "Body: ",
        await res.text()
      );
      throw new Error(
        `HTTP Response Code: ${res?.status} \nHTTP Response Status: ${res.statusText}`
      );
    }
  } catch (e) {
    throw e;
  }
};