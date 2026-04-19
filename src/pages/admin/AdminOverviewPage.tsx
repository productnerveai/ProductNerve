import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, FolderKanban, TrendingUp, Activity, DollarSign, ShieldCheck,
  MessageSquare, AlertTriangle, Layers, UserPlus, Eye, CreditCard
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, FunnelChart, Legend
} from "recharts";

type TimeRange = "7d" | "30d" | "90d" | "all";

const COLORS = {
  primary: "hsl(182,72%,20%)",
  secondary: "hsl(23,80%,52%)",
  tertiary: "hsl(182,30%,60%)",
  danger: "hsl(0,72%,51%)",
  muted: "hsl(182,20%,75%)",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  "Venture-grade": COLORS.primary,
  "Structurally sound": "hsl(182,50%,35%)",
  "Repairable": COLORS.secondary,
  "High risk": COLORS.danger,
  "Not ready": COLORS.muted,
  "pending": "hsl(0,0%,70%)",
};

// Generate dummy data based on time range
const generateDummyStats = (range: TimeRange) => {
  const now = new Date();
  const rangeMs = range === "7d" ? 7 * 86400000 : range === "30d" ? 30 * 86400000 : range === "90d" ? 90 * 86400000 : Infinity;
  const rangeStart = rangeMs === Infinity ? new Date(0) : new Date(now.getTime() - rangeMs);
  
  // Base numbers that scale with time range
  const baseMultiplier = range === "7d" ? 1 : range === "30d" ? 4 : range === "90d" ? 12 : 24;
  
  const totalUsers = 245 * baseMultiplier;
  const activeUsers24h = Math.floor(totalUsers * 0.15);
  const wau = Math.floor(totalUsers * 0.4);
  const mau = Math.floor(totalUsers * 0.7);
  const activeUsers = Math.floor(totalUsers * 0.8);
  
  const totalWorkspaces = 89 * baseMultiplier;
  const totalProjects = 156 * baseMultiplier;
  const activeProjects = Math.floor(totalProjects * 0.6);
  const completedProjects = Math.floor(totalProjects * 0.25);
  
  const paidConversions = 42 * baseMultiplier;
  const subRevenue = 12580 * baseMultiplier;
  const totalRevenue = 18950 * baseMultiplier;
  const avgScore = 72.3;
  
  const highRisk = Math.floor(totalProjects * 0.15);
  const medRisk = Math.floor(totalProjects * 0.35);
  const lowRisk = Math.floor(totalProjects * 0.5);
  
  // Generate user growth chart data
  const daysInRange = Math.min(range === "all" ? 365 : Math.floor(rangeMs / 86400000), 365);
  const userGrowthChart = Array.from({ length: Math.min(daysInRange, 30) }, (_, i) => {
    const date = new Date(rangeStart.getTime() + (i * rangeMs / Math.min(daysInRange, 30)));
    return {
      date: date.toISOString().slice(5),
      signups: Math.floor(Math.random() * 15) + 3,
    };
  });
  
  // Generate project activity chart data
  const projectActivityChart = Array.from({ length: Math.min(daysInRange, 30) }, (_, i) => {
    const date = new Date(rangeStart.getTime() + (i * rangeMs / Math.min(daysInRange, 30)));
    return {
      date: date.toISOString().slice(5),
      created: Math.floor(Math.random() * 8) + 1,
      completed: Math.floor(Math.random() * 3),
    };
  });
  
  // Classification distribution
  const classificationChart = [
    { name: "Venture-grade", value: 45, fill: CLASSIFICATION_COLORS["Venture-grade"] },
    { name: "Structurally sound", value: 38, fill: CLASSIFICATION_COLORS["Structurally sound"] },
    { name: "Repairable", value: 28, fill: CLASSIFICATION_COLORS["Repairable"] },
    { name: "High risk", value: 15, fill: CLASSIFICATION_COLORS["High risk"] },
    { name: "Not ready", value: 12, fill: CLASSIFICATION_COLORS["Not ready"] },
    { name: "pending", value: 8, fill: CLASSIFICATION_COLORS["pending"] },
  ];
  
  // Risk distribution
  const riskChart = [
    { name: "High Risk", value: highRisk, fill: COLORS.danger },
    { name: "Medium Risk", value: medRisk, fill: COLORS.secondary },
    { name: "Low Risk", value: lowRisk, fill: COLORS.primary },
  ].filter(r => r.value > 0);
  
  // Phase completion funnel
  const p1Done = Math.floor(totalProjects * 0.8);
  const p2Done = Math.floor(totalProjects * 0.6);
  const p3Done = Math.floor(totalProjects * 0.4);
  const unlocked = Math.floor(totalProjects * 0.35);
  
  const funnelData = [
    { stage: "Signup", value: totalUsers },
    { stage: "Workspace", value: totalWorkspaces },
    { stage: "Project", value: totalProjects },
    { stage: "Phase 1", value: p1Done },
    { stage: "Phase 2", value: p2Done },
    { stage: "Phase 3", value: p3Done },
    { stage: "Unlocked", value: unlocked },
  ];
  
  return {
    totalUsers, activeUsers24h, wau, mau, activeUsers,
    totalWorkspaces, totalProjects, activeProjects, completedProjects,
    paidConversions, subRevenue, totalRevenue, avgScore,
    highRisk, medRisk, lowRisk,
    userGrowthChart, projectActivityChart, classificationChart, riskChart, funnelData,
    openTickets: 12,
    kycPending: 5,
  };
};

export default function AdminOverviewPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [stats, setStats] = useState(generateDummyStats(range));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // Simulate API loading delay
    const timer = setTimeout(() => {
      setStats(generateDummyStats(range));
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [range]);

  const s = stats;

  const metricCards = [
    { label: "Total Users", value: s?.totalUsers ?? "—", icon: Users },
    { label: "Active (24h)", value: s?.activeUsers24h ?? "—", icon: Activity },
    { label: "WAU", value: s?.wau ?? "—", icon: UserPlus },
    { label: "MAU", value: s?.mau ?? "—", icon: UserPlus },
    { label: "Total Workspaces", value: s?.totalWorkspaces ?? "—", icon: Layers },
    { label: "Total Projects", value: s?.totalProjects ?? "—", icon: FolderKanban },
    { label: "Active Projects", value: s?.activeProjects ?? "—", icon: FolderKanban },
    { label: "Completed", value: s?.completedProjects ?? "—", icon: FolderKanban },
    { label: "Paid Conversions", value: s?.paidConversions ?? "—", icon: CreditCard },
    { label: "Total Revenue", value: s ? `$${s.totalRevenue.toFixed(2)}` : "—", icon: DollarSign },
    { label: "Avg Venture Score", value: s ? s.avgScore.toFixed(1) : "—", icon: TrendingUp },
    { label: "High Risk", value: s?.highRisk ?? "—", icon: AlertTriangle },
    { label: "Medium Risk", value: s?.medRisk ?? "—", icon: AlertTriangle },
    { label: "Low Risk", value: s?.lowRisk ?? "—", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Intelligence Dashboard</h1>
          <p className="text-muted-foreground text-sm">Platform operations intelligence</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map(r => (
            <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)} className="text-xs h-7 px-2">
              {r === "all" ? "All" : r}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map(m => (
          <Card key={m.label} className="bg-card/80">
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-1.5 mb-1">
                <m.icon className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground leading-none">{m.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: User Growth + Project Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s?.userGrowthChart || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Project Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={s?.projectActivityChart || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 2 }} name="Created" />
                  <Line type="monotone" dataKey="completed" stroke={COLORS.secondary} strokeWidth={2} dot={{ r: 2 }} name="Completed" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: Pies + Funnel */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Venture Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={s?.classificationChart || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {s?.classificationChart?.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={s?.riskChart || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {s?.riskChart?.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Phase Completion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={s?.funnelData || []} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="stage" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick alerts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-accent/30">
          <CardContent className="py-3 flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">{s?.openTickets ?? 0} Open Tickets</p>
              <p className="text-xs text-muted-foreground">Support inquiries pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/30">
          <CardContent className="py-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">{s?.kycPending ?? 0} KYC Pending</p>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
