import { Users, Search, Layers, FlaskConical, TrendingUp } from "lucide-react";

const systemSteps = [
  { icon: Users, label: "Understand the Customer" },
  { icon: Search, label: "Validate the Problem" },
  { icon: Layers, label: "Design the Product" },
  { icon: FlaskConical, label: "Run Experiments" },
  { icon: TrendingUp, label: "Execute Growth" },
];

export default function ReframeSection() {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container max-w-5xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold leading-tight mb-4">
            Startups Are Not Random.{" "}
            <span className="text-accent">They Are Systems.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Successful startups rely on structure: understanding the customer, validating the problem,
            designing the product, running experiments, and executing growth.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0">
          {systemSteps.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="glass-card rounded-xl px-5 py-4 flex items-center gap-3 hover:shadow-xl transition-shadow">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <step.icon className="h-4.5 w-4.5 text-accent" />
                </div>
                <span className="text-sm font-medium whitespace-nowrap">{step.label}</span>
              </div>
              {i < systemSteps.length - 1 && (
                <div className="hidden sm:block w-8 h-px bg-border mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
