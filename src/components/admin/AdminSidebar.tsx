import { useLocation, Link, useNavigate } from "react-router-dom";
import logoMark from "@/assets/logo-mark.png";
import {
  LayoutDashboard, BarChart3, TrendingUp, Rocket, Users,
  CreditCard, MessageSquare, Bell, Settings, LogOut,
  ArrowLeft, Shield, ChevronDown, Layers, ShieldCheck, FileText,
  Wrench, Activity, Cpu, ListFilter, ShieldAlert
} from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Dummy signOut function
  const signOut = async () => {
    // Simulate sign out
    console.log("Signing out...");
    navigate("/");
  };
  const {
    adminRole,
    canViewAnalytics,
    canManageUsers,
    canManageWorkspaces,
    canViewKYC,
    canManageBilling,
    canViewContacts,
    canViewCommunications,
    canManageContent,
    canManageSettings,
    canViewSecurity,
  } = useAdminRole();

  const roleBadge: Record<string, string> = {
    super_admin: "Super Admin",
    product_analyst: "Product Analyst",
    support_specialist: "Support Specialist",
    growth_analyst: "Growth Analyst",
  };

  const analyticsItems = [
    { title: "Platform Analytics", url: "/admin/platform-analytics", icon: BarChart3 },
    { title: "Product Analytics", url: "/admin/product-analytics", icon: TrendingUp },
    { title: "Growth & Marketing", url: "/admin/growth-analytics", icon: Rocket },
  ];

  const operationsItems = [
    ...(canManageUsers ? [{ title: "User Management", url: "/admin/users", icon: Users }] : []),
    ...(canManageWorkspaces ? [{ title: "Workspace Management", url: "/admin/workspaces", icon: Layers }] : []),
    ...(canViewKYC ? [{ title: "KYC Management", url: "/admin/kyc", icon: ShieldCheck }] : []),
    ...(canManageBilling ? [{ title: "Billing & Subscriptions", url: "/admin/billing", icon: CreditCard }] : []),
  ];

  const communicationsItems = [
    ...(canViewContacts ? [{ title: "Contact Center", url: "/admin/contacts", icon: MessageSquare }] : []),
    ...(canViewCommunications ? [{ title: "Notification Center", url: "/admin/communications", icon: Bell }] : []),
    ...(canManageContent ? [{ title: "Content Management", url: "/admin/content", icon: FileText }] : []),
  ];

  const studioItems = [
    { title: "Tool Usage Analytics", url: "/admin/studio-analytics", icon: BarChart3 },
    { title: "Content Management", url: "/admin/studio-content", icon: FileText },
    // { title: "AI Monitoring", url: "/admin/studio-ai", icon: Cpu },
    // { title: "Activity Feed", url: "/admin/studio-activity", icon: Activity },
    // { title: "Moderation", url: "/admin/studio-moderation", icon: ShieldAlert },
  ];

  const isAnalyticsActive = analyticsItems.some(i => location.pathname === i.url);
  const isOpsActive = operationsItems.some(i => location.pathname === i.url);
  const isCommsActive = communicationsItems.some(i => location.pathname === i.url);
  const isStudioActive = studioItems.some(i => location.pathname === i.url);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <div className="p-4 border-b border-sidebar-border">
        <a href="https://productnerve.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
          <img src={logoMark} alt="Product Nerve AI" className="h-8 w-8 rounded-lg" />
          <div>
            <p className="font-bold text-sm text-sidebar-foreground leading-none">Product Nerve</p>
            <p className="text-[10px] text-sidebar-accent-foreground mt-0.5">
              {roleBadge[adminRole || ""] || "Admin"}
            </p>
          </div>
        </a>
      </div>

      <SidebarContent className="scrollbar-hide">
        {/* Overview */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/admin"}>
                  <Link to="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Intelligence Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics */}
        {canViewAnalytics && (
          <SidebarGroup>
            <Collapsible defaultOpen={isAnalyticsActive}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                Analytics
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {analyticsItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Operations */}
        {operationsItems.length > 0 && (
          <SidebarGroup>
            <Collapsible defaultOpen={isOpsActive}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                Operations
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {operationsItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Product Studio */}
        {canViewAnalytics && (
          <SidebarGroup>
            <Collapsible defaultOpen={isStudioActive}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                <span className="flex items-center gap-1.5"><Wrench className="h-3 w-3" /> Product Studio</span>
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {studioItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Communications */}
        {communicationsItems.length > 0 && (
          <SidebarGroup>
            <Collapsible defaultOpen={isCommsActive}>
              <CollapsibleTrigger className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider hover:text-sidebar-foreground transition-colors">
                Communications
                <ChevronDown className="h-3 w-3" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {communicationsItems.map(item => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                          <Link to={item.url}><item.icon className="h-4 w-4" /><span>{item.title}</span></Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* System */}
        {/* {(canViewSecurity || canManageSettings) && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {canViewSecurity && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/admin/security"}>
                      <Link to="/admin/security"><Shield className="h-4 w-4" /><span>Security & Audit</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                {canManageSettings && (
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/admin/settings"}>
                      <Link to="/admin/settings"><Settings className="h-4 w-4" /><span>Settings</span></Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )} */}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/app"><ArrowLeft className="h-4 w-4" /><span>Back to App</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={async () => { await signOut(); navigate("/"); }}>
              <LogOut className="h-4 w-4" /><span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
