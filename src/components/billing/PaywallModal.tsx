import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Sparkles, FileDown, BarChart3, Shield, X, Clock } from "lucide-react";

interface PaywallModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaywallModal({ projectId, onClose, onSuccess }: PaywallModalProps) {
  const [showComingSoon, setShowComingSoon] = useState(false);

  const proPrice = 16.99;
  const projectPrice = 11.75;

  if (showComingSoon) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-md bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
            <X className="h-5 w-5" />
          </button>
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto">
              <Clock className="h-7 w-7 text-accent" />
            </div>
            <h2 className="text-xl font-bold">Payments Coming Soon</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Payments will be activated shortly. Start with the free plan while we finalize integration.
            </p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Continue with Free Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Close */}
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="hero-gradient text-primary-foreground p-8 text-center">
          <Lock className="h-10 w-10 mx-auto mb-3 opacity-80" />
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Unlock Full Venture Intelligence</h2>
          <p className="text-primary-foreground/80 text-sm">Venture Summary, reports, and PDF downloads — unlocked instantly.</p>
        </div>

        {/* Blurred preview */}
        <div className="px-8 pt-6">
          <div className="grid grid-cols-2 gap-3 blur-sm select-none pointer-events-none opacity-60">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">72</p>
              <p className="text-xs text-muted-foreground">Venture Score</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-accent">B+</p>
              <p className="text-xs text-muted-foreground">Investor Readiness</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-destructive">3</p>
              <p className="text-xs text-muted-foreground">Risk Flags</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-primary">High</p>
              <p className="text-xs text-muted-foreground">Growth Potential</p>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2 italic">
            72 founders unlocked their venture blueprint this week.
          </p>
        </div>

        {/* Payment options */}
        <div className="p-8 grid sm:grid-cols-2 gap-4">
          {/* Option 1: Project Unlock */}
          <div className="border border-border rounded-xl p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <FileDown className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Unlock This Project</h3>
            </div>
            <p className="text-3xl font-bold mb-1">${projectPrice.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mb-4">One-time payment</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground mb-auto">
              <li className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3 text-primary" />Venture Summary Dashboard</li>
              <li className="flex items-center gap-1.5"><FileDown className="h-3 w-3 text-primary" />Phase Reports + PDF Download</li>
              <li className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-primary" />Permanent Access</li>
            </ul>
            <Button
              className="w-full mt-4"
              variant="outline"
              onClick={() => setShowComingSoon(true)}
            >
              Unlock Report
            </Button>
          </div>

          {/* Option 2: Pro */}
          <div className="border-2 border-accent rounded-xl p-5 flex flex-col relative">
            <Badge className="absolute -top-2.5 right-3 bg-accent text-accent-foreground text-[10px]">Most Popular</Badge>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-accent" />
              <h3 className="font-semibold">Pro Plan</h3>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-bold">${proPrice.toFixed(2)}</span>
              <span className="text-xs text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground mb-3">
              <li className="flex items-center gap-1.5"><Sparkles className="h-3 w-3 text-accent" />Unlimited Projects</li>
              <li className="flex items-center gap-1.5"><FileDown className="h-3 w-3 text-accent" />Unlimited Downloads</li>
              <li className="flex items-center gap-1.5"><BarChart3 className="h-3 w-3 text-accent" />All Studio Tools</li>
            </ul>

            <Button
              className="w-full mt-auto bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={() => setShowComingSoon(true)}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
