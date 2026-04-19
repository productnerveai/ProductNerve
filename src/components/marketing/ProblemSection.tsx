import { AlertTriangle, Target, TrendingDown, DollarSign, Users } from "lucide-react";

const painPoints = [
  { icon: AlertTriangle, title: "Weak Validation", desc: "Ideas launched without structured pressure testing or evidence." },
  { icon: Target, title: "No Execution Clarity", desc: "Building without scope discipline, cost projections, or architecture." },
  { icon: TrendingDown, title: "Premature Scaling", desc: "Scaling without defined signals, metrics, or trigger points." },
  { icon: Users, title: "Undefined Metrics", desc: "Operating without KPIs, unit economics, or funnel analysis." },
  { icon: DollarSign, title: "Capital Misallocation", desc: "Burning capital on the wrong things at the wrong time." },
];

export default function ProblemSection() {
  return (
    <section className="py-28 bg-background">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Left — Heading */}
          <div className="animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Why Most Ventures{" "}
              <span className="text-destructive">Fail Early</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              It's not the idea. It's the absence of structure. Most founders skip the hard work 
              of systematic validation and structured execution.
            </p>
          </div>

          {/* Right — Cards */}
          <div className="space-y-4">
            {painPoints.map((item, i) => (
              <div
                key={item.title}
                className={`glass-card rounded-xl p-5 flex items-start gap-4 animate-fade-up-delay-${Math.min(i + 1, 3)}`}
              >
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
