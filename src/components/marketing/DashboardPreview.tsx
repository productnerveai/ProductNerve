import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3, AlertTriangle, GitBranch, DollarSign, TrendingUp, FileDown } from "lucide-react";

const benefits = [
  { icon: BarChart3, label: "Phase score breakdown" },
  { icon: AlertTriangle, label: "Risk heatmap" },
  { icon: GitBranch, label: "Route comparison" },
  { icon: DollarSign, label: "Cost simulation" },
  { icon: TrendingUp, label: "Scale signals" },
  { icon: FileDown, label: "Downloadable venture blueprint" },
];

export default function DashboardPreview() {
  return (
    <section className="py-28 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — Mockup */}
          <div className="animate-fade-up">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-accent/50" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/50" />
                <span className="text-[10px] text-muted-foreground ml-2">Master Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {["Phase 1", "Phase 2", "Phase 3"].map((tab) => (
                  <div key={tab} className="h-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {tab}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Viability", value: "72" },
                  { label: "Risk Level", value: "Med" },
                  { label: "Readiness", value: "64" },
                  { label: "Growth", value: "58" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg bg-muted/50 p-3 text-center">
                    <p className="text-lg font-bold text-foreground">{metric.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{metric.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {["Reality Pressure", "Market Env.", "Buyer Econ.", "Competitive"].map((bar, i) => (
                  <div key={bar}>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
                      <span>{bar}</span>
                      <span>{[68, 74, 55, 61][i]}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${[68, 74, 55, 61][i]}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Benefits */}
          <div className="animate-fade-up-delay-1">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Every Project Gets a Command Center
            </h2>
            <p className="text-muted-foreground mb-8">
              Structured phase dashboards, risk heatmaps, scoring models,
              action recommendations, and downloadable venture-grade PDF reports.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {benefits.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Icon className="h-4 w-4 text-accent shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
            <Link to="/signup">
              <Button variant="default" size="lg">Start Free</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
