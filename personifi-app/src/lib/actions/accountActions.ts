"use server";

import { redirect } from "next/navigation";
import { getAccessToken } from '@/lib/AuthProvider';
import { acceptInvitation, getInvitationDetails } from "@/lib/api/accountApi";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

export async function createAccountAction(accountName: string) {
  try {
    // Get the access token for the authenticated user
    const { token } = await getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    // Call the backend API directly
    const response = await fetch(`${API_BASE_URL}/Account/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: accountName.trim() }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // TODO: Fix NEXT_REDIRECT error flash in account creation UI
    // The redirect() function in server actions causes a brief error flash
    // Consider using client-side navigation (router.push) or loading states
    // Redirect to dashboard after successful account creation
    redirect("/dashboard");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create account";
    return { error: errorMessage };
  }
}

export async function joinAccountAction(invitationToken: string) {
  try {
    // Extract token from URL if full URL was pasted
    const token = invitationToken.includes('/invite/') 
      ? invitationToken.split('/invite/')[1]
      : invitationToken.trim();

    // Validate token exists
    await getInvitationDetails(token);
    
    // Accept the invitation
    await acceptInvitation(token);
    
    // Redirect to dashboard after successful join
    redirect("/dashboard");
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to join account";
    return { error: errorMessage };
  }
}