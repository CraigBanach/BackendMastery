"use client";

import { trackEvent } from "@/lib/analytics";
import { TrackedLinkButton } from "@/components/ui/tracked-link-button";

interface CalculatorCtaButtonProps {
  className?: string;
}

export function CalculatorCtaButton({ className }: CalculatorCtaButtonProps) {
  return (
    <TrackedLinkButton
      href="/auth/login?screen_hint=signup&signup_source=calculator"
      eventName="signup_started"
      size="lg"
      className={className}
      onClick={() => trackEvent("app_cta_click", { source: "calculator" })}
    >
      Try it with your partner
    </TrackedLinkButton>
  );
}
