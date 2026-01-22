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

    const signupStartedAt = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_started_at")
      : null;
    const signupStartedLegacy = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_started")
      : null;
    const signupSource = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_source")
      : null;
    const signupStartedAtMs = signupStartedAt ? Number(signupStartedAt) : Number.NaN;
    const isFreshSignup = signupStartedLegacy || (!Number.isNaN(signupStartedAtMs) && Date.now() - signupStartedAtMs <= 30 * 60 * 1000);

    if (isFreshSignup) {
      trackEventOnce(
        "signup_form_submitted",
        signupSource ? { signup_source: signupSource } : undefined
      );
      window.localStorage.removeItem("posthog_signup_started");
      window.localStorage.removeItem("posthog_signup_started_at");
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

    const signupSource = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_source")
      : null;
    if (signupSource) {
      properties.signup_source = signupSource;
    }

    identifyUserOnce(userId, properties);
    hasIdentifiedUser.current = true;
  }, [email, userId]);

  return null;
}
