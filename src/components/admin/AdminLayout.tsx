import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AdminSidebar from "./AdminSidebar";
import { Outlet } from "react-router-dom";
import { useAdminRole } from "@/hooks/useAdminRole";

export default function AdminLayout() {
  const { adminRole } = useAdminRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <header className="h-12 flex items-center border-b border-border px-4 shrink-0">
            <SidebarTrigger className="mr-3" />
            <span className="text-xs text-muted-foreground">Admin Console</span>
          </header>
          <main className="flex-1 overflow-auto">
            <div className="p-6 max-w-[1600px] mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
