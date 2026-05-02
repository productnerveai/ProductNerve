import { initSentry } from "./sentry";
import { initPostHog } from "./posthog";

let fetched = false;

export async function initMonitoring() {
  if (fetched) return;
  fetched = true;

  try {
    // TODO: Replace with actual monitoring configuration
    console.log("Monitoring initialization placeholder");
    
    // await initSentry(data.sentry_dsn);
    // initPostHog(data.posthog_api_key, data.posthog_host);
  } catch (e) {
    console.warn("Failed to initialize monitoring:", e);
  }
}
