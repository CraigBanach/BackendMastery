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
  signupSource?: string;
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

interface GenerateTokenResponse {
  token: string;
  expiresAt: string;
}

interface InvitationDetailsResponse {
  accountName: string;
  inviterEmail: string;
  personalMessage?: string;
  expiresAt: string;
  isAlreadyMember: boolean;
}

export interface GetInvitationResult {
  success: boolean;
  data?: InvitationDetailsResponse;
  error?: string;
}

interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  errorCode?: string;
  newAccountName?: string;
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
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json() as ApiError;
        errorMessage = errorData.error?.message || errorMessage;
      } else {
        // Handle plain text error responses
        const textError = await response.text();
        errorMessage = textError || response.statusText || errorMessage;
      }
    } catch {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function createAccount(
  name: string,
  signupSource?: string
): Promise<CreateAccountResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/create`, {
    method: 'POST',
    body: JSON.stringify({ name, signupSource } as CreateAccountRequest),
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

export async function generateInviteToken(): Promise<GenerateTokenResponse> {
  const response = await fetchWithAuth(`${API_BASE_URL}/Account/generate-invite-token`, {
    method: 'POST',
  });
  return response.json();
}

export async function getInvitationDetails(token: string): Promise<GetInvitationResult> {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/Account/invitation/${token}`);
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Invalid or expired invitation";
    return { success: false, error: errorMessage };
  }
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
