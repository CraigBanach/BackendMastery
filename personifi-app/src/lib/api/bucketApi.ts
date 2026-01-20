"use server";

import { getAccessToken } from "../AuthProvider";
import { BucketDto, CreateBucketDto, UpdateBucketDto } from "@/types/bucket";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

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
    cache: "no-store",
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

export async function getBuckets(): Promise<BucketDto[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Bucket`);
  return response.json();
}

export async function getBucketById(id: number): Promise<BucketDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Bucket/${id}`);
  return response.json();
}

export async function createBucket(bucket: CreateBucketDto): Promise<BucketDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Bucket`, {
    method: "POST",
    body: JSON.stringify(bucket),
  });
  return response.json();
}

export async function updateBucket(id: number, bucket: UpdateBucketDto): Promise<BucketDto> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Bucket/${id}`, {
    method: "PUT",
    body: JSON.stringify(bucket),
  });
  return response.json();
}

export async function deleteBucket(id: number): Promise<void> {
  await fetchWithAuth(`${API_BASE_URL}/Bucket/${id}`, {
    method: "DELETE",
  });
}
