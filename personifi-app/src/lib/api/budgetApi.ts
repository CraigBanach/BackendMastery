"use server";

import { getAccessToken } from "../AuthProvider";
import { BudgetVarianceDto, BudgetDto, SetBudgetDto } from "@/types/budget";

const API_BASE_URL =
  process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

interface ApiError {
  error: {
    message: string;
    type: string;
  };
}

async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const { token } = await getAccessToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const responseText = await response.text();

      if (responseText) {
        try {
          const errorData = JSON.parse(responseText) as ApiError;
          errorMessage = errorData.error?.message || responseText;
        } catch {
          errorMessage = responseText;
        }
      }
    } catch {
      // If we can't parse the error, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function getBudgetVariance(
  year: number,
  month: number
): Promise<BudgetVarianceDto[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/Budget/variance/${year}/${month}`
  );
  return response.json();
}

export async function getBudgetsForMonth(
  year: number,
  month: number
): Promise<BudgetDto[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/Budget/${year}/${month}`
  );
  return response.json();
}

export async function setBudgetsForMonth(
  year: number,
  month: number,
  budgets: SetBudgetDto[]
): Promise<BudgetDto[]> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/Budget/${year}/${month}`,
    {
      method: "PUT",
      body: JSON.stringify(budgets),
    }
  );
  return response.json();
}

export async function getBudget(
  categoryId: number,
  year: number,
  month: number
): Promise<BudgetDto | null> {
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/Budget/category/${categoryId}/${year}/${month}`
    );
    return response.json();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("not found") || errorMessage.includes("404")) {
      return null;
    }
    throw error;
  }
}
