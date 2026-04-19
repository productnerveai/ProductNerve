import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AccessStatus {
  hasAccess: boolean;
  subscriptionPlan: string;
  subscriptionStatus: string;
  isProjectUnlocked: boolean;
  loading: boolean;
}

export function useProjectAccess(projectId: string | undefined) {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile-billing", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("subscription_plan, subscription_status, subscription_start, subscription_end")
        .eq("id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project-access", projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await supabase
        .from("projects")
        .select("project_locked, project_unlocked_at, unlock_type")
        .eq("id", projectId)
        .single();
      return data;
    },
    enabled: !!projectId,
  });

  const subscriptionActive = profile?.subscription_status === "active" &&
    (!profile?.subscription_end || new Date(profile.subscription_end) > new Date());

  const isProjectUnlocked = project?.project_locked === false;
  const hasAccess = subscriptionActive || isProjectUnlocked;

  return {
    hasAccess,
    subscriptionPlan: profile?.subscription_plan || "free",
    subscriptionStatus: profile?.subscription_status || "inactive",
    isProjectUnlocked,
    loading: profileLoading || projectLoading,
  };
}
