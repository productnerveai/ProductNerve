import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface PlanLimits {
  maxWorkspaces: number;
  maxProjectsPerWorkspace: number;
  totalMaxProjects: number;
  plan: string;
  isEnterprise: boolean;
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    maxWorkspaces: 1,
    maxProjectsPerWorkspace: 1,
    totalMaxProjects: 1,
    plan: "free",
    isEnterprise: false,
  },
  project_unlock: {
    maxWorkspaces: 1,
    maxProjectsPerWorkspace: 2,
    totalMaxProjects: 2,
    plan: "project_unlock",
    isEnterprise: false,
  },
  pro: {
    maxWorkspaces: 2,
    maxProjectsPerWorkspace: 3,
    totalMaxProjects: 6,
    plan: "pro",
    isEnterprise: false,
  },
  enterprise: {
    maxWorkspaces: Infinity,
    maxProjectsPerWorkspace: Infinity,
    totalMaxProjects: Infinity,
    plan: "enterprise",
    isEnterprise: true,
  },
};

export function usePlanLimits() {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile-limits", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // TODO: Replace with actual API call
      return null;
    },
    enabled: !!user,
  });

  const { data: workspaceCount, isLoading: wsLoading } = useQuery({
    queryKey: ["user-workspace-count", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      // TODO: Replace with actual API call
      return 0;
    },
    enabled: !!user,
  });

  const { data: projectCounts, isLoading: projLoading } = useQuery({
    queryKey: ["user-project-counts", user?.id],
    queryFn: async () => {
      if (!user) return { total: 0, byWorkspace: {} as Record<string, number> };
      // TODO: Replace with actual API call
      return { total: 0, byWorkspace: {} };
    },
    enabled: !!user,
  });

  const isLoading = profileLoading || wsLoading || projLoading;

  // Determine plan
  const planType =
    profile?.plan_type ||
    (profile?.subscription_status === "active" && profile?.subscription_plan === "pro" ? "pro" : "free");

  const effectivePlan = planType === "enterprise" ? "enterprise" : planType;

  // Get limits (allow backend + custom override)
  const baseLimits = PLAN_LIMITS[effectivePlan] || PLAN_LIMITS.free;

  const maxWorkspaces =
    profile?.workspace_limit ??
    profile?.max_workspaces ??
    baseLimits.maxWorkspaces;

  // NOTE: project_limit is treated as "max projects per workspace" in this app.
  const maxProjectsPerWorkspace =
    profile?.project_limit ??
    profile?.max_projects_per_workspace ??
    baseLimits.maxProjectsPerWorkspace;

  const totalMaxProjects = maxWorkspaces * maxProjectsPerWorkspace;

  const currentWorkspaces = workspaceCount ?? 0;
  const currentProjects = projectCounts?.total ?? 0;
  const projectsByWorkspace = projectCounts?.byWorkspace ?? {};

  const canCreateWorkspace = currentWorkspaces < maxWorkspaces;
  const canCreateProjectInWorkspace = (workspaceId: string) => {
    const wsProjectCount = projectsByWorkspace[workspaceId] || 0;
    return wsProjectCount < maxProjectsPerWorkspace && currentProjects < totalMaxProjects;
  };

  const getWorkspaceLimitMessage = () => {
    if (canCreateWorkspace) return null;
    if (effectivePlan === "free") {
      return "You’ve reached the Free plan workspace limit (1). Unlock a project or upgrade to Pro to create more.";
    }
    if (effectivePlan === "project_unlock") {
      return "You’ve reached the Project Unlock workspace limit (1). Upgrade to Pro to create more workspaces.";
    }
    return "You’ve reached your workspace limit. Upgrade to Enterprise to create more workspaces.";
  };

  const getProjectLimitMessage = (workspaceId: string) => {
    if (canCreateProjectInWorkspace(workspaceId)) return null;

    const wsProjectCount = projectsByWorkspace[workspaceId] || 0;
    if (wsProjectCount >= maxProjectsPerWorkspace) {
      if (effectivePlan === "free") {
        return `You’ve reached the Free plan project limit (${maxProjectsPerWorkspace}). Unlock a project or upgrade to Pro to create more.`;
      }
      if (effectivePlan === "project_unlock") {
        return `You’ve reached the Project Unlock plan project limit (${maxProjectsPerWorkspace}). Upgrade to Pro to create more.`;
      }
      return `You’ve reached your project limit (${maxProjectsPerWorkspace}) for this workspace.`;
    }

    return "You’ve reached your total project limit. Upgrade to Pro for higher limits.";
  };

  return {
    isLoading,
    plan: effectivePlan,
    maxWorkspaces,
    maxProjectsPerWorkspace,
    totalMaxProjects,
    currentWorkspaces,
    currentProjects,
    projectsByWorkspace,
    canCreateWorkspace,
    canCreateProjectInWorkspace,
    getWorkspaceLimitMessage,
    getProjectLimitMessage,
  };
}
