import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { DollarSign, Users, CreditCard, Tag, Plus, Unlock } from "lucide-react";
import AdminApiService from "@/services/adminApi";

const PRO_MONTHLY_PRICE = 9.75;

type PlanFilter = "all" | "free" | "project_unlock" | "pro";

// Generate dummy data
const generateDummyPayments = () => [
  { id: "pay1", user_id: "user1", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay2", user_id: "user1", amount: 99.00, payment_type: "project_unlock", status: "success", created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay3", user_id: "user3", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay4", user_id: "user4", amount: 29.99, payment_type: "subscription", status: "success", created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "pay5", user_id: "user2", amount: 99.00, payment_type: "project_unlock", status: "failed", created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateDummyCoupons = () => [
  { id: "coup1", code: "WELCOME20", discount_percent: 20, discount_amount: 0, expiry_date: "2024-12-31", usage_limit: 100, active: true, created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "coup2", code: "STARTUP10", discount_percent: 10, discount_amount: 0, expiry_date: "2024-11-30", usage_limit: 50, active: true, created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "coup3", code: "EARLYBIRD", discount_percent: 15, discount_amount: 0, expiry_date: "2024-10-31", usage_limit: 25, active: false, created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateDummyProfiles = () => [
  { id: "user1", email: "john@example.com", plan_type: "pro", subscription_plan: "pro", subscription_status: "active" },
  { id: "user2", email: "jane@example.com", plan_type: "free", subscription_plan: "free", subscription_status: null },
  { id: "user3", email: "bob@example.com", plan_type: "project_unlock", subscription_plan: "free", subscription_status: null },
  { id: "user4", email: "alice@example.com", plan_type: "pro", subscription_plan: "pro", subscription_status: "active" },
];

export default function AdminBillingPage() {
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_percent: "", expiry_date: "", usage_limit: "" });
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [unlockDialog, setUnlockDialog] = useState(false);
  const [unlockEmail, setUnlockEmail] = useState("");
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [payments, setPayments] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30d");

  useEffect(() => {
    loadBillingData();
  }, [timeRange]);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [overviewResponse, transactionsResponse] = await Promise.all([
        AdminApiService.getBillingOverview(timeRange),
        AdminApiService.getBillingTransactions()
      ]);

      if (overviewResponse.success) {
        // Overview data includes revenue, subscriptions, etc.
        // We'll use this for the overview metrics
      }

      if (transactionsResponse.success) {
        setPayments(transactionsResponse.data.transactions);
      }

      if (!overviewResponse.success || !transactionsResponse.success) {
        toast.error("Failed to load billing data");
      }
    } catch (error) {
      toast.error("Error loading billing data");
    } finally {
      setIsLoading(false);
    }
  };

  const successPayments = payments?.filter((p) => p.status === "success") || [];
  const totalRevenue = successPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const proUsers = (profiles || []).filter((p) => p.plan_type === "pro" || p.subscription_status === "active");
  const unlockUsers = (profiles || []).filter((p) => p.plan_type === "project_unlock");
  const freeUsers = (profiles || []).filter((p) => (p.plan_type || "free") === "free" && p.subscription_status !== "active");

  const mrr = proUsers.length * PRO_MONTHLY_PRICE;
  const projectPurchases = successPayments.filter((p) => p.payment_type === "project_unlock").length;

  const createCoupon = async () => {
    if (!newCoupon.code) return;
    const percent = parseFloat(newCoupon.discount_percent) || 0;
    
    const coupon = {
      id: `coup${Date.now()}`,
      code: newCoupon.code.toUpperCase(),
      discount_percent: percent,
      discount_amount: 0,
      expiry_date: newCoupon.expiry_date || null,
      usage_limit: parseInt(newCoupon.usage_limit) || 0,
      active: true,
      created_at: new Date().toISOString(),
    };
    
    setCoupons(prev => [coupon, ...prev]);
    toast.success("Coupon created");
    setNewCoupon({ code: "", discount_percent: "", expiry_date: "", usage_limit: "" });
    setShowCouponForm(false);
  };

  const toggleCoupon = async (id: string, active: boolean) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
    toast.success(active ? "Coupon disabled" : "Coupon enabled");
  };

  const grantSubscription = async (email: string) => {
    const user = profiles?.find((p) => p.email === email);
    if (!user) {
      toast.error("User not found");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await AdminApiService.grantSubscriptionAccess(user.id, "pro", 30, "Admin granted Pro subscription");
      if (response.success) {
        setProfiles(prev => prev.map(p => p.id === user.id ? { ...p, ...response.data } : p));
        toast.success('Subscription granted to ' + email);
        setUnlockDialog(false);
        setUnlockEmail("");
      } else {
        toast.error(response.error || "Failed to grant subscription");
      }
    } catch (error) {
      toast.error("Error granting subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const planLabel = (p: any) => {
    const pt = p.plan_type || (p.subscription_status === "active" ? "pro" : "free");
    if (pt === "project_unlock") return "Project Unlock";
    if (pt === "pro") return "Pro";
    return "Free";
  };

  const filteredProfiles = (profiles || []).filter((p) => {
    const pt = p.plan_type || (p.subscription_status === "active" ? "pro" : "free");
    if (planFilter === "all") return true;
    return pt === planFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Subscriptions</h1>
          <p className="text-muted-foreground text-sm">Revenue tracking, subscriptions, and coupon management</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setUnlockDialog(true)}>
          <Unlock className="h-4 w-4 mr-1" /> Grant Access
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold text-accent">${mrr.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">MRR</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{proUsers.length}</p>
            <p className="text-xs text-muted-foreground">Pro Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <CreditCard className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{projectPurchases}</p>
            <p className="text-xs text-muted-foreground">Project Purchases</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payment Logs</TabsTrigger>
          <TabsTrigger value="subscriptions">Users & Plans</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.slice(0, 50).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="capitalize">{p.payment_type?.replace("_", " ")}</TableCell>
                      <TableCell>${Number(p.amount || 0).toFixed(2)}</TableCell>
                      <TableCell>{"—"}</TableCell>
                      <TableCell>
                        <Badge variant={p.status === "success" ? "default" : "secondary"}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{"—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {(!payments || payments.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No payments yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Plan Filters</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2 mb-4">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "free", label: `Free (${freeUsers.length})` },
                    { key: "project_unlock", label: `Project Unlock (${unlockUsers.length})` },
                    { key: "pro", label: `Pro (${proUsers.length})` },
                  ] as const
                ).map((t) => (
                  <Button
                    key={t.key}
                    variant={planFilter === t.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPlanFilter(t.key)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.slice(0, 200).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>
                        <Badge variant={planLabel(p) === "Pro" ? "default" : "outline"}>{planLabel(p)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={p.subscription_status === "active" ? "default" : "secondary"}>
                          {p.subscription_status === "active" ? "Active" : "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                        No users match this filter
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="mt-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Tag className="h-4 w-4" /> Coupon Manager
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowCouponForm(!showCouponForm)}>
                <Plus className="h-3 w-3 mr-1" /> New
              </Button>
            </CardHeader>
            <CardContent>
              {showCouponForm && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4 p-3 border border-border rounded-lg">
                  <Input placeholder="Code" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} />
                  <Input
                    placeholder="Discount (%)"
                    type="number"
                    min="1"
                    max="100"
                    value={newCoupon.discount_percent}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: e.target.value })}
                  />
                  <Input placeholder="Expiry date" type="date" value={newCoupon.expiry_date} onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })} />
                  <Input placeholder="Limit (0=∞)" type="number" value={newCoupon.usage_limit} onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })} />
                  <Button onClick={createCoupon} size="sm">
                    Create
                  </Button>
                </div>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Limit</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons?.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                      <TableCell>
                        {Number(c.discount_percent) > 0 ? `${Number(c.discount_percent)}%` : `$${Number(c.discount_amount).toFixed(2)}`}
                      </TableCell>
                      <TableCell>{0} / {c.usage_limit || "∞"}</TableCell>
                      <TableCell>{c.usage_limit || "∞"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={c.active ? "default" : "secondary"}>{c.active ? "Active" : "Disabled"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => toggleCoupon(c.id, c.active)} className="text-xs">
                          {c.active ? "Disable" : "Enable"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!coupons || coupons.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No coupons
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Grant Access Dialog */}
      <Dialog open={unlockDialog} onOpenChange={setUnlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Subscription Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Enter the user's email to manually grant Pro subscription access.</p>
            <Input placeholder="user@example.com" value={unlockEmail} onChange={(e) => setUnlockEmail(e.target.value)} />
            <Button onClick={() => grantSubscription(unlockEmail)} disabled={!unlockEmail || isLoading}>
              Grant Pro Access
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
