import posthog from "posthog-js";

let initialized = false;

export function initPostHog(apiKey?: string, host?: string) {
  if (initialized || !apiKey) return;
  initialized = true;

  posthog.init(apiKey, {
    api_host: host || "https://app.posthog.com",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: "localStorage+cookie",
  });
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.identify(userId, properties);
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (!initialized) return;
  posthog.capture(event, properties);
}

export function resetPostHog() {
  if (!initialized) return;
  posthog.reset();
}

export { posthog };
