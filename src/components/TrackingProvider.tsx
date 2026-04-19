import { usePageTracking } from "@/hooks/usePageTracking";

/**
 * Wrapper component that enables page tracking inside the Router context.
 */
export default function TrackingProvider({ children }: { children: React.ReactNode }) {
  usePageTracking();
  return <>{children}</>;
}
