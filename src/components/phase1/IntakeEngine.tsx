import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { saveIntakeProgress, loadIntakeProgress, clearIntakeProgress } from "@/lib/intake-autosave";


type Message = { role: "user" | "assistant"; content: string };

interface IntakeEngineProps {
  projectId: string;
  onIntakeComplete: (data: any) => void;
}

const INTAKE_AREAS = [
  "Idea Definition",
  "Target Segment",
  "Problem & Urgency",
  "Existing Alternatives",
  "Revenue Logic",
  "Market Context",
  "Differentiation",
  "Founder Advantage",
  "Key Assumptions",
  "Validation Evidence",
];

export default function IntakeEngine({ projectId, onIntakeComplete }: IntakeEngineProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completedAreas, setCompletedAreas] = useState<number>(0);
  const [sendingBlocked, setSendingBlocked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Dummy AI responses for simulation
  const dummyResponses = [
    "I understand you're ready to validate your venture idea. Let me help you evaluate your concept across 10 critical areas. First, tell me about your core idea and what problem it solves.",
    "That's helpful. Now let's discuss your target customers. Who exactly are you building this for and what makes them a good fit?",
    "Good context. What's the urgency of this problem? How painful is it for your target customers right now?",
    "Thanks for sharing. What solutions are people currently using for this problem? How are they coping without your solution?",
    "Interesting. Let's talk about how you'll make money. What's your revenue model and pricing strategy?",
    "Important details. What's the market size and growth potential for this opportunity?",
    "Got it. How does your solution stand out from competitors? What makes you uniquely positioned to win?",
    "Great to know. What's your team's background and expertise that gives you an advantage here?",
    "Thanks for that. What are the key assumptions you're making about your business model and market?",
    "Final question - what evidence do you have that validates your assumptions? Any early traction or customer feedback?",
    "<INTAKE_COMPLETE>{\"idea_description\":\"AI-powered productivity platform\",\"problem_statement\":\"Remote teams struggle with communication\",\"target_users\":\"Remote workers and team managers\",\"target_market\":\"SMB productivity tools\",\"monetization_model\":\"SaaS subscription\",\"founder_background\":\"Tech industry veterans\",\"core_assumptions\":\"Remote work is permanent\",\"follow_up_responses\":{\"market_size\":\"Large\"}}</INTAKE_COMPLETE>"
  ];

  // Restore saved progress on mount
  useEffect(() => {
    const saved = loadIntakeProgress(projectId, "phase1");
    if (saved && saved.started && saved.messages.length > 0) {
      setMessages(saved.messages as Message[]);
      setStarted(saved.started);
      setCompletedAreas(saved.completedAreas);
      toast.info("Restored your previous progress");
    }
  }, [projectId]);

  // Auto-save on message changes
  useEffect(() => {
    if (started && messages.length > 0) {
      saveIntakeProgress(projectId, "phase1", { messages, completedAreas, started });
    }
  }, [messages, completedAreas, started, projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Estimate progress based on message count (heuristic)
  useEffect(() => {
    const userMsgCount = messages.filter(m => m.role === "user").length;
    // Rough: each user response covers ~1 area, first response covers ~2
    const estimated = Math.min(10, userMsgCount > 0 ? Math.min(userMsgCount + 1, 10) : 0);
    setCompletedAreas(estimated);
  }, [messages]);

  const startIntake = async () => {
    setStarted(true);
    const userMsg: Message = { role: "user", content: "I want to validate my venture idea." };
    setMessages([userMsg]);
    await streamResponse([userMsg]);
  };

  const streamResponse = async (msgs: Message[]) => {
    setIsLoading(true);
    
    // Simulate AI response based on message count
    const userMsgCount = msgs.filter(m => m.role === "user").length;
    const responseIndex = Math.min(userMsgCount - 1, dummyResponses.length - 1);
    const responseText = dummyResponses[Math.max(0, responseIndex)];
    
    // Simulate streaming effect
    let currentText = "";
    const words = responseText.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      currentText += (i > 0 ? ' ' : '') + words[i];
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, idx) => idx === prev.length - 1 ? { ...m, content: currentText } : m);
        }
        return [...prev, { role: "assistant", content: currentText }];
      });
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }

    // Check for intake completion
    if (currentText.includes("<INTAKE_COMPLETE>")) {
      const match = currentText.match(/<INTAKE_COMPLETE>([\s\S]*?)<\/INTAKE_COMPLETE>/);
      if (match) {
        try {
          const intakeData = JSON.parse(match[1]);
          setCompletedAreas(10);
          clearIntakeProgress(projectId, "phase1");
          toast.success("Intake complete! Ready for scoring engine.");
          onIntakeComplete(intakeData);
        } catch (e) {
          console.error("Failed to parse intake data:", e);
        }
      }
    }
    
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || sendingBlocked) return;
    setSendingBlocked(true);
    const userMsg: Message = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    await streamResponse(newMsgs);
    setSendingBlocked(false);
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-8 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Strategic Validation Interview</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our venture strategist will guide you through 10 structured areas to build an investor-grade validation report.
          </p>
        </div>

        {/* Areas preview */}
        <div className="w-full grid grid-cols-2 gap-2">
          {INTAKE_AREAS.map((area, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg border px-3 py-2">
              <Circle className="h-3 w-3 shrink-0" />
              <span>{area}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center italic max-w-md">
          The more detail you provide, the more rigorous your validation scores and strategic insights will be.
        </p>

        <Button onClick={startIntake} variant="hero" size="lg">
          Begin Validation Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px]">
      {/* Progress tracker */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">Intake Progress</span>
          <span className="text-xs font-medium text-primary">{completedAreas}/10 areas</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completedAreas / 10) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {INTAKE_AREAS.map((area, i) => (
            <span
              key={i}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                i < completedAreas
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-muted/50 text-muted-foreground border-transparent"
              }`}
            >
              {i < completedAreas && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5 -mt-0.5" />}
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-muted/30 rounded-xl">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            }`}>
              {msg.role === "assistant"
                ? msg.content.replace(/<INTAKE_COMPLETE>[\s\S]*?<\/INTAKE_COMPLETE>/, "").trim()
                : msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-accent" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-card border border-border rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-4 items-end">
        <div className="relative flex-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share your venture details..."
            className="min-h-[56px] max-h-[120px] resize-none pr-10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
          />
        </div>
        <Button onClick={sendMessage} disabled={!input.trim() || isLoading || sendingBlocked} size="icon" className="h-14 w-14 shrink-0">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
