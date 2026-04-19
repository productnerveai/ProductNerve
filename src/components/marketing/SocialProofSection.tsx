import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "This helped me structure my startup idea before writing a single line of code.",
    name: "Early Beta Founder",
    role: "SaaS Founder",
  },
  {
    quote: "The validation engine forced me to think critically about my assumptions. It saved me months.",
    name: "Beta User",
    role: "Product Manager",
  },
  {
    quote: "I went from a scattered idea to a full venture blueprint in under a week.",
    name: "Beta Participant",
    role: "First-time Founder",
  },
];

export default function SocialProofSection() {
  return (
    <section className="py-24 md:py-32 bg-muted/40">
      <div className="container max-w-5xl">
        <div className="text-center mb-16 animate-fade-up">
          <p className="text-sm font-semibold text-accent mb-2 tracking-wide uppercase">Beta Feedback</p>
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            Early Founders Are Already Using Product Nerve AI.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`glass-card rounded-2xl p-7 flex flex-col animate-fade-up-delay-${i + 1}`}
            >
              <Quote className="h-8 w-8 text-accent/30 mb-4" />
              <p className="text-sm text-foreground mb-6 flex-1 italic leading-relaxed">"{t.quote}"</p>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
