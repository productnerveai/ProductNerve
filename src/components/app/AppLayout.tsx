import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "@/components/app/AppSidebar";
import WorkspaceSelector from "@/components/app/WorkspaceSelector";
import NotificationCenter from "@/components/app/NotificationCenter";
import ProfileCompletionNotification from "@/components/app/ProfileCompletionNotification";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
// import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Building2, CreditCard, Bell, LogOut } from "lucide-react";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    // <WorkspaceProvider>
      <SidebarProvider>
        <ProfileCompletionNotification />
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-14 border-b border-border flex items-center gap-4 px-4 bg-background">
              <SidebarTrigger />
              <div className="flex-1" />
              <WorkspaceSelector />
              <NotificationCenter />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="h-7 w-7 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-accent-foreground text-xs font-bold">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/app/settings?tab=workspaces")}>
                    <Building2 className="h-4 w-4 mr-2" /> Workspace Settings
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem onClick={() => navigate("/app/billing")}>
                    <CreditCard className="h-4 w-4 mr-2" /> Billing & Subscription
                  </DropdownMenuItem> */}
                  <DropdownMenuItem onClick={() => navigate("/app/settings?tab=notifications")}>
                    <Bell className="h-4 w-4 mr-2" /> Notification Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </header>
            <main className="flex-1 p-6 bg-muted/20">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    // </WorkspaceProvider>
  );
}
