import { supabase } from "@/integrations/supabase/client";
import { initSentry } from "./sentry";
import { initPostHog } from "./posthog";

let fetched = false;

export async function initMonitoring() {
  if (fetched) return;
  fetched = true;

  try {
    const { data, error } = await supabase.functions.invoke("monitoring-config");
    if (error || !data) return;

    await initSentry(data.sentry_dsn);
    initPostHog(data.posthog_api_key, data.posthog_host);
  } catch (e) {
    console.warn("Failed to initialize monitoring:", e);
  }
}
