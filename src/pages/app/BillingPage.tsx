import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, CheckCircle2, ArrowUpRight, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import PaymentsComingSoonModal from "@/components/billing/PaymentsComingSoonModal";

// Dummy user and billing data
const dummyUser = {
  id: "user123",
  email: "user@example.com"
};

const dummyProfile = {
  plan_type: "free",
  workspace_limit: 1,
  project_limit: 1,
  report_access: false,
  tool_access: false,
  subscription_plan: null,
  subscription_status: null,
  subscription_start: null,
  subscription_end: null
};

const dummyPayments = [
  {
    id: "payment1",
    payment_type: "project_unlock",
    amount: 11.75,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    coupon_used: null,
    status: "success"
  },
  {
    id: "payment2",
    payment_type: "pro_subscription",
    amount: 16.99,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    coupon_used: "WELCOME10",
    status: "success"
  }
];

export default function BillingPage() {
  const [cancelling, setCancelling] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading billing data
    setTimeout(() => {
      setProfile(dummyProfile);
      setPayments(dummyPayments);
      setLoading(false);
    }, 1000);
  }, []);

  const planType =
    profile?.plan_type ||
    (profile?.subscription_status === "active" && profile?.subscription_plan === "pro" ? "pro" : "free");

  const isActive = profile?.subscription_status === "active" && planType === "pro";

  const planLabel =
    planType === "project_unlock" ? "Project Unlock" : planType === "pro" ? "Pro" : "Free";

  const handleUpgrade = () => {
    setShowComingSoon(true);
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      // Simulate cancellation
      setTimeout(() => {
        setProfile(prev => prev ? { ...prev, subscription_status: "cancelled" } : null);
        toast.success("Subscription cancelled. Access continues until billing period ends.");
        setCancelling(false);
      }, 1000);
    } catch {
      toast.error("Failed to cancel subscription");
      setCancelling(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Billing & Subscription</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your plan and payment method</p>

      {/* Current Plan */}
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Plan</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{planLabel}</p>
              {planType === "pro" && <Crown className="h-5 w-5 text-accent" />}
              {planType === "project_unlock" && <Lock className="h-5 w-5 text-accent" />}
            </div>

            {isActive && profile?.subscription_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Renews {new Date(profile.subscription_end).toLocaleDateString()}
              </p>
            )}

            {planType === "free" && (
              <p className="text-xs text-muted-foreground mt-1">Free tier • No payment method required</p>
            )}

            {planType === "project_unlock" && (
              <p className="text-xs text-muted-foreground mt-1">
                You've unlocked project access — upgrade to Pro for Product Studio tools and higher limits.
              </p>
            )}
          </div>

          <Badge variant="outline" className={isActive ? "text-primary border-primary" : "text-muted-foreground"}>
            {isActive ? "Active" : planType === "free" ? "Free" : "Unlocked"}
          </Badge>
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Workspace limit</span>
            <span className="font-medium text-foreground">{profile?.workspace_limit ?? 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Project limit (per workspace)</span>
            <span className="font-medium text-foreground">{profile?.project_limit ?? 1}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Report access</span>
            <span className="font-medium text-foreground">{profile?.report_access ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Product Studio tools</span>
            <span className="font-medium text-foreground">{profile?.tool_access ? "Yes" : "No"}</span>
          </div>
        </div>

        {planType !== "pro" && (
          <Button onClick={handleUpgrade} className="mt-5 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
            Upgrade to Pro — $16.99/mo <ArrowUpRight className="h-4 w-4" />
          </Button>
        )}

        {isActive && (
          <Button
            variant="outline"
            className="mt-4 text-destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Subscription"}
          </Button>
        )}
      </div>

      {/* Plans overview */}
      <h3 className="font-semibold mb-4">Available Plans</h3>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            name: "Free",
            price: "Free",
            features: ["1 workspace", "1 project", "3 phases", "No exports"],
            current: planType === "free",
          },
          {
            name: "Project Unlock",
            price: "$11.75 / project",
            features: ["1 workspace", "2 projects", "Venture Summary", "PDF downloads"],
            current: planType === "project_unlock",
          },
          {
            name: "Pro",
            price: "$16.99 / month",
            features: ["2 workspaces", "3 projects / workspace", "All reports", "Product Studio tools"],
            current: planType === "pro",
            popular: true,
          },
        ].map((p) => (
          <div
            key={p.name}
            className={`rounded-xl p-5 border ${p.popular ? "border-accent bg-accent/5" : "border-border glass-card"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{p.name}</h4>
              {p.popular && <Badge className="bg-accent text-accent-foreground text-xs">Most Popular</Badge>}
              {p.current && <Badge variant="outline" className="text-xs">Current</Badge>}
            </div>
            <p className="text-2xl font-bold mb-4">{p.price}</p>
            <ul className="space-y-2">
              {p.features.map((f) => (
                <li key={f} className="text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Payment History</h3>
        </div>

        {payments && payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                <div>
                  <p className="font-medium capitalize">{p.payment_type.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${Number(p.amount).toFixed(2)}</p>
                  {p.coupon_used && <p className="text-[10px] text-accent">Coupon: {p.coupon_used}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No payments yet. Payment history will appear here.</p>
        )}
      </div>

      {showComingSoon && <PaymentsComingSoonModal onClose={() => setShowComingSoon(false)} />}
    </div>
  );
}
