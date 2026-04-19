import { useState } from "react";
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

// Dummy workspaces data
const dummyWorkspaces = [
  {
    id: "ws1",
    name: "Product Development",
    description: "Main product development workspace",
    user_id: "user1",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ws2", 
    name: "Marketing Team",
    description: "Marketing campaigns and strategies",
    user_id: "user1",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "ws3",
    name: "Research Lab",
    description: "Research and development projects",
    user_id: "user1",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export default function WorkspaceSelector() {
  const [workspaces, setWorkspaces] = useState(dummyWorkspaces);
  const [activeWorkspace, setActiveWorkspace] = useState(dummyWorkspaces[0]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) return;
    setCreating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newWorkspace = {
        id: `ws${Date.now()}`,
        name: name.trim(),
        description: description.trim() || null,
        user_id: "user1",
        created_at: new Date().toISOString()
      };
      
      setWorkspaces(prev => [...prev, newWorkspace]);
      setActiveWorkspace(newWorkspace);
      setCreating(false);
      setShowCreate(false);
      setName("");
      setDescription("");
      toast.success("Workspace created!");
    }, 1000);
  };

  const setActiveWorkspaceId = (id: string) => {
    const workspace = workspaces.find(ws => ws.id === id);
    if (workspace) {
      setActiveWorkspace(workspace);
    }
  };

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
              key={ws.id}
              onClick={() => setActiveWorkspaceId(ws.id)}
              className={ws.id === activeWorkspace?.id ? "bg-accent/10 font-medium" : ""}
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
