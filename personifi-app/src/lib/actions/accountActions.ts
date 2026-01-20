"use server";

import { redirect } from "next/navigation";
import { getAccessToken } from '@/lib/AuthProvider';
import { acceptInvitation, getInvitationDetails } from "@/lib/api/accountApi";
import { auth0 } from "@/lib/auth0";
import { captureServerEvent } from "@/lib/analytics-server";

const API_BASE_URL = process.env.PERSONIFI_BACKEND_URL || "https://localhost:7106/api";

export async function createAccountAction(accountName: string) {
  try {
    // Get the access token for the authenticated user
    const { token } = await getAccessToken();
    
    if (!token) {
      return { error: 'No access token available' };
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
      return { error: errorMessage };
    }

    // Account created successfully - redirect will happen outside try-catch
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create account";
    return { error: errorMessage };
  }
  
  const session = await auth0.getSession();
  if (session?.user?.sub) {
    await captureServerEvent({
      distinctId: session.user.sub,
      event: "onboarding_completed",
      properties: {
        email: session.user.email,
        signup_date: new Date().toISOString(),
        referral_source: "auth0",
      },
    });
  }

  // Only redirect if we get here (success case)
  redirect("/budget");
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
    
    // Invitation accepted successfully - redirect will happen outside try-catch
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to join account";
    return { error: errorMessage };
  }
  
  const session = await auth0.getSession();
  if (session?.user?.sub) {
    await captureServerEvent({
      distinctId: session.user.sub,
      event: "onboarding_completed",
      properties: {
        email: session.user.email,
        signup_date: new Date().toISOString(),
        referral_source: "auth0",
      },
    });
  }

  // Only redirect if we get here (success case)
  redirect("/budget");
}
