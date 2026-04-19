import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Wrench, Rocket, ArrowRight } from "lucide-react";

const engines = [
  {
    icon: Shield,
    title: "Validation Engine",
    subtitle: "Phase 1 — Venture Pressure",
    desc: "Pressure-test your idea across reality, market, buyer economics, competitive, and founder layers.",
    outcome: "Viability Score + Risk Map + Build / Pivot / Kill Decision",
    cta: "Run Validation",
  },
  {
    icon: Wrench,
    title: "Execution Engine",
    subtitle: "Phase 2 — Venture Construction",
    desc: "Design your execution blueprint with scoping, architecture, resource planning, and MVP deployment.",
    outcome: "Execution Readiness Score + Timeline + Cost Band",
    cta: "Design Build Plan",
  },
  {
    icon: Rocket,
    title: "Growth Engine",
    subtitle: "Phase 3 — Venture Acceleration",
    desc: "Architect your go-to-market with org design, demand engine, conversion system, and scale triggers.",
    outcome: "Growth Readiness Score + Scale / Pivot / Kill Triggers",
    cta: "Prepare to Scale",
  },
];

export default function SolutionsSection() {
  return (
    <section id="how-it-works" className="py-28 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How Product Nerve AI Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A 3-phase venture operating system that takes you from idea to scale-readiness with structured intelligence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {engines.map((engine, i) => (
            <div
              key={engine.title}
              className={`glass-card rounded-2xl p-8 flex flex-col animate-fade-up-delay-${i + 1}`}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <engine.icon className="h-6 w-6 text-accent" />
              </div>
              <p className="text-xs font-mono text-accent font-semibold mb-1">{engine.subtitle}</p>
              <h3 className="text-xl font-bold mb-3">{engine.title}</h3>
              <p className="text-sm text-muted-foreground mb-5 flex-1">{engine.desc}</p>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 mb-5">
                <p className="text-xs font-medium text-accent">{engine.outcome}</p>
              </div>
              <Link to="/signup">
                <Button variant="outline" className="w-full gap-2">
                  {engine.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
