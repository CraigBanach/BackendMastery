"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const trackEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && (window as any).beacon) {
    (window as any).beacon('sendEvent', eventName);
  }
};
