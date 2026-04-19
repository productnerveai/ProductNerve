import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, Search, UserX, UserCheck, Shield, ArrowUpCircle, Gift, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAdminRole } from "@/hooks/useAdminRole";

// Define AdminRole type locally to avoid import issues
type AdminRole = "super_admin" | "product_analyst" | "support_specialist" | "growth_analyst";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

// Generate dummy data
const generateDummyUsers = () => [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    company_name: "Tech Corp",
    user_status: "active",
    subscription_plan: "pro",
    subscription_status: "active",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    company_name: "Startup Inc",
    user_status: "active",
    subscription_plan: "free",
    subscription_status: null,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user3",
    name: "Bob Wilson",
    email: "bob@example.com",
    company_name: null,
    user_status: "suspended",
    subscription_plan: "pro",
    subscription_status: "active",
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user4",
    name: "Alice Johnson",
    email: "alice@example.com",
    company_name: "Design Co",
    user_status: "active",
    subscription_plan: "pro",
    subscription_status: "active",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "user5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    user_status: "deactivated",
    subscription_plan: "free",
    subscription_status: null,
    created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const generateDummyWorkspaces = () => [
  { id: "ws1", user_id: "user1", name: "Tech Corp Workspace" },
  { id: "ws2", user_id: "user1", name: "Side Project" },
  { id: "ws3", user_id: "user2", name: "Startup Inc Workspace" },
  { id: "ws4", user_id: "user4", name: "Design Co Workspace" },
];

const generateDummyProjects = () => [
  { id: "proj1", name: "AI Project Manager", workspace_id: "ws1", phase1_status: "completed", phase2_status: "completed", phase3_status: "completed", overall_score: 85, status: "active", project_locked: false },
  { id: "proj2", name: "E-commerce Platform", workspace_id: "ws2", phase1_status: "completed", phase2_status: "in_progress", phase3_status: null, overall_score: 72, status: "active", project_locked: true },
  { id: "proj3", name: "Mobile App", workspace_id: "ws3", phase1_status: "completed", phase2_status: "completed", phase3_status: "locked", overall_score: 68, status: "active", project_locked: true },
  { id: "proj4", name: "SaaS Tool", workspace_id: "ws4", phase1_status: "in_progress", phase2_status: null, phase3_status: null, overall_score: null, status: "active", project_locked: true },
];

const generateDummyPayments = () => [
  { id: "pay1", user_id: "user1", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay2", user_id: "user1", amount: 99.00, payment_type: "project_unlock", status: "success", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay3", user_id: "user3", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay4", user_id: "user4", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateDummyAdmins = () => [
  { user_id: "user1", admin_role: "super_admin" as AdminRole, is_active: true },
  { user_id: "user4", admin_role: "product_analyst" as AdminRole, is_active: true },
];

export default function UserManagementPage() {
  const { canManageUsers, canPromoteToAdmin, isSuperAdmin } = useAdminRole();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; userId: string; userName: string } | null>(null);
  const [promoteUser, setPromoteUser] = useState<any>(null);
  const [selectedAdminRole, setSelectedAdminRole] = useState<string>("");
  const [grantAccessUser, setGrantAccessUser] = useState<any>(null);
  const [grantDuration, setGrantDuration] = useState<string>("30");
  const [page, setPage] = useState(0);
  const [users, setUsers] = useState(generateDummyUsers());
  const [workspaces, setWorkspaces] = useState(generateDummyWorkspaces());
  const [projects, setProjects] = useState(generateDummyProjects());
  const [payments, setPayments] = useState(generateDummyPayments());
  const [platformAdmins, setPlatformAdmins] = useState(generateDummyAdmins());
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 25;

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const updateUserStatus = async ({ userId, status }: { userId: string; status: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, user_status: status } : u));
      toast.success("User status updated");
      setConfirmAction(null);
      setIsLoading(false);
    }, 1000);
  };

  const upgradeSubscription = async (userId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        subscription_plan: "pro",
        subscription_status: "active",
        subscription_start: new Date().toISOString(),
        subscription_end: null,
        subscription_granted_by: "admin",
        subscription_granted_at: new Date().toISOString(),
      } : u));
      toast.success("Subscription upgraded to Pro");
      setIsLoading(false);
    }, 1500);
  };

  const grantFreeAccess = async ({ userId, days }: { userId: string; days: number }) => {
    setIsLoading(true);
    setTimeout(() => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + days);
      
      setUsers(prev => prev.map(u => u.id === userId ? {
        ...u,
        subscription_plan: "pro",
        subscription_status: "active",
        subscription_start: now.toISOString(),
        subscription_end: endDate.toISOString(),
        subscription_granted_by: "admin",
        subscription_granted_at: now.toISOString(),
      } : u));
      
      toast.success("Free access granted");
      setGrantAccessUser(null);
      setIsLoading(false);
    }, 1500);
  };

  const promoteToAdmin = async ({ userId, role }: { userId: string; role: AdminRole }) => {
    setIsLoading(true);
    setTimeout(() => {
      const existing = platformAdmins.find(a => a.user_id === userId);
      if (existing) {
        setPlatformAdmins(prev => prev.map(a => a.user_id === userId ? { ...a, admin_role: role, is_active: true } : a));
      } else {
        setPlatformAdmins(prev => [...prev, { user_id: userId, admin_role: role, is_active: true }]);
      }
      
      toast.success("User promoted");
      setPromoteUser(null);
      setSelectedAdminRole("");
      setIsLoading(false);
    }, 1500);
  };

  const removeAdminRole = async (userId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setPlatformAdmins(prev => prev.map(a => a.user_id === userId ? { ...a, is_active: false } : a));
      toast.success("Admin role removed");
      setIsLoading(false);
    }, 1000);
  };

  const filtered = users?.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())) || [];
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const getUserWorkspaceCount = (userId: string) => workspaces?.filter(w => w.user_id === userId).length || 0;
  const getUserProjects = (userId: string) => { const wsIds = workspaces?.filter(w => w.user_id === userId).map(w => w.id) || []; return projects?.filter(p => wsIds.includes(p.workspace_id)) || []; };
  const getUserPayments = (userId: string) => payments?.filter(p => p.user_id === userId) || [];
  const getUserAdminRole = (userId: string) => { const a = platformAdmins?.find(a => a.user_id === userId && a.is_active); return a?.admin_role || null; };

  const totalUsers = users?.length ?? 0;
  const activeCount = users?.filter((u: any) => u.user_status === "active" || !u.user_status).length ?? 0;
  const suspendedCount = users?.filter((u: any) => u.user_status === "suspended").length ?? 0;
  const subscribedCount = users?.filter((u: any) => u.subscription_status === "active").length ?? 0;
  const deactivatedCount = users?.filter((u: any) => u.user_status === "deactivated").length ?? 0;
  // Users with unlocked projects (paid or admin-granted)
  const usersWithUnlocked = (() => {
    const userIdsWithUnlocked = new Set<string>();
    projects?.filter(p => p.project_locked === false).forEach(p => {
      const ws = workspaces?.find(w => w.id === p.workspace_id);
      if (ws?.user_id) userIdsWithUnlocked.add(ws.user_id);
    });
    return userIdsWithUnlocked.size;
  })();

  const adminRoleLabels: Record<string, string> = { super_admin: "Super Admin", product_analyst: "Product Analyst", growth_analyst: "Growth Analyst", support_specialist: "Support Specialist" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground text-sm">Full user operations — profiles, workspaces, projects, and payment history</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Users</p><p className="text-2xl font-bold text-primary">{totalUsers}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Active</p><p className="text-2xl font-bold text-primary">{activeCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Suspended</p><p className="text-2xl font-bold text-accent">{suspendedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Deactivated</p><p className="text-2xl font-bold text-muted-foreground">{deactivatedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Subscribed</p><p className="text-2xl font-bold text-primary">{subscribedCount}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Unlocked Projects</p><p className="text-2xl font-bold text-accent">{usersWithUnlocked}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Signup</TableHead>
            <TableHead>Workspaces</TableHead><TableHead>Projects</TableHead><TableHead>Plan</TableHead>
            <TableHead>Status</TableHead><TableHead>Admin</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {paginated.map((u: any) => {
              const adminRole = getUserAdminRole(u.id);
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name || "—"}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{getUserWorkspaceCount(u.id)}</TableCell>
                  <TableCell>{getUserProjects(u.id).length}</TableCell>
                  <TableCell><Badge variant={u.subscription_status === "active" ? "default" : "outline"}>{u.subscription_plan || "free"}</Badge></TableCell>
                  <TableCell><Badge variant={u.user_status === "suspended" ? "destructive" : u.user_status === "deactivated" ? "secondary" : "default"}>{u.user_status || "active"}</Badge></TableCell>
                  <TableCell>{adminRole ? <Badge className="bg-accent/10 text-accent text-xs">{adminRoleLabels[adminRole] || adminRole}</Badge> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(u)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                      {canPromoteToAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" onClick={() => { setPromoteUser(u); setSelectedAdminRole(adminRole || ""); }} title="Promote"><Shield className="h-3.5 w-3.5" /></Button>}
                      {isSuperAdmin && <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => setGrantAccessUser(u)} title="Grant Access"><Gift className="h-3.5 w-3.5" /></Button>}
                      {canManageUsers && u.user_status !== "suspended" && <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setConfirmAction({ type: "suspended", userId: u.id, userName: u.name || u.email })} title="Suspend"><UserX className="h-3.5 w-3.5" /></Button>}
                      {canManageUsers && u.user_status === "suspended" && <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => setConfirmAction({ type: "active", userId: u.id, userName: u.name || u.email })} title="Activate"><UserCheck className="h-3.5 w-3.5" /></Button>}
                      {canManageUsers && u.user_status !== "deactivated" && u.user_status !== "suspended" && <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setConfirmAction({ type: "deactivated", userId: u.id, userName: u.name || u.email })} title="Deactivate"><UserX className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No users found</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} users total</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm py-1 px-2">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* User Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>{selected?.name || selected?.email}</DialogTitle></DialogHeader>
          {selected && (
            <Tabs defaultValue="profile">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="projects">Projects ({getUserProjects(selected.id).length})</TabsTrigger>
                <TabsTrigger value="payments">Payments ({getUserPayments(selected.id).length})</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                  <div><span className="text-muted-foreground">Name:</span> {selected.name || "—"}</div>
                  <div><span className="text-muted-foreground">Company:</span> {selected.company_name || "—"}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge variant={selected.user_status === "suspended" ? "destructive" : "default"}>{selected.user_status || "active"}</Badge></div>
                  <div><span className="text-muted-foreground">Plan:</span> {selected.subscription_plan || "free"}</div>
                  <div><span className="text-muted-foreground">Joined:</span> {new Date(selected.created_at).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Workspaces:</span> {getUserWorkspaceCount(selected.id)}</div>
                  <div><span className="text-muted-foreground">Admin:</span> {getUserAdminRole(selected.id) ? adminRoleLabels[getUserAdminRole(selected.id)!] : "—"}</div>
                </div>
                <div className="flex gap-2">
                  {canManageUsers && selected.subscription_status !== "active" && <Button variant="outline" size="sm" onClick={() => upgradeSubscription(selected.id)} disabled={isLoading}><ArrowUpCircle className="h-3.5 w-3.5 mr-1" /> Upgrade to Pro</Button>}
                  {isSuperAdmin && <Button variant="outline" size="sm" onClick={() => setGrantAccessUser(selected)}><Gift className="h-3.5 w-3.5 mr-1" /> Grant Free Access</Button>}
                </div>
              </TabsContent>
              <TabsContent value="projects" className="mt-4">
                {getUserProjects(selected.id).length === 0 ? <p className="text-sm text-muted-foreground py-4">No projects</p> : (
                  <div className="space-y-2">
                    {getUserProjects(selected.id).map((p: any) => (
                      <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm">
                        <span className="font-medium">{p.name || "Untitled"}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">P1: {p.phase1_status || "—"}</Badge>
                          <Badge variant="outline" className="text-[10px]">P2: {p.phase2_status || "—"}</Badge>
                          <Badge variant="outline" className="text-[10px]">P3: {p.phase3_status || "—"}</Badge>
                          {p.overall_score && <Badge>{Number(p.overall_score).toFixed(0)}</Badge>}
                          <Badge variant={p.project_locked === false ? "default" : "secondary"}>{p.project_locked === false ? "Unlocked" : "Locked"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="payments" className="mt-4">
                {getUserPayments(selected.id).length === 0 ? <p className="text-sm text-muted-foreground py-4">No payments</p> : (
                  <Table>
                    <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {getUserPayments(selected.id).map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="capitalize">{p.payment_type?.replace("_", " ")}</TableCell>
                          <TableCell>${Number(p.amount || 0).toFixed(2)}</TableCell>
                          <TableCell><Badge variant={p.status === "success" ? "default" : "secondary"}>{p.status}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Promote to Admin */}
      <Dialog open={!!promoteUser} onOpenChange={() => { setPromoteUser(null); setSelectedAdminRole(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Promote to Admin Role</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Assign admin role to <span className="font-medium text-foreground">{promoteUser?.name || promoteUser?.email}</span></p>
            <div>
              <Label className="mb-2 block">Admin Role</Label>
              <Select value={selectedAdminRole} onValueChange={setSelectedAdminRole}>
                <SelectTrigger><SelectValue placeholder="Select role..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_analyst">Product Analyst</SelectItem>
                  <SelectItem value="growth_analyst">Growth Analyst</SelectItem>
                  <SelectItem value="support_specialist">Support Specialist</SelectItem>
                  {isSuperAdmin && <SelectItem value="super_admin">Super Admin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => promoteUser && selectedAdminRole && promoteToAdmin({ userId: promoteUser.id, role: selectedAdminRole as AdminRole })} disabled={!selectedAdminRole || isLoading} className="flex-1">
                <Crown className="h-4 w-4 mr-1" /> Promote
              </Button>
              {getUserAdminRole(promoteUser?.id) && <Button variant="destructive" onClick={() => promoteUser && removeAdminRole(promoteUser.id)} disabled={isLoading}>Remove Role</Button>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grant Free Access */}
      <Dialog open={!!grantAccessUser} onOpenChange={() => setGrantAccessUser(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Grant Free Subscription Access</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">Grant free Pro access to <span className="font-medium text-foreground">{grantAccessUser?.name || grantAccessUser?.email}</span></p>
            <div>
              <Label className="mb-2 block">Duration</Label>
              <Select value={grantDuration} onValueChange={setGrantDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem><SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem><SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => grantAccessUser && grantFreeAccess({ userId: grantAccessUser.id, days: parseInt(grantDuration) })} disabled={isLoading} className="w-full">
              <Gift className="h-4 w-4 mr-1" /> Grant {grantDuration} Days
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Action */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.type === "suspended" ? "Suspend User?" : confirmAction?.type === "deactivated" ? "Deactivate User?" : "Activate User?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "suspended" ? `Suspend ${confirmAction?.userName}. They won't be able to access the platform.` : confirmAction?.type === "deactivated" ? `Deactivate ${confirmAction?.userName}'s account.` : `Reactivate ${confirmAction?.userName}'s account.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmAction && updateUserStatus({ userId: confirmAction.userId, status: confirmAction.type })} disabled={isLoading}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
