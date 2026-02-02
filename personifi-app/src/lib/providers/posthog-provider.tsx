"use client";

import { useEffect, useMemo, useState } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

export function PostHogProvider({
  children,
  apiKey,
  options,
  configEndpoint = "/api/posthog-config",
}: {
  children: React.ReactNode;
  apiKey?: string;
  options?: Parameters<typeof posthog.init>[1];
  configEndpoint?: string;
}) {
  const [runtimeKey, setRuntimeKey] = useState<string | null>(null);

  const resolvedKey = apiKey ?? runtimeKey ?? undefined;

  const initOptions = useMemo(() => options, [options]);

  useEffect(() => {
    if (resolvedKey || posthog.__loaded) return;

    let cancelled = false;

    const loadKey = async () => {
      try {
        const response = await fetch(configEndpoint, { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as { apiKey?: string | null };
        if (!cancelled && payload?.apiKey) {
          setRuntimeKey(payload.apiKey);
        }
      } catch {
        // Ignore config fetch failures.
      }
    };

    loadKey();

    return () => {
      cancelled = true;
    };
  }, [configEndpoint, resolvedKey]);

  useEffect(() => {
    if (resolvedKey && !posthog.__loaded) {
      posthog.init(resolvedKey, initOptions);
    }
  }, [initOptions, resolvedKey]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
