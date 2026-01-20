"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import posthog from "posthog-js";

const hasWindow = typeof window !== "undefined";

const getOnceKey = (eventName: string) => `posthog_once_${eventName}`;

export const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (hasWindow && (window as any).beacon) {
    (window as any).beacon("sendEvent", eventName);
  }

  if (!hasWindow) return;

  try {
    posthog.capture(eventName, properties);
  } catch {
    // Ignore capture failures.
  }
};

export const trackEventOnce = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (!hasWindow) return;

  try {
    const key = getOnceKey(eventName);
    if (window.localStorage.getItem(key)) {
      return;
    }

    const capture = () => {
      trackEvent(eventName, properties);
      window.localStorage.setItem(key, "true");
    };

    if (posthog.__loaded) {
      capture();
      return;
    }

    (posthog as any).onReady(() => {
      if (window.localStorage.getItem(key)) {
        return;
      }
      capture();
    });
  } catch {
    trackEvent(eventName, properties);
  }
};

export const getDistinctId = () => {
  if (!hasWindow || !posthog.__loaded) return null;
  return posthog.get_distinct_id();
};

export const identifyUserOnce = (
  distinctId: string,
  properties?: Record<string, unknown>
) => {
  if (!hasWindow || !posthog.__loaded) return;

  try {
    const key = getOnceKey("identify");
    if (window.localStorage.getItem(key)) {
      return;
    }

    posthog.identify(distinctId, properties);
    window.localStorage.setItem(key, "true");
  } catch {
    posthog.identify(distinctId, properties);
  }
};

