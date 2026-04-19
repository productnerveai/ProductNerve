import { Folders, Shield, Layers, TrendingUp } from "lucide-react";

const capabilities = [
  { icon: Folders, label: "Project Workspaces" },
  { icon: Shield, label: "Venture Validation Engine" },
  { icon: Layers, label: "Product Studio Tools" },
  { icon: TrendingUp, label: "Growth Planning" },
];

export default function PlatformPreviewSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            Your Entire Startup — Designed In One Workspace.
          </h2>
        </div>

        <div className="animate-fade-up-delay-1">
          <div className="glass-card rounded-2xl p-6 md:p-8 mb-10">
            {/* Dashboard mockup */}
            <div className="flex items-center gap-2 mb-5">
              <div className="h-3 w-3 rounded-full bg-destructive/50" />
              <div className="h-3 w-3 rounded-full bg-accent/50" />
              <div className="h-3 w-3 rounded-full bg-green-400/50" />
              <span className="text-xs text-muted-foreground ml-2">productnerve.com/app/dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {["Validation", "Execution", "Growth", "Studio"].map((tab) => (
                <div key={tab} className="h-10 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {tab}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: "Viability", value: "72" },
                { label: "Execution", value: "64" },
                { label: "Growth", value: "58" },
                { label: "Overall", value: "65" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-muted/60 p-4 text-center">
                  <p className="text-2xl font-bold">{m.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {["Reality Pressure", "Market Env.", "Buyer Econ.", "Competitive"].map((bar, i) => (
                <div key={bar}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{bar}</span>
                    <span>{[68, 74, 55, 61][i]}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${[68, 74, 55, 61][i]}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {capabilities.map(({ icon: Icon, label }) => (
            <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3 hover-lift">
              <Icon className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
