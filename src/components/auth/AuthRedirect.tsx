import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

/**
 * Wraps pages that should redirect to /app if user is authenticated.
 */
export default function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return <Navigate to="/app" replace />;

  return <>{children}</>;
}
