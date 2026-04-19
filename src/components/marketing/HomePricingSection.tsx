import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Building2, FolderOpen, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start validating your venture at no cost.",
    limits: { workspaces: "1 workspace", projects: "1 project" },
    phases: ["Phase 1 — Validation", "Phase 2 — Execution", "Phase 3 — Growth"],
    tools: ["PRD Generator", "User Stories Generator"],
    toolRestrictions: ["ICP Builder", "Experiment Engine", "Growth Engine", "Roadmap Generator"],
    extras: [],
    restrictions: ["No Venture Summary Dashboard", "No report exports or downloads"],
    cta: "Get Started Free",
    highlighted: false,
    badge: null,
  },
  {
    name: "Pro",
    price: "$16.99",
    period: "/ month",
    description: "Full access to the venture operating system.",
    limits: { workspaces: "2 workspaces", projects: "3 projects / workspace" },
    phases: ["Phase 1 — Validation", "Phase 2 — Execution", "Phase 3 — Growth"],
    tools: ["PRD Generator", "User Stories Generator", "ICP Builder", "Experiment Engine", "Growth Engine", "Roadmap Generator"],
    toolRestrictions: [],
    extras: ["Full Venture Summary Dashboard", "Unlimited report downloads", "Growth forecast tools", "Investor readiness tools"],
    restrictions: [],
    cta: "Start Pro",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Project Unlock",
    price: "$11.75",
    period: "per project",
    description: "Unlock full intelligence for one project — permanently.",
    limits: { workspaces: "1 workspace", projects: "2 projects" },
    phases: ["Phase 1 — Validation", "Phase 2 — Execution", "Phase 3 — Growth"],
    tools: ["PRD Generator", "User Stories Generator", "ICP Builder"],
    toolRestrictions: ["Experiment Engine", "Growth Engine", "Roadmap Generator"],
    extras: ["Venture Summary Dashboard", "Phase 1, 2 & 3 reports", "PDF report download", "Permanent project access"],
    restrictions: [],
    cta: "Unlock a Project",
    highlighted: false,
    badge: null,
  },
];

export default function HomePricingSection() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">Start Free. Upgrade When Ready.</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Transparent pricing — pay only to unlock Venture Summary, reports, and premium studio tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:items-end">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`rounded-2xl flex flex-col animate-fade-up ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/25 ring-2 ring-accent md:mb-0"
                  : "glass-card border border-border md:mb-6"
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Header */}
              <div className={`px-6 pt-6 pb-5 border-b ${plan.highlighted ? "border-primary-foreground/10" : "border-border"}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">{plan.name}</span>
                  {plan.badge && (
                    <Badge className="bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-0.5">
                      {plan.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Limits */}
              <div className={`px-6 py-4 border-b ${plan.highlighted ? "border-primary-foreground/10" : "border-border"}`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2.5 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                  Limits
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className={`h-3.5 w-3.5 shrink-0 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground"}`} />
                    <span className={plan.highlighted ? "text-primary-foreground/85" : ""}>{plan.limits.workspaces}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FolderOpen className={`h-3.5 w-3.5 shrink-0 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground"}`} />
                    <span className={plan.highlighted ? "text-primary-foreground/85" : ""}>{plan.limits.projects}</span>
                  </div>
                </div>
              </div>

              {/* Phases */}
              <div className={`px-6 py-4 border-b ${plan.highlighted ? "border-primary-foreground/10" : "border-border"}`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2.5 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                  Venture Phases
                </p>
                <div className="space-y-1.5">
                  {plan.phases.map((p) => (
                    <div key={p} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className={plan.highlighted ? "text-primary-foreground/90" : ""}>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Studio Tools */}
              <div className={`px-6 py-4 border-b ${plan.highlighted ? "border-primary-foreground/10" : "border-border"}`}>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2.5 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                  Product Studio Tools
                </p>
                <div className="space-y-1.5">
                  {plan.tools.map((t) => (
                    <div key={t} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span className={plan.highlighted ? "text-primary-foreground/90" : ""}>{t}</span>
                    </div>
                  ))}
                  {plan.toolRestrictions.map((r) => (
                    <div key={r} className="flex items-center gap-2 text-sm">
                      <X className={`h-3.5 w-3.5 shrink-0 ${plan.highlighted ? "text-primary-foreground/25" : "text-muted-foreground/35"}`} />
                      <span className={`line-through ${plan.highlighted ? "text-primary-foreground/35" : "text-muted-foreground/45"}`}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included / Extras */}
              {(plan.extras.length > 0 || plan.restrictions.length > 0) && (
                <div className={`px-6 py-4 border-b ${plan.highlighted ? "border-primary-foreground/10" : "border-border"}`}>
                  <p className={`text-[10px] uppercase tracking-widest font-semibold mb-2.5 ${plan.highlighted ? "text-primary-foreground/50" : "text-muted-foreground/60"}`}>
                    {plan.extras.length > 0 ? "Included" : "Restrictions"}
                  </p>
                  <div className="space-y-1.5">
                    {plan.extras.map((e) => (
                      <div key={e} className="flex items-center gap-2 text-sm">
                        <Check className="h-3.5 w-3.5 text-accent shrink-0" />
                        <span className={plan.highlighted ? "text-primary-foreground/90" : ""}>{e}</span>
                      </div>
                    ))}
                    {plan.restrictions.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-sm">
                        <X className={`h-3.5 w-3.5 shrink-0 ${plan.highlighted ? "text-primary-foreground/25" : "text-muted-foreground/35"}`} />
                        <span className={`line-through ${plan.highlighted ? "text-primary-foreground/35" : "text-muted-foreground/45"}`}>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="px-6 py-6 mt-auto">
                <Link to="/signup">
                  <Button
                    variant={plan.highlighted ? "hero" : "outline"}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {plan.cta} <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
