import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { Badge } from "@/components/ui/badge";
import AdminApiService from "@/services/adminApi";
import { toast } from "sonner";

export default function GrowthAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await AdminApiService.getGrowthAnalytics();
        if (response.success) {
          setData(response.data);
        } else {
          toast.error("Failed to load growth analytics");
        }
      } catch (error) {
        toast.error("Error loading growth analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Growth & Marketing Analytics</h1>
        <p className="text-muted-foreground text-sm">Acquisition, conversion, and revenue performance</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "New Users (30d)", value: data?.newUsers30d ?? 0 },
          { label: "Active Subs", value: data?.activeSubs ?? 0 },
          { label: "Paywall Conversion", value: `${data?.paywallConversion ?? 0}%` },
          { label: "Total Revenue", value: `$${(data?.totalRevenue ?? 0).toFixed(2)}` },
          { label: "Total Users", value: data?.totalUsers ?? 0 },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.revenueChart || []}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(23,80%,52%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Customer Acquisition Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.acquisitionChart || []}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="users" fill="hsl(182,72%,20%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.conversionFunnel || []} layout="vertical" margin={{ left: 120 }}>
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="stage" tick={{ fontSize: 11 }} width={120} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data?.conversionFunnel?.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Performance */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Coupon Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {(!data?.couponData || data.couponData.length === 0) ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No coupons created yet</p>
          ) : (
            <div className="space-y-2">
              {data.couponData.map(c => (
                <div key={c.code} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="font-mono font-semibold text-sm">{c.code}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{c.used} uses</span>
                    <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
