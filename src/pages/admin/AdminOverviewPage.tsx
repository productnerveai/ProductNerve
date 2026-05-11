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
import AdminApiService from "@/services/adminApi";
import { toast } from "sonner";

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


export default function AdminOverviewPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [platformData, setPlatformData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [growthData, setGrowthData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [platformResponse, productResponse, growthResponse] = await Promise.all([
          AdminApiService.getPlatformAnalytics(range),
          AdminApiService.getProductAnalytics(range),
          AdminApiService.getGrowthAnalytics(range)
        ]);

        if (platformResponse.success && productResponse.success) {
          setPlatformData(platformResponse.data);
          setProductData(productResponse.data);
          setGrowthData(growthResponse.data);

          // Debug: Log the actual data structure
          console.log('Platform Data:', platformResponse.data);
          console.log('WAU:', platformResponse.data?.users?.wau);
          console.log('MAU:', platformResponse.data?.users?.mau);
          console.log('Conversions:', platformResponse.data?.conversions?.paid);
          console.log('Revenue:', platformResponse.data?.revenue?.total);
        } else {
          toast.error("Failed to load analytics data");
        }
      } catch (error) {
        toast.error("Error loading analytics data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [range]);

  const metricCards = [
    { label: "Total Users", value: platformData?.users?.total ?? "—", icon: Users },
    { label: "Active (24h)", value: platformData?.users?.active ?? "—", icon: Activity },
    { label: "WAU", value: platformData?.users?.wau ?? "—", icon: Activity },
    { label: "MAU", value: platformData?.users?.mau ?? "—", icon: Activity },
    { label: "Total Workspaces", value: platformData?.workspaces?.total ?? "—", icon: Layers },
    { label: "Total Projects", value: platformData?.projects?.total ?? "—", icon: FolderKanban },
    { label: "Active Projects", value: platformData?.projects?.active ?? "—", icon: FolderKanban },
    { label: "Completed", value: platformData?.projects?.completed ?? "—", icon: FolderKanban },
    { label: "Paid Conversions", value: platformData?.conversions?.paid != null ? platformData.conversions.paid : "—", icon: TrendingUp },
    { label: "Total Revenue", value: platformData?.revenue?.total != null ? `$${platformData.revenue.total.toFixed(2)}` : "—", icon: DollarSign },
    { label: "Avg Venture Score", value: productData?.averageScore ? productData.averageScore.toFixed(1) : "—", icon: TrendingUp },
    { label: "High Risk", value: productData?.riskDistribution?.high ?? "—", icon: AlertTriangle },
    { label: "Medium Risk", value: productData?.riskDistribution?.medium ?? "—", icon: AlertTriangle },
    { label: "Low Risk", value: productData?.riskDistribution?.low ?? "—", icon: AlertTriangle },
  ];

  const fillDateGaps = (data: { date: string; signups: number }[], days: number) => {
    const filled = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split("T")[0];
      const found = data.find(item => item.date === dateStr);
      filled.push({ date: dateStr, signups: found?.signups ?? 0 });
    }
    return filled;
  };

  // use in chart:
  const growthDays = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const filledGrowth = fillDateGaps(platformData?.users?.growth || [], growthDays);

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
                <LineChart data={filledGrowth}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="signups" stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary }} />
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
                <LineChart data={platformData?.projects?.activity || []}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="created" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 2 }} name="Created" />
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
                  <Pie data={productData?.classifications || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {productData?.classifications?.map((entry, i) => (
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
                  <Pie data={productData?.scoreDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {productData?.scoreDistribution?.map((entry, i) => (
                      <Cell key={i} fill={entry._id === 0 ? "#dc2626" : entry._id === 50 ? "#f97316" : "#22c55e"} />
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
                <BarChart data={productData?.phaseFunnel || []} layout="vertical" margin={{ left: 60 }}>
                  <XAxis type="number" tick={{ fontSize: 9 }} />
                  <YAxis type="category" dataKey="phase" tick={{ fontSize: 10 }} width={60} />
                  <Tooltip />
                  <Bar dataKey="completed" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
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
              <p className="text-sm font-semibold">12 Open Tickets</p>
              <p className="text-xs text-muted-foreground">Support inquiries pending</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-accent/30">
          <CardContent className="py-3 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">5 KYC Pending</p>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
