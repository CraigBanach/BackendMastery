"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({
  children,
  apiKey,
  options,
}: {
  children: React.ReactNode;
  apiKey?: string;
  options?: Parameters<typeof posthog.init>[1];
}) {
  useEffect(() => {
    if (apiKey && !posthog.__loaded) {
      posthog.init(apiKey, options);
    }
  }, [apiKey, options]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
