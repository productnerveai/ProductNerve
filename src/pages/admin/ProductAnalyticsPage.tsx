import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, Legend
} from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "all";
const COLORS = ["hsl(182,72%,20%)", "hsl(23,80%,52%)", "hsl(182,30%,60%)", "hsl(0,72%,51%)", "hsl(182,50%,45%)"];

// Generate dummy analytics data based on time range
const generateDummyAnalytics = (range: TimeRange) => {
  const baseMultiplier = range === "7d" ? 1 : range === "30d" ? 4 : range === "90d" ? 12 : 24;
  
  const totalUsers = 245 * baseMultiplier;
  const dau = Math.floor(totalUsers * 0.15);
  const wau = Math.floor(totalUsers * 0.4);
  const mau = Math.floor(totalUsers * 0.7);
  
  const totalProjects = 156 * baseMultiplier;
  const completed = Math.floor(totalProjects * 0.25);
  const abandoned = Math.floor(totalProjects * 0.1);
  const unlocked = Math.floor(totalProjects * 0.35);
  const locked = totalProjects - unlocked;
  
  // Generate project chart data
  const daysInRange = Math.min(range === "all" ? 365 : Math.floor((range === "7d" ? 7 : range === "30d" ? 30 : 90)), 30);
  const projectChart = Array.from({ length: daysInRange }, (_, i) => ({
    date: new Date(Date.now() - (daysInRange - i) * 86400000).toISOString().slice(5),
    projects: Math.floor(Math.random() * 8) + 2,
  }));
  
  const p1Done = Math.floor(totalProjects * 0.8);
  const p2Done = Math.floor(totalProjects * 0.6);
  const p3Done = Math.floor(totalProjects * 0.4);
  
  const phaseRates = [
    { phase: "Phase 1", rate: Math.round((p1Done / totalProjects) * 100) },
    { phase: "Phase 2", rate: Math.round((p2Done / totalProjects) * 100) },
    { phase: "Phase 3", rate: Math.round((p3Done / totalProjects) * 100) },
  ];
  
  const executionModeChart = [
    { name: "AI Development", value: 45, fill: COLORS[0] },
    { name: "Lean Development", value: 32, fill: COLORS[1] },
    { name: "Standard Build", value: 28, fill: COLORS[2] },
    { name: "Full Team", value: 15, fill: COLORS[3] },
  ];
  
  const toolUsageChart = [
    { name: "icp-report", count: 234 },
    { name: "prd-report", count: 189 },
    { name: "growth-report", count: 156 },
    { name: "roadmap-report", count: 134 },
    { name: "experiment-report", count: 98 },
    { name: "phase1-scoring", count: 87 },
    { name: "phase2-scoring", count: 76 },
    { name: "phase3-scoring", count: 65 },
  ];
  
  const paywallViews = p3Done;
  const projectUnlocks = unlocked;
  const subscriptions = 42 * baseMultiplier;
  const conversionRate = paywallViews > 0 ? Math.round((unlocked / paywallViews) * 100) : 0;
  
  const funnel = [
    { stage: "Signed Up", value: totalUsers, fill: COLORS[0] },
    { stage: "Workspace", value: Math.floor(totalUsers * 0.8), fill: COLORS[0] },
    { stage: "Project", value: totalProjects, fill: COLORS[0] },
    { stage: "Phase 1", value: p1Done, fill: COLORS[1] },
    { stage: "Phase 2", value: p2Done, fill: COLORS[1] },
    { stage: "Phase 3", value: p3Done, fill: COLORS[1] },
    { stage: "Unlocked", value: unlocked, fill: COLORS[3] },
  ];
  
  const dropoffs = [
    { phase: "P1→P2", rate: p1Done > 0 ? Math.round(((p1Done - p2Done) / p1Done) * 100) : 25 },
    { phase: "P2→P3", rate: p2Done > 0 ? Math.round(((p2Done - p3Done) / p2Done) * 100) : 33 },
  ];
  
  return { 
    dau, wau, mau, totalProjects, completed, abandoned, unlocked, locked, 
    projectChart, phaseRates, executionModeChart, toolUsageChart, 
    paywallViews, conversionRate, projectUnlocks, subscriptions, funnel, dropoffs 
  };
};

export default function ProductAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [data, setData] = useState(generateDummyAnalytics(range));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setData(generateDummyAnalytics(range));
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Analytics</h1>
          <p className="text-muted-foreground text-sm">Platform usage, phase completion, tool usage & conversion</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map(r => (
            <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)} className="text-xs h-7 px-2">{r === "all" ? "All" : r}</Button>
          ))}
        </div>
      </div>

      {/* KPIs — now 7 metrics including Locked */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "DAU", value: data?.dau ?? 0 },
          { label: "WAU", value: data?.wau ?? 0 },
          { label: "MAU", value: data?.mau ?? 0 },
          { label: "Completed", value: data?.completed ?? 0 },
          { label: "Abandoned", value: data?.abandoned ?? 0 },
          { label: "Unlocked", value: data?.unlocked ?? 0 },
          { label: "Locked", value: data?.locked ?? 0 },
        ].map(m => (
          <Card key={m.label}><CardContent className="py-3 px-3"><p className="text-[10px] text-muted-foreground">{m.label}</p><p className="text-lg font-bold text-foreground">{m.value}</p></CardContent></Card>
        ))}
      </div>

      {/* Projects + Phase Rates */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Project Creation</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.projectChart || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip /><Bar dataKey="projects" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Phase Completion Rates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {data?.phaseRates?.map(p => (
                <div key={p.phase} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{p.phase}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${p.rate}%` }} /></div>
                  <span className="text-sm font-bold w-10 text-right">{p.rate}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution Mode + Conversion + Drop-off */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Execution Mode Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.executionModeChart || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2}>
                    {data?.executionModeChart?.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Conversion Analytics</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {[{ label: "Paywall Views", value: data?.paywallViews ?? 0 }, { label: "Conversion Rate", value: `${data?.conversionRate ?? 0}%` }, { label: "Project Unlocks", value: data?.projectUnlocks ?? 0 }, { label: "Subscriptions", value: data?.subscriptions ?? 0 }].map(m => (
                <div key={m.label} className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{m.label}</span><span className="text-sm font-bold">{m.value}</span></div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Phase Drop-off</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4 pt-2">
              {data?.dropoffs?.map(d => (
                <div key={d.phase} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-16">{d.phase}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden"><div className="h-full bg-accent rounded-full" style={{ width: `${d.rate}%` }} /></div>
                  <span className="text-sm font-bold w-10 text-right">{d.rate}%</span>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Drop-off between phases</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Usage + Funnel */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Tool Usage (AI Functions)</CardTitle></CardHeader>
          <CardContent>
            {(!data?.toolUsageChart || data.toolUsageChart.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">No tool usage data yet</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.toolUsageChart} layout="vertical" margin={{ left: 120 }}>
                    <XAxis type="number" tick={{ fontSize: 9 }} /><YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip /><Bar dataKey="count" fill={COLORS[1]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">User Funnel</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.funnel || []} layout="vertical" margin={{ left: 80 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} /><YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{data?.funnel?.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
