import { Shield, Wrench, Rocket, Layers, FileText, BarChart3 } from "lucide-react";

const features = [
  { icon: Shield, title: "Idea Validation", desc: "Pressure-test ideas across 6 analytical layers before building." },
  { icon: Wrench, title: "Execution Blueprint", desc: "Design scoped, budgeted, timeline-driven build plans." },
  { icon: Rocket, title: "Growth Strategy", desc: "Architect go-to-market with channels, funnels, and triggers." },
  { icon: Layers, title: "Product Studio Tools", desc: "ICP, experiments, roadmaps, and growth engines in one workspace." },
  { icon: FileText, title: "Product Documentation", desc: "Generate PRDs, user stories, and roadmaps with AI." },
  { icon: BarChart3, title: "Venture Intelligence", desc: "Scores, risk maps, and recommendations powered by structured logic." },
];

export default function ProductIntroSection() {
  return (
    <section id="about" className="py-24 md:py-32 bg-muted/40">
      <div className="container max-w-6xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            Meet Your Startup Operating System.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Everything you need to go from raw idea to structured, investable venture.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card rounded-2xl p-7 hover-lift animate-fade-up-delay-${Math.min(i + 1, 3)}`}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <f.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
