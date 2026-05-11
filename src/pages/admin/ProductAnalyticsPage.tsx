import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie, Legend
} from "recharts";
import AdminApiService from "@/services/adminApi";
import { toast } from "sonner";

type TimeRange = "7d" | "30d" | "90d" | "all";
const COLORS = ["hsl(182,72%,20%)", "hsl(23,80%,52%)", "hsl(182,30%,60%)", "hsl(0,72%,51%)", "hsl(182,50%,45%)"];

export default function ProductAnalyticsPage() {
  const [range, setRange] = useState<TimeRange>("30d");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await AdminApiService.getProductAnalytics(range);
        if (response.success) {
          setData(response.data);
        } else {
          toast.error("Failed to load product analytics");
        }
      } catch (error) {
        toast.error("Error loading product analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
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

      {/* Phase Status Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Phase Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 pr-4">Phase</th>
                  <th className="text-center py-2 px-3">Not Started</th>
                  <th className="text-center py-2 px-3">In Progress</th>
                  <th className="text-center py-2 px-3">Complete</th>
                  <th className="text-center py-2 px-3">Locked</th>
                </tr>
              </thead>
              <tbody>
                {['phase1', 'phase2', 'phase3'].map((phase, i) => (
                  <tr key={phase} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">Phase {i + 1}</td>
                    <td className="text-center py-2 px-3 text-muted-foreground">
                      {data?.phaseStatusBreakdown?.[phase]?.not_started ?? 0}
                    </td>
                    <td className="text-center py-2 px-3 text-blue-500 font-medium">
                      {data?.phaseStatusBreakdown?.[phase]?.in_progress ?? 0}
                    </td>
                    <td className="text-center py-2 px-3 text-green-500 font-medium">
                      {data?.phaseStatusBreakdown?.[phase]?.complete ?? 0}
                    </td>
                    <td className="text-center py-2 px-3 text-orange-500 font-medium">
                      {data?.phaseStatusBreakdown?.[phase]?.locked ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
