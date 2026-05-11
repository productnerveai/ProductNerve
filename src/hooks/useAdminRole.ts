import { useAuth } from "@/contexts/AuthContext";

export type AdminRole = "admin" | "product_analyst" | "support_specialist" | "growth_analyst";

/**
 * Permission matrix per role.
 * Super Admin has full access (*).
 * Others are explicitly scoped.
 */
const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  admin: ["*"],
  product_analyst: [
    "/admin",
    "/admin/platform-analytics",
    "/admin/product-analytics",
    "/admin/growth-analytics",
    "/admin/users",
    "/admin/kyc",
    "/admin/contacts",
    "/admin/communications",
    "/admin/content",
    "/admin/studio-analytics",
    "/admin/studio-content",
    "/admin/studio-ai",
    "/admin/studio-activity",
    "/admin/studio-moderation",
  ],
  growth_analyst: [
    "/admin",
    "/admin/platform-analytics",
    "/admin/product-analytics",
    "/admin/growth-analytics",
    "/admin/users",
    "/admin/contacts",
    "/admin/communications",
    "/admin/content",
    "/admin/studio-analytics",
    "/admin/studio-activity",
  ],
  support_specialist: [
    "/admin",
    "/admin/contacts",
    "/admin/communications",
    "/admin/content",
  ],
};

export function useAdminRole() {
  const { user, loading: authLoading } = useAuth();
  
  // Get admin role from user profile, map backend role to frontend role
  const getAdminRole = (userRole?: string): AdminRole | null => {
    if (!userRole) return null;
    
    // Map backend roles to frontend admin roles
    switch (userRole) {
      case "admin":
        return "admin";
      case "product_analyst":
        return "product_analyst";
      case "support_specialist":
        return "support_specialist";
      case "growth_analyst":
        return "growth_analyst";
      default:
        return null;
    }
  };

  const adminRole = getAdminRole(user?.role);
  const isLoading = authLoading;

  const hasAccess = (route: string): boolean => {
    if (!adminRole) return false;
    if (adminRole === "admin") return true;
    const perms = ROLE_PERMISSIONS[adminRole] || [];
    return perms.some(p => p === "*" || route === p || route.startsWith(p + "/"));
  };

  // Granular permission helpers
  const isSuperAdmin = adminRole === "admin";
  const canManageUsers = isSuperAdmin || adminRole === "product_analyst" || adminRole === "growth_analyst";
  const canManageBilling = isSuperAdmin;
  const canViewAnalytics = isSuperAdmin || adminRole === "product_analyst" || adminRole === "growth_analyst";
  const canManageSettings = isSuperAdmin;
  const canViewContacts = isSuperAdmin || adminRole === "support_specialist" || adminRole === "product_analyst" || adminRole === "growth_analyst";
  const canViewCommunications = isSuperAdmin || adminRole !== "support_specialist" || adminRole === "support_specialist"; // all roles
  const canManageWorkspaces = isSuperAdmin;
  const canViewKYC = isSuperAdmin || adminRole === "product_analyst";
  const canManageContent = isSuperAdmin || adminRole === "product_analyst" || adminRole === "growth_analyst" || adminRole === "support_specialist";
  const canViewSecurity = isSuperAdmin;
  const canPromoteToAdmin = isSuperAdmin;

  return {
    adminRole,
    isLoading,
    hasAccess,
    isSuperAdmin,
    canManageUsers,
    canManageBilling,
    canViewAnalytics,
    canManageSettings,
    canViewContacts,
    canViewCommunications,
    canManageWorkspaces,
    canViewKYC,
    canManageContent,
    canViewSecurity,
    canPromoteToAdmin,
  };
}
