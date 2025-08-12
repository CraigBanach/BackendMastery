"use server";

import { getAccessToken } from "../AuthProvider";
import { CategoryDto, CategoryType } from "@/types/budget";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

interface CreateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

interface UpdateCategoryRequest {
  name: string;
  type: CategoryType;
  icon?: string;
  color?: string;
}

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
      const errorData = (await response.json()) as ApiError;
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function getCategories(): Promise<CategoryDto[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Category`);
  return response.json();
}

export async function getCategoryById(id: number): Promise<CategoryDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Category/${id}`);
  return response.json();
}

export async function createCategory(category: CreateCategoryRequest): Promise<CategoryDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Category`, {
    method: "POST",
    body: JSON.stringify(category),
  });
  return response.json();
}

export async function updateCategory(id: number, category: UpdateCategoryRequest): Promise<CategoryDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Category/${id}`, {
    method: "PUT",
    body: JSON.stringify(category),
  });
  return response.json();
}

export async function deleteCategory(id: number): Promise<void> {
  await fetchWithAuth(`${API_BASE_URL}/Category/${id}`, {
    method: "DELETE",
  });
}