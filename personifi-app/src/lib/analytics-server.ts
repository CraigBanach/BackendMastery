"use server";

import { PostHog } from "posthog-node";
import { auth0 } from "@/lib/auth0";

const posthogKey = process.env.POSTHOG_KEY;
const posthogHost = process.env.POSTHOG_HOST ?? "https://eu.posthog.com";

interface CaptureServerEventInput {
  distinctId: string | null;
  event: string;
  properties?: Record<string, unknown>;
}

export async function captureServerEvent({
  distinctId,
  event,
  properties,
}: CaptureServerEventInput) {
  if (!posthogKey || !distinctId) return;

  const client = new PostHog(posthogKey, { host: posthogHost });
  await client.captureImmediate({
    distinctId,
    event,
    properties,
  });
  await client._shutdown();
}

export async function captureSignupCompleted() {
  const session = await auth0.getSession();
  const user = session?.user;

  if (!user?.sub) return;

  await captureServerEvent({
    distinctId: user.sub,
    event: "signup_completed",
    properties: {
      email: user.email,
      signup_date: new Date().toISOString(),
      referral_source: "auth0",
    },
  });
}
