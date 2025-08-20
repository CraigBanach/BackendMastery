"use server";

import { getAccessToken } from "../AuthProvider";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

interface ApiError {
  error: {
    message: string;
    type: string;
  };
}

interface InvitePromptStatusResponse {
  dismissed: boolean;
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

export async function dismissInvitePrompt(): Promise<void> {
  await fetchWithAuth(`${API_BASE_URL}/UserPreferences/dismiss-invite-prompt`, {
    method: 'POST',
  });
}

export async function getInvitePromptStatus(): Promise<InvitePromptStatusResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/UserPreferences/invite-prompt-status`);
  return response.json();
}