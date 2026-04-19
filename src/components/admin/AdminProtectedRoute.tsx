import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export default function AdminProtectedRoute() {
  const { user, loading } = useAuth();

  const { data: isAdmin, isLoading: adminLoading } = useQuery({
    queryKey: ["is-platform-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase.rpc("is_platform_admin", { _user_id: user.id });
      return !!data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && !adminLoading && user && isAdmin === false) {
      supabase.from("admin_logs").insert({
        admin_id: user.id,
        action: "unauthorized_admin_access_attempt",
        entity_type: "admin_route",
        entity_id: window.location.pathname,
        details: { user_email: user.email, timestamp: new Date().toISOString() },
      }).then(() => {});
    }
  }, [loading, adminLoading, user, isAdmin]);

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/forbidden" replace />;

  return <Outlet />;
}
