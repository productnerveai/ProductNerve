import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, Activity, AlertTriangle, Zap } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const FUNC_LABELS: Record<string, string> = {
  "prd-report": "PRD Generator",
  "user-story-report": "User Story Generator",
  "icp-report": "ICP Builder",
  "experiment-report": "Experiment Engine",
  "growth-report": "Growth Engine",
  "roadmap-report": "Roadmap Generator",
  "phase1-score": "Phase 1 Scoring",
  "phase2-score": "Phase 2 Scoring",
  "phase3-score": "Phase 3 Scoring",
  "phase1-intake": "Phase 1 Intake",
  "phase2-intake": "Phase 2 Intake",
  "phase3-intake": "Phase 3 Intake",
};
const COLORS = ["#0F555A", "#E77023", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f43f5e"];

export default function StudioAIMonitoringPage() {
  const { data: aiLogs } = useQuery({
    queryKey: ["admin-ai-logs-all"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_usage_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      return data ?? [];
    },
  });

  const totalRequests = aiLogs?.length ?? 0;

  // Group by function
  const byFunction: Record<string, number> = {};
  aiLogs?.forEach((log) => {
    const fn = log.function_name;
    byFunction[fn] = (byFunction[fn] || 0) + 1;
  });

  const barData = Object.entries(byFunction)
    .map(([key, value]) => ({ name: FUNC_LABELS[key] || key, value }))
    .sort((a, b) => b.value - a.value);

  const studioFunctions = ["prd-report", "user-story-report", "icp-report", "experiment-report", "growth-report", "roadmap-report"];
  const studioRequests = aiLogs?.filter((l) => studioFunctions.includes(l.function_name)).length ?? 0;
  const phaseRequests = totalRequests - studioRequests;

  const pieData = [
    { name: "Studio Tools", value: studioRequests },
    { name: "Phase Engines", value: phaseRequests },
  ];

  const stats = [
    { label: "Total AI Requests", value: totalRequests, icon: Cpu },
    { label: "Studio Tool Requests", value: studioRequests, icon: Zap },
    { label: "Phase Engine Requests", value: phaseRequests, icon: Activity },
    { label: "Unique Functions", value: Object.keys(byFunction).length, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Processing Monitoring</h1>
        <p className="text-muted-foreground text-sm">Track AI request volumes, function usage, and system health.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Requests by Function</CardTitle>
            <CardDescription>Volume of requests per AI endpoint</CardDescription>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical" margin={{ left: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0F555A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">No AI usage data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Studio vs Phase Requests</CardTitle>
            <CardDescription>Distribution between tool types</CardDescription>
          </CardHeader>
          <CardContent>
            {totalRequests > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#0F555A" />
                    <Cell fill="#E77023" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent AI Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Function</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">User ID</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {aiLogs?.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="p-3">{FUNC_LABELS[log.function_name] || log.function_name}</td>
                    <td className="p-3 font-mono text-xs text-muted-foreground">{log.user_id.slice(0, 8)}...</td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
