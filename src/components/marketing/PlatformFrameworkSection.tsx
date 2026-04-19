import { Shield, Wrench, Rocket } from "lucide-react";

const phases = [
  {
    icon: Shield,
    phase: "Phase 1",
    title: "Validate the Idea",
    analyzes: ["Market opportunity", "Customer demand", "Competitive landscape"],
    output: "Venture viability score",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Wrench,
    phase: "Phase 2",
    title: "Design Execution",
    analyzes: ["PRDs & user stories", "Product roadmap", "Technical architecture"],
    output: "Execution blueprint",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Rocket,
    phase: "Phase 3",
    title: "Plan Growth",
    analyzes: ["ICP & segments", "Growth experiments", "Acquisition strategy"],
    output: "Go-to-market strategy",
    color: "bg-accent/10 text-accent",
  },
];

export default function PlatformFrameworkSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            Build Your Startup In Three Strategic Phases.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A structured framework that takes you from raw idea to scale-readiness.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {phases.map((p, i) => (
            <div
              key={p.phase}
              className={`glass-card rounded-2xl p-8 flex flex-col animate-fade-up-delay-${i + 1}`}
            >
              <div className={`h-12 w-12 rounded-xl ${p.color} flex items-center justify-center mb-5`}>
                <p.icon className="h-6 w-6" />
              </div>
              <p className="text-xs font-mono font-semibold text-accent mb-1">{p.phase}</p>
              <h3 className="text-xl font-bold mb-4">{p.title}</h3>
              <div className="space-y-2 mb-6 flex-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Analyze:</p>
                {p.analyzes.map((a) => (
                  <div key={a} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {a}
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-xs font-semibold text-accent">Output: {p.output}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
