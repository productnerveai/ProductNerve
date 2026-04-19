import { Lightbulb, Hammer, Search, Shuffle, RotateCcw } from "lucide-react";

const steps = [
  { icon: Lightbulb, title: "Excited about idea", desc: "The spark feels real — but nothing is validated." },
  { icon: Hammer, title: "Build too early", desc: "Jump to code before understanding the market." },
  { icon: Search, title: "Validate wrong signals", desc: "Mistake interest for demand. Likes for revenue." },
  { icon: Shuffle, title: "Chase traction randomly", desc: "No system. No funnel. Just scattered effort." },
  { icon: RotateCcw, title: "Pivot repeatedly", desc: "Burn capital on direction changes with no data." },
];

export default function FounderInsightSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/40">
      <div className="container max-w-5xl">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold leading-tight mb-4">
            Every Founder Starts With an Idea.
            <br />
            <span className="text-muted-foreground">But Very Few Start With Structure.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-16">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`glass-card rounded-xl p-5 text-center hover-lift animate-fade-up-delay-${Math.min(i + 1, 3)}`}
            >
              <div className="h-11 w-11 rounded-lg bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <step.icon className="h-5 w-5 text-destructive" />
              </div>
              <h4 className="font-semibold text-sm mb-1">{step.title}</h4>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up">
          Startups fail not because founders lack ideas —{" "}
          <span className="text-foreground font-semibold">but because they lack a venture system.</span>
        </p>
      </div>
    </section>
  );
}
