import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/tracking";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Tracks page views on every route change with full UTM attribution context.
 * Also sends SPA page_view events to Google Analytics (gtag.js).
 */
export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    trackPageView(user?.id ?? null);

    // Send SPA page view to Google Analytics
    if (window.gtag) {
      window.gtag("config", "G-8BQL0434HS", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location.pathname, location.search, user?.id]);
}
