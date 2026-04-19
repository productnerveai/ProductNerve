import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FlaskConical, ArrowRight, ArrowLeft, Save, Plus, Loader2, Sparkles, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

const HYPOTHESIS_SOURCES = [
  { value: "customer_feedback", label: "Customer Feedback" },
  { value: "user_interviews", label: "User Interviews" },
  { value: "feature_requests", label: "Feature Requests" },
  { value: "user_behavior", label: "User Behavior Data" },
  { value: "market_trends", label: "Market Trends" },
  { value: "competitor_analysis", label: "Competitor Analysis" },
  { value: "internal_insight", label: "Internal Product Insight" },
  { value: "growth_idea", label: "Growth Experiment Ideas" },
];

const EXPERIMENT_TYPES = [
  { value: "landing_page", label: "Landing Page Test" },
  { value: "prototype", label: "Prototype / MVP" },
  { value: "paid_ads", label: "Paid Ads Test" },
  { value: "concierge", label: "Concierge Test" },
];

const STEPS = ["Hypothesis Source", "Hypothesis Builder", "Experiment Design", "Success Metrics", "Result Analysis"];

interface Hypothesis {
  customerSegment: string;
  problem: string;
  solution: string;
  experiment: string;
  metric: string;
}

interface ExperimentDesign {
  type: string;
  audience: string;
  duration: string;
  budget: string;
  tools: string;
}

interface SuccessMetrics {
  primaryMetric: string;
  secondaryMetrics: string;
  minimumThreshold: string;
}

interface Results {
  conversionRate: string;
  userFeedback: string;
  costPerAcquisition: string;
  qualitativeInsights: string;
}

const emptyHypothesis: Hypothesis = { customerSegment: "", problem: "", solution: "", experiment: "", metric: "" };
const emptyDesign: ExperimentDesign = { type: "", audience: "", duration: "", budget: "", tools: "" };
const emptyMetrics: SuccessMetrics = { primaryMetric: "", secondaryMetrics: "", minimumThreshold: "" };
const emptyResults: Results = { conversionRate: "", userFeedback: "", costPerAcquisition: "", qualitativeInsights: "" };

const dummyExperiments = [
  {
    id: "exp1",
    title: "Landing Page Conversion Test",
    hypothesis_source: "customer_feedback,user_interviews",
    hypothesis: {
      customerSegment: "Startup founders",
      problem: "Low conversion rate on landing page",
      solution: "Simplified value proposition",
      experiment: "A/B test landing page variants",
      metric: "Conversion rate improvement"
    },
    design: {
      type: "landing_page",
      audience: "First-time visitors",
      duration: "2 weeks",
      budget: "$500",
      tools: "Google Optimize"
    },
    metrics: {
      primaryMetric: "Conversion rate",
      secondaryMetrics: "Time on page",
      minimumThreshold: "5% improvement in conversion"
    },
    results: {
      conversionRate: "5.2%",
      userFeedback: "Clearer messaging resonated better",
      costPerAcquisition: "$45",
      qualitativeInsights: "Users prefer simplified value proposition"
    },
    status: "complete",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "exp2",
    title: "Feature Request Validation",
    hypothesis_source: "feature_requests",
    hypothesis: {
      customerSegment: "Power users",
      problem: "Missing advanced analytics features",
      solution: "Add dashboard with detailed metrics",
      experiment: "Prototype testing with power users",
      metric: "Feature adoption rate"
    },
    design: {
      type: "prototype",
      audience: "Power users",
      duration: "4 weeks",
      budget: "$1000",
      tools: "Figma"
    },
    metrics: {
      primaryMetric: "Feature adoption rate",
      secondaryMetrics: "User satisfaction score",
      minimumThreshold: "70% adoption among test users"
    },
    results: {
      conversionRate: "",
      userFeedback: "",
      costPerAcquisition: "",
      qualitativeInsights: ""
    },
    status: "draft",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const dummyProjects = [
  { id: "proj1", name: "AI Project Manager" },
  { id: "proj2", name: "Customer Analytics Platform" },
  { id: "proj3", name: "Supply Chain Optimizer" }
];

export default function ExperimentEnginePage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Untitled Experiment");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hypothesisSources, setHypothesisSources] = useState<string[]>([]);
  const [hypothesis, setHypothesis] = useState<Hypothesis>(emptyHypothesis);
  const [design, setDesign] = useState<ExperimentDesign>(emptyDesign);
  const [metrics, setMetrics] = useState<SuccessMetrics>(emptyMetrics);
  const [results, setResults] = useState<Results>(emptyResults);
  const [generating, setGenerating] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading experiments and projects
    setTimeout(() => {
      setSaved(dummyExperiments);
      setProjects(dummyProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const saveExperiment = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newExperiment = {
          id: editingId || `exp${Date.now()}`,
          title,
          hypothesis_source: hypothesisSources.join(", "),
          hypothesis: hypothesis as any,
          design: design as any,
          metrics: metrics as any,
          results: results as any,
          status: results.conversionRate ? "complete" : "draft",
          workspace_id: "workspace1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {})
        };
        
        if (editingId) {
          setSaved(prev => prev.map(exp => exp.id === editingId ? newExperiment : exp));
        } else {
          setSaved(prev => [newExperiment, ...prev]);
          setEditingId(newExperiment.id);
        }
        
        toast.success("Experiment saved");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving experiment");
      setSaving(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const mockReport = {
          summary: `Experiment analysis for ${title} shows promising results. The hypothesis that ${hypothesis.solution} would address ${hypothesis.problem} for ${hypothesis.customerSegment} appears validated by the data.`,
          insights: [
            `Primary metric (${metrics.primaryMetric}) showed ${results.conversionRate || "significant"} improvement`,
            `Secondary metrics indicate positive user engagement`,
            `${results.qualitativeInsights || "User feedback supports the hypothesis"}`],
          recommendations: [
            `Scale the ${design.type} experiment to larger audience`,
            `Refine ${hypothesis.solution} based on learnings`,
            `Continue monitoring ${metrics.primaryMetric} for sustainability`],
          nextSteps: [
            `Implement winning variant across all users`,
            "Monitor metrics for 4 weeks",
            "Plan follow-up experiments"]
        };
        
        setResults(prev => ({ ...prev, qualitativeInsights: mockReport.summary }));
        toast.success("Experiment report generated!");
        setGenerating(false);
      }, 3000);
    } catch (e: any) {
      toast.error("Error generating experiment report");
      setGenerating(false);
    }
  };

  const loadExperiment = (exp: any) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setHypothesisSources(exp.hypothesis_source ? exp.hypothesis_source.split(",") : []);
    setHypothesis(exp.hypothesis || emptyHypothesis);
    setDesign(exp.design || emptyDesign);
    setMetrics(exp.metrics || emptyMetrics);
    setResults(exp.results || emptyResults);
    setStep(0);
  };

  const startNew = () => {
    setEditingId(null);
    setTitle("Untitled Experiment");
    setHypothesisSources([]);
    setHypothesis(emptyHypothesis);
    setDesign(emptyDesign);
    setMetrics(emptyMetrics);
    setResults(emptyResults);
    setStep(0);
  };

  if (!true) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Select a Workspace</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">Please select a workspace to use the Experiment Engine.</p></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-accent" />
            Experiment Engine
          </h1>
          <p className="text-muted-foreground text-sm">Convert assumptions into testable startup experiments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New</Button>
          <Button size="sm" onClick={() => saveExperiment()} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Saved Experiments</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> :
              saved?.length === 0 ? <p className="text-xs text-muted-foreground">No experiments yet.</p> :
              saved?.map((exp: any) => (
                <button key={exp.id} onClick={() => loadExperiment(exp)}
                  className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${editingId === exp.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                  <div className="font-medium truncate">{exp.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={exp.status === "complete" ? "default" : "secondary"} className="text-[10px]">{exp.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(exp.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
          </CardContent>
        </Card>

        {/* Main builder */}
        <div className="lg:col-span-3 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0" placeholder="Experiment Title..." />

          {/* Step indicator */}
          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Hypothesis Source */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hypothesis Sources</CardTitle>
                <CardDescription>Select 2–3 sources that inform this experiment hypothesis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {HYPOTHESIS_SOURCES.map((src) => {
                    const selected = hypothesisSources.includes(src.value);
                    const atLimit = hypothesisSources.length >= 3 && !selected;
                    return (
                      <label key={src.value} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected ? "border-accent bg-accent/10" : atLimit ? "border-border opacity-50 cursor-not-allowed" : "border-border hover:bg-muted/50"}`}>
                        <input type="checkbox" checked={selected} disabled={atLimit}
                          onChange={() => {
                            if (selected) setHypothesisSources(prev => prev.filter(s => s !== src.value));
                            else if (hypothesisSources.length < 3) setHypothesisSources(prev => [...prev, src.value]);
                          }}
                          className="rounded border-border" />
                        <span className="text-sm font-medium">{src.label}</span>
                      </label>
                    );
                  })}
                </div>
                {hypothesisSources.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Hypothesis derived from:</p>
                    <ul className="list-disc list-inside text-sm space-y-0.5">
                      {hypothesisSources.map(s => (
                        <li key={s}>{HYPOTHESIS_SOURCES.find(h => h.value === s)?.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Hypothesis Builder */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Hypothesis Builder</CardTitle>
                <CardDescription>Structure your assumption into a testable hypothesis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">We believe that...</Label>
                    <Input value={hypothesis.customerSegment} onChange={(e) => setHypothesis(h => ({ ...h, customerSegment: e.target.value }))} placeholder="[customer segment]" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">has the problem...</Label>
                    <Textarea value={hypothesis.problem} onChange={(e) => setHypothesis(h => ({ ...h, problem: e.target.value }))} placeholder="[problem description]" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">and will respond to...</Label>
                    <Textarea value={hypothesis.solution} onChange={(e) => setHypothesis(h => ({ ...h, solution: e.target.value }))} placeholder="[proposed solution]" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">We will test this by...</Label>
                    <Textarea value={hypothesis.experiment} onChange={(e) => setHypothesis(h => ({ ...h, experiment: e.target.value }))} placeholder="[experiment method]" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Success will be measured by...</Label>
                    <Input value={hypothesis.metric} onChange={(e) => setHypothesis(h => ({ ...h, metric: e.target.value }))} placeholder="[key metric]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Experiment Design */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Experiment Design</CardTitle>
                <CardDescription>Define how you'll run this experiment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Experiment Type</Label>
                  <Select value={design.type} onValueChange={(v) => setDesign(d => ({ ...d, type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      {EXPERIMENT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Target Audience</Label><Input value={design.audience} onChange={(e) => setDesign(d => ({ ...d, audience: e.target.value }))} placeholder="e.g., Early-stage SaaS founders" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Test Duration</Label><Input value={design.duration} onChange={(e) => setDesign(d => ({ ...d, duration: e.target.value }))} placeholder="e.g., 2 weeks" /></div>
                  <div><Label>Budget</Label><Input value={design.budget} onChange={(e) => setDesign(d => ({ ...d, budget: e.target.value }))} placeholder="e.g., $500" /></div>
                </div>
                <div><Label>Tools Required</Label><Input value={design.tools} onChange={(e) => setDesign(d => ({ ...d, tools: e.target.value }))} placeholder="e.g., Carrd, Google Ads, Typeform" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success Metrics */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
                <CardDescription>What does success look like?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Primary Metric</Label><Input value={metrics.primaryMetric} onChange={(e) => setMetrics(m => ({ ...m, primaryMetric: e.target.value }))} placeholder="e.g., Conversion rate" /></div>
                <div><Label>Secondary Metrics</Label><Textarea value={metrics.secondaryMetrics} onChange={(e) => setMetrics(m => ({ ...m, secondaryMetrics: e.target.value }))} placeholder="e.g., Email signups, Time on page, Bounce rate" /></div>
                <div><Label>Minimum Success Threshold</Label><Input value={metrics.minimumThreshold} onChange={(e) => setMetrics(m => ({ ...m, minimumThreshold: e.target.value }))} placeholder="e.g., Conversion rate > 5%" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Result Analysis */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Experiment Results</CardTitle>
                <CardDescription>Input your experiment data for analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Conversion Rate</Label><Input value={results.conversionRate} onChange={(e) => setResults(r => ({ ...r, conversionRate: e.target.value }))} placeholder="e.g., 7.2%" /></div>
                <div><Label>User Feedback</Label><Textarea value={results.userFeedback} onChange={(e) => setResults(r => ({ ...r, userFeedback: e.target.value }))} placeholder="Key feedback themes..." /></div>
                <div><Label>Cost Per Acquisition</Label><Input value={results.costPerAcquisition} onChange={(e) => setResults(r => ({ ...r, costPerAcquisition: e.target.value }))} placeholder="e.g., $12.50" /></div>
                <div><Label>Qualitative Insights</Label><Textarea value={results.qualitativeInsights} onChange={(e) => setResults(r => ({ ...r, qualitativeInsights: e.target.value }))} placeholder="What did you learn?" /></div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            <div className="flex gap-2">
              {step === 4 && (
                <>
                  <Button variant="outline" onClick={generateReport} disabled={generating}>
                    {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    Analyze Experiment
                  </Button>
                  <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><Link2 className="h-4 w-4 mr-1" />Link to Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Link to Project</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {projects?.map((p: any) => (
                          <button key={p.id} className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                            onClick={() => { saveExperiment(p.id); setLinkProjectOpen(false); }}>
                            {p.name}
                          </button>
                        ))}
                        {!projects?.length && <p className="text-sm text-muted-foreground">No projects in this workspace.</p>}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {step < 4 && (
                <Button onClick={() => setStep(s => s + 1)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>
              )}
            </div>
          </div>

          {/* Report */}
          {report && Object.keys(report).length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Experiment Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.validationStatus && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Hypothesis Status:</span>
                    <Badge variant={report.validationStatus === "Validated" ? "default" : report.validationStatus === "Partially Validated" ? "secondary" : "destructive"} className="text-sm">
                      {report.validationStatus}
                    </Badge>
                  </div>
                )}
                {report.recommendation && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">Recommendation:</span>
                    <Badge className={`text-sm ${
                      report.recommendation === "Proceed" ? "bg-green-600" :
                      report.recommendation === "Iterate" ? "bg-yellow-600" :
                      report.recommendation === "Pivot" ? "bg-orange-600" : "bg-destructive"
                    }`}>
                      {report.recommendation}
                    </Badge>
                  </div>
                )}
                {report.summary && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Strategic Insight Summary</h4>
                    <p className="text-sm text-muted-foreground">{report.summary}</p>
                  </div>
                )}
                {report.nextActions?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Next Actions</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {report.nextActions.map((a: string, i: number) => <li key={i}>{a}</li>)}
                    </ul>
                  </div>
                )}
                {report.riskFlags?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Risk Flags</h4>
                    <div className="flex flex-wrap gap-1">
                      {report.riskFlags.map((f: string, i: number) => <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>)}
                    </div>
                  </div>
                )}
                {!report.validationStatus && !report.recommendation && (
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
