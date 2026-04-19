import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { Globe, Monitor, Smartphone, Eye, Clock, MousePointer, ArrowUpDown } from "lucide-react";

type TimeRange = "7d" | "30d" | "90d" | "all";
const COLORS = ["hsl(182,72%,20%)", "hsl(23,80%,52%)", "hsl(182,30%,60%)", "hsl(0,72%,51%)", "hsl(182,50%,45%)"];

// Generate dummy platform analytics data based on time range
const generateDummyPlatformAnalytics = (range: TimeRange) => {
  const baseMultiplier = range === "7d" ? 1 : range === "30d" ? 4 : range === "90d" ? 12 : 24;
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  
  const totalUsers = 245 * baseMultiplier;
  const totalActivity = totalUsers + (156 * baseMultiplier) + (89 * baseMultiplier);
  
  const totalVisitors = Math.max(totalActivity * 3, totalUsers);
  const uniqueVisitors = Math.max(totalActivity * 2, Math.floor(totalUsers * 0.8));
  const totalPageViews = totalVisitors * 2.5;
  const sessions = Math.floor(totalVisitors * 1.2);
  const avgDuration = totalActivity > 10 ? "3m 12s" : "1m 48s";
  const bounceRate = totalActivity > 10 ? "38%" : "52%";
  const pagesPerSession = sessions > 0 ? (totalPageViews / sessions).toFixed(1) : "0";
  
  // Generate visitor trend data
  const visitorTrend: { date: string; visitors: number; pageViews: number }[] = [];
  for (let i = 0; i < days && i < 90; i++) {
    const d = new Date(Date.now() - (days - 1 - i) * 86400000);
    const dailyVisitors = Math.floor(Math.random() * 50) + 10;
    visitorTrend.push({
      date: d.toISOString().slice(5),
      visitors: dailyVisitors,
      pageViews: Math.floor(dailyVisitors * 2.5),
    });
  }
  
  const trafficSources = [
    { name: "Direct", value: Math.floor(uniqueVisitors * 0.40), fill: COLORS[0] },
    { name: "Search", value: Math.floor(uniqueVisitors * 0.25), fill: COLORS[1] },
    { name: "Social", value: Math.floor(uniqueVisitors * 0.18), fill: COLORS[2] },
    { name: "Referral", value: Math.floor(uniqueVisitors * 0.12), fill: COLORS[3] },
    { name: "Campaign", value: Math.floor(uniqueVisitors * 0.05), fill: COLORS[4] },
  ];
  
  const topPages = [
    { page: "/", views: Math.floor(totalPageViews * 0.28), avgTime: "1m 45s", bounce: "38%" },
    { page: "/pricing", views: Math.floor(totalPageViews * 0.16), avgTime: "2m 12s", bounce: "35%" },
    { page: "/app", views: Math.floor(totalPageViews * 0.20), avgTime: "4m 30s", bounce: "15%" },
    { page: "/blog", views: Math.floor(totalPageViews * 0.10), avgTime: "3m 05s", bounce: "44%" },
    { page: "/login", views: Math.floor(totalPageViews * 0.12), avgTime: "0m 55s", bounce: "52%" },
    { page: "/signup", views: Math.floor(totalPageViews * 0.08), avgTime: "1m 30s", bounce: "40%" },
    { page: "/contact", views: Math.floor(totalPageViews * 0.06), avgTime: "2m 20s", bounce: "48%" },
  ];
  
  const deviceBreakdown = [
    { name: "Desktop", value: 62, fill: COLORS[0] },
    { name: "Mobile", value: 30, fill: COLORS[1] },
    { name: "Tablet", value: 8, fill: COLORS[2] },
  ];
  
  const geography = [
    { country: "United States", visitors: Math.floor(uniqueVisitors * 0.22) },
    { country: "Nigeria", visitors: Math.floor(uniqueVisitors * 0.18) },
    { country: "United Kingdom", visitors: Math.floor(uniqueVisitors * 0.12) },
    { country: "India", visitors: Math.floor(uniqueVisitors * 0.09) },
    { country: "Canada", visitors: Math.floor(uniqueVisitors * 0.07) },
    { country: "Germany", visitors: Math.floor(uniqueVisitors * 0.05) },
    { country: "South Africa", visitors: Math.floor(uniqueVisitors * 0.05) },
    { country: "Australia", visitors: Math.floor(uniqueVisitors * 0.04) },
  ];
  
  return {
    totalVisitors: Math.round(totalVisitors),
    uniqueVisitors: Math.round(uniqueVisitors),
    totalPageViews: Math.round(totalPageViews),
    sessions, avgDuration, bounceRate, pagesPerSession,
    visitorTrend, trafficSources, topPages, deviceBreakdown, geography,
  };
};

export default function PlatformAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [analytics, setAnalytics] = useState(generateDummyPlatformAnalytics(range));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setAnalytics(generateDummyPlatformAnalytics(range));
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
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
          { label: "Total Visitors", value: traffic.totalVisitors.toLocaleString(), icon: Eye },
          { label: "Unique Visitors", value: traffic.uniqueVisitors.toLocaleString(), icon: Globe },
          { label: "Page Views", value: traffic.totalPageViews.toLocaleString(), icon: MousePointer },
          { label: "Sessions", value: traffic.sessions.toLocaleString(), icon: ArrowUpDown },
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
                  <Pie data={traffic.trafficSources} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={70} paddingAngle={2}>
                    {traffic.trafficSources.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
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
                {traffic.topPages.map((p: any) => (
                  <TableRow key={p.page}>
                    <TableCell className="font-mono text-sm">{p.page}</TableCell>
                    <TableCell>{p.views.toLocaleString()}</TableCell>
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
                  <Pie data={traffic.deviceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2}>
                    {traffic.deviceBreakdown.map((e: any, i: number) => <Cell key={i} fill={e.fill} />)}
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
              <BarChart data={traffic.geography} layout="vertical" margin={{ left: 100 }}>
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
