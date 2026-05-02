import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, Trash2, Eye, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

type ToolType = "prd_documents" | "user_stories" | "icp_profiles" | "experiments" | "growth_plans" | "roadmaps";

const TOOL_OPTIONS: { value: ToolType; label: string }[] = [
  { value: "prd_documents", label: "PRDs" },
  { value: "user_stories", label: "User Stories" },
  { value: "icp_profiles", label: "ICP Profiles" },
  { value: "experiments", label: "Experiments" },
  { value: "growth_plans", label: "Growth Plans" },
  { value: "roadmaps", label: "Roadmaps" },
];

export default function StudioModerationPage() {
  const [tool, setTool] = useState<ToolType>("prd_documents");
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState<any>(null);
  const qc = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ["admin-moderation", tool],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual API call
      console.log("Would delete item:", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-moderation", tool] });
      toast.success("Content removed");
    },
    onError: () => toast.error("Remove failed — check permissions"),
  });

  const filtered = items?.filter((item: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (item.title || "").toLowerCase().includes(s) || (item.user_id || "").includes(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Studio Moderation</h1>
        <p className="text-muted-foreground text-sm">Review, flag, and remove generated content across all tools.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Content Review</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={tool} onValueChange={(v) => setTool(v as ToolType)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOOL_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-[200px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : !filtered?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No content found</TableCell></TableRow>
              ) : (
                filtered.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-[180px] truncate">{item.title || "Untitled"}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{item.status || "—"}</Badge></TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{item.user_id?.slice(0, 8)}...</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "—"}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewItem(item)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this content permanently?")) deleteMut.mutate(item.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title || "Content Details"}</DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">
            {JSON.stringify(viewItem, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
