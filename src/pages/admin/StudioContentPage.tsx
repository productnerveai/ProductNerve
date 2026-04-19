import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, Eye, Trash2, Archive, Flag } from "lucide-react";
import { format } from "date-fns";

type ToolTab = "prd_documents" | "user_stories" | "icp_profiles" | "experiments" | "growth_plans" | "roadmaps";

const TAB_CONFIG: { key: ToolTab; label: string }[] = [
  { key: "prd_documents", label: "PRDs" },
  { key: "user_stories", label: "User Stories" },
  { key: "icp_profiles", label: "ICP Profiles" },
  { key: "experiments", label: "Experiments" },
  { key: "growth_plans", label: "Growth Plans" },
  { key: "roadmaps", label: "Roadmaps" },
];

// Generate dummy studio content data
const generateDummyContent = (activeTab: ToolTab) => {
  const baseData = {
    prd_documents: Array.from({ length: 25 }, (_, i) => ({
      id: `prd_${i + 1}`,
      title: `PRD Document ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    user_stories: Array.from({ length: 18 }, (_, i) => ({
      id: `story_${i + 1}`,
      title: `User Story ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    icp_profiles: Array.from({ length: 32 }, (_, i) => ({
      id: `icp_${i + 1}`,
      title: `ICP Profile ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    experiments: Array.from({ length: 22 }, (_, i) => ({
      id: `exp_${i + 1}`,
      title: `Experiment ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    growth_plans: Array.from({ length: 15 }, (_, i) => ({
      id: `growth_${i + 1}`,
      title: `Growth Plan ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
    roadmaps: Array.from({ length: 28 }, (_, i) => ({
      id: `roadmap_${i + 1}`,
      title: `Roadmap ${i + 1}`,
      status: ["active", "archived", "draft"][Math.floor(Math.random() * 3)],
      user_id: `user${Math.floor(Math.random() * 5) + 1}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    })),
  };
  
  return baseData[activeTab] || [];
};

export default function StudioContentPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>("prd_documents");
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setItems(generateDummyContent(activeTab));
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [activeTab]);

  const deleteItem = async (id: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted");
      setIsLoading(false);
    }, 1000);
  };

  const filtered = items?.filter((item: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.title || "").toLowerCase().includes(s) || (item.user_id || "").toLowerCase().includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Studio Content Management</h1>
        <p className="text-muted-foreground text-sm">View and manage all generated documents across tools.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as ToolTab); setSearch(""); }}>
        <TabsList className="flex-wrap h-auto">
          {TAB_CONFIG.map((t) => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by title or user ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </div>

        {TAB_CONFIG.map((t) => (
          <TabsContent key={t.key} value={t.key}>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : !filtered?.length ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No documents found</TableCell></TableRow>
                    ) : (
                      filtered.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">{item.title || "Untitled"}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{item.status || "—"}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">{item.user_id?.slice(0, 8)}...</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "—"}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => setViewItem(item)}><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this item?")) deleteItem(item.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title || "Document Details"}</DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
            {JSON.stringify(viewItem, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
