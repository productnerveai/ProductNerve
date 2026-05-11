import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { Globe, Monitor, Smartphone, Eye, Clock, MousePointer, ArrowUpDown } from "lucide-react";
import AdminApiService from "@/services/adminApi";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "all";
const COLORS = ["hsl(182,72%,20%)", "hsl(23,80%,52%)", "hsl(182,30%,60%)", "hsl(0,72%,51%)", "hsl(182,50%,45%)"];

export default function PlatformAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await AdminApiService.getPlatformAnalytics(range);
        if (response.success) {
          setAnalytics(response.data);
        } else {
          toast.error("Failed to load platform analytics");
        }
      } catch (error) {
        toast.error("Error loading platform analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  const traffic = analytics || {
    totalVisitors: 0, uniqueVisitors: 0, totalPageViews: 0, sessions: 0,
    avgDuration: "0s", bounceRate: "0%", pagesPerSession: "0",
    visitorTrend: [], trafficSources: [], topPages: [], deviceBreakdown: [], geography: [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-muted-foreground text-sm">Website traffic & visitor engagement — powered by first-party data</p>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map(r => (
            <Button key={r} variant={range === r ? "default" : "outline"} size="sm" onClick={() => setRange(r)} className="text-xs h-7 px-2">{r === "all" ? "All" : r}</Button>
          ))}
        </div>
      </div>

      {/* Traffic KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "Total Visitors", value: (traffic.totalVisitors || 0).toLocaleString(), icon: Eye },
          { label: "Unique Visitors", value: (traffic.uniqueVisitors || 0).toLocaleString(), icon: Globe },
          { label: "Page Views", value: (traffic.totalPageViews || 0).toLocaleString(), icon: MousePointer },
          { label: "Sessions", value: (traffic.sessions || 0).toLocaleString(), icon: ArrowUpDown },
          { label: "Avg Duration", value: traffic.avgDuration, icon: Clock },
          { label: "Bounce Rate", value: traffic.bounceRate, icon: ArrowUpDown },
          { label: "Pages/Session", value: traffic.pagesPerSession, icon: Monitor },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="py-3 px-3">
              <div className="flex items-center gap-1.5 mb-1"><m.icon className="h-3 w-3 text-muted-foreground" /><p className="text-[10px] text-muted-foreground">{m.label}</p></div>
              <p className="text-lg font-bold text-foreground">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Visitor Trend + Traffic Sources */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Visitor Trends</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={traffic.visitorTrend}>
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="visitors" stroke={COLORS[0]} strokeWidth={2} dot={false} name="Visitors" />
                  <Line type="monotone" dataKey="pageViews" stroke={COLORS[1]} strokeWidth={1.5} dot={false} name="Page Views" />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Traffic Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={traffic.trafficSources || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {(traffic.trafficSources || []).map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip /><Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Pages + Device */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Top Pages</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow>
                <TableHead>Page</TableHead><TableHead>Views</TableHead><TableHead>Avg Time</TableHead><TableHead>Bounce</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {(traffic.topPages || []).map((p: any, index: number) => (
                  <TableRow key={`page-${index}-${p.page}`}>
                    <TableCell className="font-mono text-sm">{p.page}</TableCell>
                    <TableCell>{(p.views || 0).toLocaleString()}</TableCell>
                    <TableCell>{p.avgTime}</TableCell>
                    <TableCell>{p.bounce}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Devices</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={traffic.deviceBreakdown || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2}>
                    {(traffic.deviceBreakdown || []).map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} /><Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geography */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Visitor Geography</CardTitle></CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={traffic.geography || []} layout="vertical" margin={{ left: 100 }}>
                <XAxis type="number" tick={{ fontSize: 9 }} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 10 }} width={100} />
                <Tooltip /><Bar dataKey="visitors" fill={COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
