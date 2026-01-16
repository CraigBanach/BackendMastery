"use client";

import SessionHeader from "@/components/layout/sessionHeader";
import TopNavigation from "@/components/layout/topNavigation";
import { useEffect, useState } from "react";
import { getDistinctId, identifyUserOnce, trackEventOnce } from "@/lib/analytics";

export default function AppHeader() {
  const [hasTrackedSignup, setHasTrackedSignup] = useState(false);
  const [hasIdentifiedUser, setHasIdentifiedUser] = useState(false);

  useEffect(() => {
    if (hasTrackedSignup) return;

    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const fromAuth0 = referrer.includes("auth0.com");
    const fromLogin = referrer.includes("/auth/login");

    if (fromAuth0 || fromLogin) {
      trackEventOnce("signup_completed");
      trackEventOnce("signup_form_submitted");
      setHasTrackedSignup(true);
    }
  }, [hasTrackedSignup]);

  useEffect(() => {
    if (hasIdentifiedUser) return;

    const pendingEmail = typeof window !== "undefined"
      ? window.localStorage.getItem("posthog_signup_email")
      : null;
    const distinctId = getDistinctId();
    if (pendingEmail && distinctId) {
      identifyUserOnce(distinctId, {
        email: pendingEmail,
        signup_date: new Date().toISOString(),
        referral_source: "auth0",
      });
      window.localStorage.removeItem("posthog_signup_email");
      setHasIdentifiedUser(true);
      return;
    }

    if (!pendingEmail) {
      setHasIdentifiedUser(true);
    }
  }, [hasIdentifiedUser]);

  return (
    <header className="sticky top-0 bg-white border-b z-50 flex h-16 items-center gap-4 px-4 md:px-6">
      <nav className="flex flex-1 items-center justify-between gap-4">
        <TopNavigation />
        <SessionHeader />
      </nav>
    </header>
  );
}

