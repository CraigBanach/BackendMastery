"use server";

import { getAccessToken } from "../AuthProvider";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

interface ApiError {
  error: {
    message: string;
    type: string;
  };
}

interface CreateAccountRequest {
  name: string;
}

interface CreateAccountResponse {
  accountId: number;
  name: string;
  createdAt: string;
}

interface SendInvitationRequest {
  email: string;
  personalMessage?: string;
}

interface SendInvitationResponse {
  invitationId: number;
  token: string;
  invitationUrl: string;
  expiresAt: string;
}

interface InvitationDetailsResponse {
  accountName: string;
  inviterEmail: string;
  personalMessage?: string;
  expiresAt: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  message: string;
}

interface AccountMemberResponse {
  userId: number;
  email: string;
  joinedAt: string;
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

export async function createAccount(name: string): Promise<CreateAccountResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/create`, {
    method: 'POST',
    body: JSON.stringify({ name } as CreateAccountRequest),
  });
  return response.json();
}

export async function sendInvitation(email: string, personalMessage?: string): Promise<SendInvitationResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/invite`, {
    method: 'POST',
    body: JSON.stringify({ email, personalMessage } as SendInvitationRequest),
  });
  return response.json();
}

export async function getInvitationDetails(token: string): Promise<InvitationDetailsResponse> {
  // This endpoint doesn't require authentication
  const response = await fetch(`${API_BASE_URL}/Account/invitation/${token}`);
  
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
  
  return response.json();
}

export async function acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/invitation/${token}/accept`, {
    method: 'POST',
  });
  return response.json();
}

export async function getAccountMembers(): Promise<AccountMemberResponse[]> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/members`);
  return response.json();
}