"use server";

import { redirect } from "next/navigation";
import { auth0 } from "./auth0";

export async function getAccessToken(): Promise<{ token: string }> {
  try {
    return await auth0.getAccessToken();
  } catch (error: unknown) {
    // Check for Auth0 token expiration error codes
    const authError = error as { code?: string; message?: string };
    if (
      authError.code === 'missing_refresh_token' ||
      authError.code === 'expired_refresh_token' ||
      authError.code === 'AccessTokenError' ||
      (authError.message && authError.message.includes('access token has expired'))
    ) {
      console.log('Token expired, redirecting to logout');
      redirect('/api/auth/logout');
    }
    
    // Re-throw other errors
    throw error;
  }
}