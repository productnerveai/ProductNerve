import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronDown, Plus, Building2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function WorkspaceSelector() {
  const { activeWorkspace, workspaces, loading, setActiveWorkspace, setWorkspaces, refreshWorkspaces } = useWorkspace();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Load workspaces on component mount
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newWorkspace = data.data;
        setWorkspaces([...workspaces, newWorkspace]);
        setActiveWorkspace(newWorkspace);
        
        setCreating(false);
        setShowCreate(false);
        setName("");
        setDescription("");
        toast.success("Workspace created!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create workspace");
        setCreating(false);
      }
    } catch (error) {
      toast.error("Network error while creating workspace");
      setCreating(false);
    }
  };

  const setActiveWorkspaceId = (id: string) => {
    const workspace = workspaces.find(ws => (ws._id || ws.id) === id);
    if (workspace) {
      setActiveWorkspace(workspace);
    }
  };

  if (loading) {
    return (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        Loading...
      </Button>
    );
  }

  if (workspaces.length === 0) {
    return (
      <>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Create Workspace
        </Button>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Your First Workspace</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
              <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
              <Button onClick={handleCreate} className="w-full" disabled={creating}>
                {creating ? "Creating..." : "Create Workspace"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 max-w-[200px]">
            <Building2 className="h-4 w-4 shrink-0" />
            <span className="truncate">{activeWorkspace?.name || "Select Workspace"}</span>
            <ChevronDown className="h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws._id || ws.id}
              onClick={() => setActiveWorkspaceId(ws._id || ws.id)}
              className={(ws._id || ws.id) === (activeWorkspace?._id || activeWorkspace?.id) ? "bg-accent/10 font-medium" : ""}
            >
              <Building2 className="h-4 w-4 mr-2" />
              <span className="truncate">{ws.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Workspace</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="Workspace name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
            <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
            <Button onClick={handleCreate} className="w-full" disabled={creating}>
              {creating ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
