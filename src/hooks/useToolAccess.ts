import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ToolName =
  | "prd_generator"
  | "user_story_generator"
  | "icp_builder"
  | "experiment_engine"
  | "growth_engine"
  | "roadmap_generator";

interface ToolAccessResult {
  hasAccess: boolean;
  reason: string;
  documentCount: number;
  maxDocuments: number | null;
  canExport: boolean;
  canLinkProject: boolean;
  loading: boolean;
  plan: string;
}

export function useToolAccess(toolName: ToolName, workspaceId?: string): ToolAccessResult {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["tool-access-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("plan_type, tool_access, subscription_plan, subscription_status")
        .eq("id", user.id)
        .single();
      return data as any;
    },
    enabled: !!user,
  });

  // Count documents for tool pages (informational; access is plan-gated)
  const tableMap: Record<ToolName, string> = {
    prd_generator: "prd_documents",
    user_story_generator: "user_stories",
    icp_builder: "icp_profiles",
    experiment_engine: "experiments",
    growth_engine: "growth_plans",
    roadmap_generator: "roadmaps",
  };

  const { data: docCount, isLoading: countLoading } = useQuery({
    queryKey: ["tool-doc-count", toolName, workspaceId],
    queryFn: async () => {
      if (!workspaceId) return 0;
      const { count } = await supabase
        .from(tableMap[toolName] as any)
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);
      return count ?? 0;
    },
    enabled: !!workspaceId,
  });

  const loading = profileLoading || countLoading;

  const isProActive =
    profile?.tool_access === true ||
    (profile?.subscription_status === "active" && profile?.subscription_plan === "pro");

  const plan = isProActive ? "pro" : profile?.plan_type || "free";

  if (isProActive) {
    return {
      hasAccess: true,
      reason: "",
      documentCount: docCount ?? 0,
      maxDocuments: null,
      canExport: true,
      canLinkProject: true,
      loading,
      plan: "pro",
    };
  }

  return {
    hasAccess: false,
    reason: "Product Studio tools are available on the Pro plan. Upgrade to Pro ($16.99/month) to unlock.",
    documentCount: docCount ?? 0,
    maxDocuments: 0,
    canExport: false,
    canLinkProject: false,
    loading,
    plan,
  };
}
