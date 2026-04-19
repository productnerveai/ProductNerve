import { Users, FlaskConical, TrendingUp, Map, BookOpen, FileText } from "lucide-react";

const tools = [
  { icon: Users, title: "ICP Builder", desc: "Define and validate your ideal customer profiles with structured segmentation." },
  { icon: FlaskConical, title: "Experiment Engine", desc: "Design hypothesis-driven experiments with measurable success metrics." },
  { icon: TrendingUp, title: "Growth Engine", desc: "Build acquisition strategies, channel plans, and growth forecasts." },
  { icon: Map, title: "Roadmap Generator", desc: "Create milestone-based product roadmaps aligned to your venture phases." },
  { icon: BookOpen, title: "User Story Generator", desc: "Generate structured user stories with acceptance criteria and priorities." },
  { icon: FileText, title: "PRD Generator", desc: "Produce Simple, Growth, or Technical PRDs from structured inputs." },
];

export default function StudioToolsSection() {
  return (
    <section id="startup-tools" className="py-24 md:py-32 bg-muted/40">
      <div className="container max-w-6xl">
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-sm font-semibold text-accent mb-2 tracking-wide uppercase">Product Studio</p>
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            A Full Product Studio Inside Your Workspace.
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Six AI-powered tools that turn your startup thinking into actionable artifacts.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <div
              key={tool.title}
              className={`glass-card rounded-2xl p-7 hover-lift hover:border-accent/30 animate-fade-up-delay-${Math.min(i + 1, 3)}`}
            >
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <tool.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
