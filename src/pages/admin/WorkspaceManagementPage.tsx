import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Lock, Unlock, Archive, Pause, Trash2 } from "lucide-react";
import AdminApiService from "@/services/adminApi";

export default function WorkspaceManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedWs, setSelectedWs] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: string; id: string; name: string; entity: "workspace" | "project" } | null>(null);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 25;

  const loadProjects = async () => {
    try {
      console.log('Loading all projects...');
      const response = await AdminApiService.getAllProjects({
        page: 0,
        limit: 10000,
        search: "",
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      console.log('Projects API response:', response);
      if (response && response.success) {
        console.log('Setting projects from response.data.projects:', response.data.projects);
        // Log the structure of each project to see the field names
        response.data.projects.forEach((project: any, index: number) => {
          console.log(`Project ${index} structure:`, project);
        });
        setProjects(response.data.projects);
      } else {
        console.error("Failed to load projects - response:", response);
        setProjects([]); // Set empty array to prevent undefined issues
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]); // Set empty array to prevent undefined issues
    }
  };

  useEffect(() => {
    loadWorkspaces();
    loadProjects();
  }, [page, search]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.getAllWorkspaces({
        page,
        search,
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      if (response.success) {
        console.log('Workspaces loaded:', response.data.workspaces);
        // Log the structure of each workspace to see the field names
        response.data.workspaces.forEach((workspace: any, index: number) => {
          console.log(`Workspace ${index} structure:`, workspace);
        });
        setWorkspaces(response.data.workspaces);
        // Load profiles for workspace owners
        if (response.data.workspaces.length > 0) {
          const userIds = response.data.workspaces.map((ws: any) => ws.user._id);
          console.log('Extracted user IDs from workspaces:', userIds);
          loadProfiles(userIds);
        }
      } else {
        toast.error("Failed to load workspaces");
      }
    } catch (error) {
      toast.error("Error loading workspaces");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfiles = async (userIds: string[]) => {
    try {
      console.log('Loading profiles for user IDs:', userIds);
      const response = await AdminApiService.getUsersByIds(userIds);
      console.log('Profiles API response:', response);
      if (response.success) {
        console.log('Setting profiles from response.data.users:', response.data.users);
        setProfiles(response.data.users);
      } else {
        console.error("Failed to load profiles:", response.error);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const updateProject = async ({ projectId, updates }: { projectId: string; updates: any }) => {
    setIsLoading(true);
    setTimeout(() => {
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updates } : p));
      toast.success("Project updated");
      setConfirmAction(null);
      setIsLoading(false);
    }, 1000);
  };

  const updateWorkspace = async ({ wsId, updates }: { wsId: string; updates: any }) => {
    setIsLoading(true);
    try {
      if (updates.status) {
        const response = await AdminApiService.updateWorkspaceStatus(wsId, updates.status);
        if (response.success) {
          setWorkspaces(prev => prev.map(ws => ws.id === wsId ? { ...ws, ...response.data } : ws));
          toast.success("Workspace status updated");
          setConfirmAction(null);
        } else {
          toast.error(response.error || "Failed to update workspace");
        }
      }
    } catch (error) {
      toast.error("Error updating workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWorkspace = async (wsId: string) => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.deleteWorkspace(wsId);
      if (response.success) {
        setWorkspaces(prev => prev.filter(ws => ws.id !== wsId));
        toast.success("Workspace deleted");
        setConfirmAction(null);
      } else {
        toast.error(response.error || "Failed to delete workspace");
      }
    } catch (error) {
      toast.error("Error deleting workspace");
    } finally {
      setIsLoading(false);
    }
  };

  const getOwner = (userId: string | null) => profiles?.find(p => p.id === userId) || profiles?.find(p => p._id === userId);
  const getProjectCount = (wsId: string) => {
    const count = projects?.filter(p => {
      const pid = p.workspace?.id || p.workspace?._id || p.workspace_id;
      return String(pid) === String(wsId);
    }).length || 0;
    return count;
  };

  const getWsProjects = (wsId: string) => {
    return projects?.filter(p => {
      const pid = p.workspace?.id || p.workspace?._id || p.workspace_id;
      return String(pid) === String(wsId);
    }) || [];
  };

  const totalProjects = projects?.length ?? 0;
  const lockedProjects = projects?.filter(p => p.project_locked === true).length ?? 0;
  const unlockedProjects = projects?.filter(p => p.project_locked === false).length ?? 0;

  console.log('Project totals - Total:', totalProjects, 'Locked:', lockedProjects, 'Unlocked:', unlockedProjects);

  const filtered = workspaces?.filter(w =>
    w.name?.toLowerCase().includes(search.toLowerCase()) ||
    getOwner(w.user._id)?.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const wsStatus = (ws: any) => ws.status || "active";

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.entity === "workspace") {
      if (confirmAction.type === "delete") {
        deleteWorkspace(confirmAction.id);
      } else {
        updateWorkspace({ wsId: confirmAction.id, updates: { status: confirmAction.type } });
      }
    } else {
      if (confirmAction.type === "delete") {
        updateProject({ projectId: confirmAction.id, updates: { status: "deleted" } });
      } else if (confirmAction.type === "lock") {
        updateProject({ projectId: confirmAction.id, updates: { project_locked: true } });
      } else if (confirmAction.type === "unlock") {
        updateProject({ projectId: confirmAction.id, updates: { project_locked: false, unlock_type: "admin_grant" } });
      } else {
        updateProject({ projectId: confirmAction.id, updates: { status: confirmAction.type } });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workspace Management</h1>
        <p className="text-muted-foreground text-sm">Manage workspaces and their projects</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Workspaces</p><p className="text-2xl font-bold text-primary">{workspaces?.length ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Total Projects</p><p className="text-2xl font-bold text-primary">{totalProjects}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Unlocked Projects</p><p className="text-2xl font-bold text-accent">{unlockedProjects}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-muted-foreground">Locked Projects</p><p className="text-2xl font-bold text-muted-foreground">{lockedProjects}</p></CardContent></Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search workspaces..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Workspace</TableHead><TableHead>Owner</TableHead><TableHead>Projects</TableHead>
            <TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {paginated.map(w => {
              const owner = getOwner(w.user._id);
              const status = wsStatus(w);
              return (
                <TableRow key={w.id}>
                  <TableCell>
                    <button className="font-medium text-primary hover:underline" onClick={() => setSelectedWs(w)}>{w.name}</button>
                  </TableCell>
                  <TableCell className="text-sm">{owner?.email || "—"}</TableCell>
                  <TableCell>{getProjectCount(w.id)}</TableCell>
                  <TableCell><Badge variant={status === "suspended" ? "destructive" : status === "archived" ? "secondary" : status === "locked" ? "outline" : "default"}>{status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {status !== "locked" && <Button variant="ghost" size="icon" className="h-7 w-7" title="Lock" onClick={() => setConfirmAction({ type: "locked", id: w.id, name: w.name, entity: "workspace" })}><Lock className="h-3.5 w-3.5" /></Button>}
                      {status === "locked" && <Button variant="ghost" size="icon" className="h-7 w-7" title="Unlock" onClick={() => setConfirmAction({ type: "active", id: w.id, name: w.name, entity: "workspace" })}><Unlock className="h-3.5 w-3.5" /></Button>}
                      {status !== "archived" && <Button variant="ghost" size="icon" className="h-7 w-7" title="Archive" onClick={() => setConfirmAction({ type: "archived", id: w.id, name: w.name, entity: "workspace" })}><Archive className="h-3.5 w-3.5" /></Button>}
                      {status !== "suspended" && <Button variant="ghost" size="icon" className="h-7 w-7 text-accent" title="Suspend" onClick={() => setConfirmAction({ type: "suspended", id: w.id, name: w.name, entity: "workspace" })}><Pause className="h-3.5 w-3.5" /></Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" title="Delete" onClick={() => setConfirmAction({ type: "delete", id: w.id, name: w.name, entity: "workspace" })}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No workspaces found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtered.length} workspaces</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm py-1 px-2">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Workspace Detail with Projects */}
      <Dialog open={!!selectedWs} onOpenChange={() => setSelectedWs(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>{selectedWs?.name}</DialogTitle></DialogHeader>
          {selectedWs && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Owner:</span> {getOwner(selectedWs.user._id)?.name || "—"} ({getOwner(selectedWs.user._id)?.email || "—"})</div>
                <div><span className="text-muted-foreground">Created:</span> {new Date(selectedWs.created_at).toLocaleDateString()}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{wsStatus(selectedWs)}</Badge></div>
              </div>

              <div>
                <h3 className="font-semibold text-sm mb-2">Projects ({getWsProjects(selectedWs.id).length})</h3>
                {getWsProjects(selectedWs.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects</p>
                ) : (
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Name</TableHead><TableHead>Score</TableHead><TableHead>Status</TableHead>
                      <TableHead>Locked</TableHead><TableHead>Created</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {getWsProjects(selectedWs.id).map((p: any) => (
                        <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProject(p)}>
                          <TableCell className="font-medium text-primary">{p.name || "Untitled"}</TableCell>
                          <TableCell>{p.overall_score ? Number(p.overall_score).toFixed(0) : "—"}</TableCell>
                          <TableCell><Badge variant="outline">{p.status || "active"}</Badge></TableCell>
                          <TableCell><Badge variant={p.project_locked === false ? "default" : "secondary"}>{p.project_locked === false ? "Unlocked" : "Locked"}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Manage Project</DialogTitle></DialogHeader>
          {selectedProject && (
            <div className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{selectedProject.name || "Untitled"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Venture Score</span><span className="font-medium">{selectedProject.overall_score ? Number(selectedProject.overall_score).toFixed(0) : "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline">{selectedProject.status || "active"}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Locked</span><Badge variant={selectedProject.project_locked === false ? "default" : "secondary"}>{selectedProject.project_locked === false ? "Unlocked" : "Locked"}</Badge></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phase 1</span><span>{selectedProject.phase1_status || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phase 2</span><span>{selectedProject.phase2_status || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phase 3</span><span>{selectedProject.phase3_status || "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(selectedProject.created_at).toLocaleDateString()}</span></div>
              </div>

              <div className="border-t pt-4">
                <Label className="text-xs text-muted-foreground mb-2 block">Actions</Label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProject.project_locked !== false ? (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProject(null); setConfirmAction({ type: "unlock", id: selectedProject.id, name: selectedProject.name || "Untitled", entity: "project" }); }}>
                      <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProject(null); setConfirmAction({ type: "lock", id: selectedProject.id, name: selectedProject.name || "Untitled", entity: "project" }); }}>
                      <Lock className="h-3.5 w-3.5 mr-1" /> Lock
                    </Button>
                  )}
                  {(selectedProject.status || "active") !== "archived" && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProject(null); setConfirmAction({ type: "archived", id: selectedProject.id, name: selectedProject.name || "Untitled", entity: "project" }); }}>
                      <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                    </Button>
                  )}
                  {(selectedProject.status || "active") !== "paused" && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProject(null); setConfirmAction({ type: "paused", id: selectedProject.id, name: selectedProject.name || "Untitled", entity: "project" }); }}>
                      <Pause className="h-3.5 w-3.5 mr-1" /> Pause
                    </Button>
                  )}
                  {(selectedProject.status || "active") !== "active" && (
                    <Button variant="outline" size="sm" onClick={() => { setSelectedProject(null); updateProject({ projectId: selectedProject.id, updates: { status: "active" } }); }}>
                      Reactivate
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => { setSelectedProject(null); setConfirmAction({ type: "delete", id: selectedProject.id, name: selectedProject.name || "Untitled", entity: "project" }); }}>
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Action */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete" ? `Delete ${confirmAction.entity}?` : `${confirmAction?.type?.charAt(0).toUpperCase()}${confirmAction?.type?.slice(1)} ${confirmAction?.entity}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will {confirmAction?.type === "delete" ? "soft-delete" : `set status to ${confirmAction?.type} for`} {confirmAction?.entity} "{confirmAction?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
