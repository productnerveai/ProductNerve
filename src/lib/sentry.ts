import * as Sentry from "@sentry/react";

let initialized = false;

export async function initSentry(dsn?: string) {
  if (initialized || !dsn) return;
  initialized = true;

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    sendDefaultPii: true,
    tracesSampleRate: 0.3,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    beforeSend(event) {
      if (import.meta.env.DEV) return null;
      return event;
    },
  });
}

export { Sentry };
