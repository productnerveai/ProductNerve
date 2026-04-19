import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight } from "lucide-react";

export default function LeadMagnetSection() {
  const [idea, setIdea] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = () => {
    navigate("/signup", { state: { idea } });
  };

  return (
    <section className="py-24 md:py-32 bg-muted/40">
      <div className="container max-w-3xl text-center">
        <div className="animate-fade-up">
          <h2 className="text-3xl md:text-[40px] font-bold mb-4">
            Describe Your Startup Idea.
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Paste your idea below and we'll help you structure it into a venture blueprint.
          </p>
        </div>
        <div className="animate-fade-up-delay-1">
          <Textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your startup idea here…"
            className="min-h-[140px] text-base mb-6 bg-card"
            rows={5}
          />
          <Button
            variant="default"
            size="lg"
            className="gap-2"
            onClick={handleAnalyze}
          >
            Analyze Idea <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
