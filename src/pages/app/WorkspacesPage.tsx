import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Building2, Users, UserPlus, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePlanLimits } from "@/hooks/usePlanLimits";

export default function WorkspacesPage() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("contributor");

  const {
    canCreateWorkspace,
    getWorkspaceLimitMessage,
    maxWorkspaces,
    currentWorkspaces,
    plan,
  } = usePlanLimits();

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    // TODO: Replace with actual API calls
    console.log("Would load workspace data for user:", user?.id);
    setWorkspaces([]);
    setMembers([]);
    setLoading(false);
  };

  const createWorkspace = async () => {
    if (!name.trim() || !companyId) return;
    
    // Check limits
    if (!canCreateWorkspace) {
      toast.error(getWorkspaceLimitMessage() || "Workspace limit reached");
      return;
    }

    // TODO: Replace with actual API call
    console.log("Would create workspace:", { name: name.trim(), description: description.trim(), companyId });
    
    setShowDialog(false);
    setName("");
    setDescription("");
    toast.success("Workspace created!");
    loadData();
  };

  const inviteMember = async () => {
    if (!inviteEmail.trim() || !companyId) return;

    // TODO: Replace with actual API calls
    console.log("Would invite member:", { email: inviteEmail.trim(), role: inviteRole, companyId });

    setShowInviteDialog(false);
    setInviteEmail("");
    setInviteRole("contributor");
    toast.success("Team member added!");
    loadData();
  };

  const removeMember = async (membershipId: string, userId: string) => {
    if (userId === user!.id) {
      toast.error("You can't remove yourself");
      return;
    }
    // TODO: Replace with actual API call
    console.log("Would remove member:", { membershipId, userId });
    toast.success("Member removed");
    loadData();
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-primary/10 text-primary";
      case "admin": return "bg-accent/10 text-accent";
      case "strategist": return "bg-blue-100 text-blue-700";
      case "contributor": return "bg-amber-100 text-amber-700";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const limitMessage = getWorkspaceLimitMessage();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Workspaces & Team</h1>
          <p className="text-sm text-muted-foreground">
            Manage workspaces and team members • {currentWorkspaces}/{maxWorkspaces === Infinity ? "∞" : maxWorkspaces} workspaces used
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2"><UserPlus className="h-4 w-4" /> Invite Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Invite Team Member</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} maxLength={255} />
                  <p className="text-xs text-muted-foreground mt-1">User must have an existing account</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Role</label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin — Workspace management</SelectItem>
                      <SelectItem value="strategist">Strategist — Create/edit projects</SelectItem>
                      <SelectItem value="contributor">Contributor — Input/edit data</SelectItem>
                      <SelectItem value="viewer">Viewer — Read-only & export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={inviteMember} className="w-full">Add Team Member</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!canCreateWorkspace}>
                <Plus className="h-4 w-4" /> New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Workspace</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
                <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
                <Button onClick={createWorkspace} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Plan Limit Warning */}
      {limitMessage && (
        <Alert className="mb-6 border-accent/50 bg-accent/5">
          <AlertTriangle className="h-4 w-4 text-accent" />
          <AlertDescription className="text-sm">
            {limitMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Team Members */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Team Members ({members.length})</h3>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No team members yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {((m.profiles as any)?.name || (m.profiles as any)?.email || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{(m.profiles as any)?.name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{(m.profiles as any)?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs ${roleColor(m.role)}`}>{m.role}</Badge>
                  {m.user_id !== user!.id && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeMember(m.id, m.user_id)}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Workspaces */}
      <h3 className="font-semibold mb-4">Workspaces</h3>
      {workspaces.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No workspaces yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((ws) => (
            <div key={ws.id} className="glass-card rounded-xl p-5">
              <h3 className="font-semibold mb-1">{ws.name}</h3>
              {ws.description && <p className="text-sm text-muted-foreground">{ws.description}</p>}
              <p className="text-xs text-muted-foreground mt-3">{new Date(ws.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
