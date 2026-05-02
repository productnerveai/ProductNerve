import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Loader2, CheckCircle2, Circle, Rocket } from "lucide-react";
import { toast } from "sonner";
import { saveIntakeProgress, loadIntakeProgress, clearIntakeProgress } from "@/lib/intake-autosave";

const API_BASE_URL = import.meta.env.VITE_API_URL;


type Message = { role: "user" | "assistant"; content: string };

interface Phase3IntakeEngineProps {
  projectId: string;
  onIntakeComplete: (data: any) => void;
}

const INTAKE_AREAS = [
  "Ideal Customer",
  "Buying Trigger",
  "Customer Discovery",
  "Distribution Access",
  "Revenue Model",
  "Pricing Hypothesis",
  "Sales Motion",
  "Time-to-Value",
  "Retention Logic",
  "Competitive Edge",
  "Channel Strategy",
  "CAC Estimate",
  "Growth Target",
  "GTM Capital",
  "Scale Intent",
];

export default function Phase3IntakeEngine({ projectId, onIntakeComplete }: Phase3IntakeEngineProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completedAreas, setCompletedAreas] = useState<number>(0);
  const [sendingBlocked, setSendingBlocked] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadIntakeProgress(projectId, "phase3");
    if (saved && saved.started && saved.messages.length > 0) {
      setMessages(saved.messages as Message[]);
      setStarted(saved.started);
      setCompletedAreas(saved.completedAreas);
      toast.info("Restored your previous progress");
    }
  }, [projectId]);

  useEffect(() => {
    if (started && messages.length > 0) {
      saveIntakeProgress(projectId, "phase3", { messages, completedAreas, started });
    }
  }, [messages, completedAreas, started, projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const userMsgCount = messages.filter(m => m.role === "user").length;
    const estimated = Math.min(15, userMsgCount > 0 ? Math.min(userMsgCount, 15) : 0);
    setCompletedAreas(estimated);
  }, [messages]);

  const startIntake = async () => {
    setStarted(true);
    const userMsg: Message = { role: "user", content: "I'm ready to design my go-to-market strategy." };
    setMessages([userMsg]);
    await streamResponse([userMsg]);
  };

  const streamResponse = async (msgs: Message[]) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/validation/phase3-intake`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Send the full conversation as structured messages, not just a flattened string
          messages: msgs.map(m => `${m.role === 'user' ? 'FOUNDER' : 'ADVISOR'}: ${m.content}`).join('\n\n'),
          project_id: projectId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.data?.response;
        
        if (!responseText) {
          console.error('Empty response from AI service');
          toast.error("Received empty response from AI service");
          setIsLoading(false);
          return;
        }
        
        // Simulate streaming effect for better UX
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
          await new Promise(resolve => setTimeout(resolve, 30));
        }

        // Parse area completion signal
        const areaMatch = currentText.match(/<AREA_COMPLETE:(\d+)>/);
        if (areaMatch) {
          const completedArea = parseInt(areaMatch[1]);
          setCompletedAreas(prev => Math.max(prev, completedArea));
        }

        // Strip the signal from the displayed message
        setMessages(prev =>
          prev.map((m, idx) =>
            idx === prev.length - 1
              ? { ...m, content: m.content.replace(/<AREA_COMPLETE:\d+>/g, "").trim() }
              : m
          )
        );

        // Check for intake completion
        if (currentText.includes("<INTAKE_COMPLETE>")) {
          const match = currentText.match(/<INTAKE_COMPLETE>([\s\S]*?)<\/INTAKE_COMPLETE>/);
          if (match) {
            try {
              const intakeData = JSON.parse(match[1]);
              setCompletedAreas(15);
              clearIntakeProgress(projectId, "phase3");
              toast.success("GTM assessment complete! Ready for growth analysis.");
              onIntakeComplete(intakeData);
            } catch (e) {
              console.error("Failed to parse intake data:", e);
            }
          }
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
      }]);
    } finally {
      setIsLoading(false);
    }
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
        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Rocket className="h-8 w-8 text-accent" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">GTM & Growth Assessment</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our growth strategist will assess your market entry readiness, customer clarity, revenue mechanics, and growth ambition across 15 structured areas to design a realistic GTM blueprint.
          </p>
        </div>

        <div className="w-full grid grid-cols-3 gap-2">
          {INTAKE_AREAS.map((area, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground rounded-lg border px-3 py-2">
              <Circle className="h-3 w-3 shrink-0" />
              <span>{area}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center italic max-w-md">
          Be specific about your customer, channels, and pricing. Vague answers produce vague blueprints.
        </p>

        <Button onClick={startIntake} variant="hero" size="lg">
          Begin Growth Assessment
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[650px]">
      {/* Progress tracker */}
      <div className="mb-3 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-muted-foreground">GTM Assessment Progress</span>
          <span className="text-xs font-medium text-accent">{completedAreas}/15 areas</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${(completedAreas / 15) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {INTAKE_AREAS.map((area, i) => (
            <span
              key={i}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                i < completedAreas
                  ? "bg-accent/10 text-accent border-accent/20"
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
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-4 w-4 text-accent" />
              </div>
            )}
            <div className={`max-w-[75%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border"
            }`}>
              {msg.role === "assistant"
                ? msg.content
                    .replace(/<INTAKE_COMPLETE>[\s\S]*?<\/INTAKE_COMPLETE>/, "")
                    .replace(/<AREA_COMPLETE:\d+>/g, "")
                    .trim()
                : msg.content}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-primary" />
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-accent" />
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
            placeholder="Share your go-to-market details..."
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
