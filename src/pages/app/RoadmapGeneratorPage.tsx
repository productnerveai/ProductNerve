import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Map, ArrowRight, ArrowLeft, Save, Plus, Loader2, Sparkles, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const STEPS = ["Product Context", "Timeline", "Generate Roadmap"];

interface ProductContext {
  productIdea: string;
  coreFeatures: string;
  targetICP: string;
  businessGoal: string;
}

// Dummy data
const dummyRoadmaps = [
  {
    id: "roadmap1",
    title: "Q1 2024 Product Roadmap",
    context: {
      productIdea: "AI-powered project management tool",
      coreFeatures: "Task automation, team collaboration, AI insights",
      targetICP: "Startup founders and project managers",
      businessGoal: "Achieve product-market fit in 6 months"
    },
    duration: "6",
    report: {
      summary: "6-month roadmap focusing on core product development and user acquisition",
      phases: [
        {
          phase: "Foundation",
          duration: "Month 1-2",
          objectives: ["Core MVP development", "Initial user testing"],
          deliverables: ["Working prototype", "User feedback report"]
        },
        {
          phase: "Growth",
          duration: "Month 3-4",
          objectives: ["Feature expansion", "Marketing launch"],
          deliverables: ["Advanced features", "Marketing campaign"]
        },
        {
          phase: "Scale",
          duration: "Month 5-6",
          objectives: ["Performance optimization", "User scaling"],
          deliverables: ["Performance improvements", "Scale infrastructure"]
        }
      ]
    },
    status: "complete",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "roadmap2",
    title: "E-commerce Platform Roadmap",
    context: {
      productIdea: "Customer analytics and insights platform",
      coreFeatures: "Real-time analytics, customer segmentation, predictive insights",
      targetICP: "E-commerce managers and marketing teams",
      businessGoal: "Increase customer retention by 25%"
    },
    duration: "12",
    report: null,
    status: "draft",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const dummyProjects = [
  { id: "proj1", name: "AI Project Manager" },
  { id: "proj2", name: "Customer Analytics Platform" },
  { id: "proj3", name: "Supply Chain Optimizer" }
];

export default function RoadmapGeneratorPage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Untitled Roadmap");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [context, setContext] = useState<ProductContext>({ productIdea: "", coreFeatures: "", targetICP: "", businessGoal: "" });
  const [duration, setDuration] = useState("6");
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading roadmaps and projects
    setTimeout(() => {
      setSaved(dummyRoadmaps);
      setProjects(dummyProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const saveRoadmap = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newRoadmap = {
          id: editingId || `roadmap${Date.now()}`,
          title,
          context: context as any,
          duration,
          report: report || {},
          status: report ? "complete" : "draft",
          workspace_id: "workspace1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {})
        };

        if (editingId) {
          setSaved(prev => prev.map(roadmap => roadmap.id === editingId ? newRoadmap : roadmap));
        } else {
          setSaved(prev => [newRoadmap, ...prev]);
          setEditingId(newRoadmap.id);
        }

        toast.success("Roadmap saved");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving roadmap");
      setSaving(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const months = parseInt(duration);
        const mockReport = {
          summary: `${months}-month strategic roadmap for ${context.productIdea}. This roadmap focuses on delivering value to ${context.targetICP} while achieving ${context.businessGoal}.`,
          phases: [
            {
              phase: "Discovery & Planning",
              duration: `Month 1`,
              objectives: ["Market research", "User interviews", "Technical planning"],
              deliverables: ["Market analysis report", "User personas", "Technical architecture"]
            },
            {
              phase: "Core Development",
              duration: `Month 2-${Math.ceil(months * 0.6)}`,
              objectives: ["MVP development", "Core features implementation", "Initial testing"],
              deliverables: ["Functional MVP", "User testing report", "Performance metrics"]
            },
            {
              phase: "Launch & Growth",
              duration: `Month ${Math.ceil(months * 0.6) + 1}-${months}`,
              objectives: ["Product launch", "User acquisition", "Feature expansion"],
              deliverables: ["Launch campaign", "Growth metrics", "Enhanced features"]
            }
          ],
          milestones: [
            { month: 1, milestone: "Research completed", success: "Validated market need" },
            { month: Math.ceil(months * 0.3), milestone: "MVP ready", success: "Core functionality working" },
            { month: Math.ceil(months * 0.6), milestone: "Beta launch", success: "First 100 users" },
            { month: months, milestone: "Full launch", success: "Product-market fit achieved" }
          ],
          risks: [
            "Technical complexity may delay timeline",
            "Market competition may require pivots",
            "Resource constraints may affect scope"
          ]
        };

        setReport(mockReport);
        toast.success("Roadmap generated!");
        setGenerating(false);
      }, 3000);
    } catch (e: any) {
      toast.error("Error generating roadmap");
      setGenerating(false);
    }
  };

  const loadRoadmap = (r: any) => {
    setEditingId(r.id); setTitle(r.title);
    setContext(r.product_context || { productIdea: "", coreFeatures: "", targetICP: "", businessGoal: "" });
    setDuration(r.timeline_duration || "6");
    setReport(r.report && Object.keys(r.report).length > 0 ? r.report : null);
    setStep(0);
  };

  const startNew = () => {
    setEditingId(null); setTitle("Untitled Roadmap");
    setContext({ productIdea: "", coreFeatures: "", targetICP: "", businessGoal: "" });
    setDuration("6"); setReport(null); setStep(0);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Card className="max-w-md"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Please wait while we load your roadmaps.</p></CardContent></Card></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Map className="h-6 w-6 text-accent" />Roadmap Generator</h1>
          <p className="text-muted-foreground text-sm">Convert product strategy into phased execution roadmaps with user stories.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New</Button>
          <Button size="sm" onClick={() => saveRoadmap()} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Saved Roadmaps</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {saved?.length === 0 ? <p className="text-xs text-muted-foreground">No roadmaps yet.</p> :
              saved?.map((r: any) => (
                <button key={r.id} onClick={() => loadRoadmap(r)}
                  className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${editingId === r.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={r.status === "complete" ? "default" : "secondary"} className="text-[10px]">{r.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0" placeholder="Roadmap Title..." />

          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* Step 1 */}
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle>Product Context</CardTitle><CardDescription>Describe what you're building and why.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Product Idea</Label><Textarea value={context.productIdea} onChange={(e) => setContext(c => ({ ...c, productIdea: e.target.value }))} placeholder="Describe your product..." /></div>
                <div><Label>Core Features</Label><Textarea value={context.coreFeatures} onChange={(e) => setContext(c => ({ ...c, coreFeatures: e.target.value }))} placeholder="Key features you want to build..." /></div>
                <div><Label>Target ICP</Label><Input value={context.targetICP} onChange={(e) => setContext(c => ({ ...c, targetICP: e.target.value }))} placeholder="e.g., Early-stage SaaS founders" /></div>
                <div><Label>Business Goal</Label><Input value={context.businessGoal} onChange={(e) => setContext(c => ({ ...c, businessGoal: e.target.value }))} placeholder="e.g., Reach 100 paying users in 6 months" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>Roadmap Timeline</CardTitle><CardDescription>Select your planning horizon.</CardDescription></CardHeader>
              <CardContent>
                <RadioGroup value={duration} onValueChange={setDuration} className="grid grid-cols-3 gap-4">
                  {[{ v: "3", l: "3 Months", d: "Sprint to MVP" }, { v: "6", l: "6 Months", d: "MVP to Market Validation" }, { v: "12", l: "12 Months", d: "Full Product Lifecycle" }].map((opt) => (
                    <label key={opt.v} className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${duration === opt.v ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                      <RadioGroupItem value={opt.v} className="sr-only" />
                      <span className="text-2xl font-bold text-primary">{opt.l}</span>
                      <span className="text-xs text-muted-foreground text-center">{opt.d}</span>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>Generate Roadmap</CardTitle><CardDescription>AI will create a phased roadmap with milestones and user stories.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateReport} disabled={generating} className="w-full">
                  {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Strategic Roadmap
                </Button>
                <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                  <DialogTrigger asChild><Button variant="outline" className="w-full"><Link2 className="h-4 w-4 mr-2" />Link to Project</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Link to Project</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                      {projects?.map((p: any) => (
                        <button key={p.id} className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                          onClick={() => { saveRoadmap(p.id); setLinkProjectOpen(false); }}>{p.name}</button>
                      ))}
                      {!projects?.length && <p className="text-sm text-muted-foreground">No projects in this workspace.</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" />Previous</Button>
            {step < 2 && <Button onClick={() => setStep(s => s + 1)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>}
          </div>

          {/* Report */}
          {report && Object.keys(report).length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Strategic Product Roadmap</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {report.overview && <div><p className="text-sm text-muted-foreground">{report.overview}</p></div>}

                {report.phases?.length > 0 && report.phases.map((phase: any, i: number) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{phase.name}</h4>
                        {phase.timeline && <span className="text-xs text-muted-foreground">{phase.timeline}</span>}
                      </div>
                      <Badge variant="outline">{phase.status || `Phase ${i + 1}`}</Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      {phase.objectives?.length > 0 && (
                        <div><span className="text-xs font-medium text-muted-foreground">Objectives</span>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">{phase.objectives.map((o: string, oi: number) => <li key={oi}>{o}</li>)}</ul>
                        </div>
                      )}
                      {phase.milestones?.length > 0 && (
                        <div><span className="text-xs font-medium text-muted-foreground">Milestones</span>
                          <div className="flex flex-wrap gap-1 mt-1">{phase.milestones.map((m: string, mi: number) => <Badge key={mi} variant="secondary" className="text-xs">{m}</Badge>)}</div>
                        </div>
                      )}
                      {phase.deliverables?.length > 0 && (
                        <div><span className="text-xs font-medium text-muted-foreground">Deliverables</span>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-0.5">{phase.deliverables.map((d: string, di: number) => <li key={di}>{d}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {report.userStories?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Auto-Generated User Stories</h4>
                    <div className="space-y-2">
                      {report.userStories.map((story: any, i: number) => (
                        <div key={i} className="bg-background border rounded-lg p-3">
                          <p className="text-sm italic text-muted-foreground">
                            As a <span className="font-medium text-foreground">{story.persona}</span>,
                            I want to <span className="font-medium text-foreground">{story.action}</span>,
                            so that <span className="font-medium text-foreground">{story.benefit}</span>.
                          </p>
                          {story.priority && <Badge variant="outline" className="mt-2 text-[10px]">{story.priority}</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!report.phases && !report.userStories && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{typeof report === "string" ? report : JSON.stringify(report, null, 2)}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
