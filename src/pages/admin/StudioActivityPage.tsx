import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, FlaskConical, TrendingUp, Map, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import AdminApiService from "@/services/adminApi";
import { toast } from "sonner";

interface ActivityItem {
  id: string;
  user_id: string;
  tool: string;
  title: string;
  created_at: string;
  workspace_id?: string;
}

const TOOL_ICONS: Record<string, any> = {
  "ICP Builder": Target,
  "Experiment Engine": FlaskConical,
  "Growth Engine": TrendingUp,
  "Roadmap Generator": Map,
  "User Story Generator": BookOpen,
  "PRD Generator": FileText,
};

export default function StudioActivityPage() {
  const [toolFilter, setToolFilter] = useState("all");

  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin-studio-activity"],
    queryFn: async () => {
      const response = await AdminApiService.getStudioActivity();
      if (response.success) {
        return response.data.activities || [];
      }
      throw new Error("Failed to load studio activity");
    },
  });

  const filtered = activities?.filter((a) => toolFilter === "all" || a.tool === toolFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Studio Activity Feed</h1>
          <p className="text-muted-foreground text-sm">Real-time view of all studio tool activity across the platform.</p>
        </div>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by tool" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tools</SelectItem>
            <SelectItem value="ICP Builder">ICP Builder</SelectItem>
            <SelectItem value="Experiment Engine">Experiment Engine</SelectItem>
            <SelectItem value="Growth Engine">Growth Engine</SelectItem>
            <SelectItem value="Roadmap Generator">Roadmap Generator</SelectItem>
            <SelectItem value="User Story Generator">User Story Generator</SelectItem>
            <SelectItem value="PRD Generator">PRD Generator</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-border">
          {isLoading ? (
            <p className="text-center text-muted-foreground py-12">Loading activity...</p>
          ) : !filtered?.length ? (
            <p className="text-center text-muted-foreground py-12">No activity yet</p>
          ) : (
            filtered.map((item) => {
              const Icon = TOOL_ICONS[item.tool] || FileText;
              return (
                <div key={`${item.tool}-${item.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      <span className="font-medium">{item.title || "Untitled"}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      User: <span className="font-mono">{item.user_id.slice(0, 8)}...</span>
                      {item.workspace_id && <> · WS: <span className="font-mono">{item.workspace_id.slice(0, 8)}...</span></>}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">{item.tool}</Badge>
                  <span className="text-[11px] text-muted-foreground shrink-0">{format(new Date(item.created_at), "MMM d, HH:mm")}</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
