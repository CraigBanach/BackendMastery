"use client";

import { useEffect, useRef } from "react";
import { identifyUserOnce, trackEventOnce } from "@/lib/analytics";

interface AppHeaderAnalyticsProps {
  userId: string | null;
  email: string | null;
}

export function AppHeaderAnalytics({ userId, email }: AppHeaderAnalyticsProps) {
  const hasTrackedSignup = useRef(false);
  const hasIdentifiedUser = useRef(false);

  useEffect(() => {
    if (hasTrackedSignup.current) return;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const fromAuth0 = referrer.includes("auth0.com");
    const fromLogin = referrer.includes("/auth/login");
    const signupStarted = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_started")
      : null;

    if ((fromAuth0 || fromLogin) && signupStarted) {
      trackEventOnce("signup_form_submitted");
      window.localStorage.removeItem("posthog_signup_started");
      hasTrackedSignup.current = true;
    }
  }, []);

  useEffect(() => {
    if (hasIdentifiedUser.current) return;
    if (!userId) return;

    const properties: Record<string, unknown> = {
      signup_date: new Date().toISOString(),
      referral_source: "auth0",
    };

    if (email) {
      properties.email = email;
    }

    identifyUserOnce(userId, properties);
    hasIdentifiedUser.current = true;
  }, [email, userId]);

  return null;
}
