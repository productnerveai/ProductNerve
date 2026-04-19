import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TrendingUp, ArrowRight, ArrowLeft, Save, Plus, Loader2, Sparkles, Link2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CHANNELS = [
  { id: "organic_search", label: "Organic Search / SEO" },
  { id: "social_media", label: "Social Media" },
  { id: "community", label: "Community Marketing" },
  { id: "paid_acquisition", label: "Paid Acquisition" },
  { id: "partnerships", label: "Partnerships" },
  { id: "referrals", label: "Referrals" },
  { id: "content_marketing", label: "Content Marketing" },
];

const STEPS = ["ICP Selection", "Growth Channels", "Growth Forecast", "Experiment Design"];

interface ForecastInputs {
  targetUsers: string;
  expectedCAC: string;
  conversionRate: string;
  arpu: string;
  timeframeMonths: string;
}

interface ICPSource {
  type: "existing" | "manual";
  icpId?: string;
  manualDescription?: string;
  segment?: string;
}

const dummyGrowthPlans = [
  {
    id: "growth1",
    title: "SaaS Startup Growth Plan",
    icp_source: { type: "existing", icpId: "icp1" },
    channels: ["organic_search", "social_media", "content_marketing"],
    forecast: {
      targetUsers: "10000",
      expectedCAC: "$50",
      conversionRate: "3%",
      arpu: "$100",
      timeframeMonths: "12"
    },
    experiment: {
      hypothesis: "Content marketing will drive qualified leads",
      methodology: "Blog posts + SEO optimization",
      duration: "6 months",
      budget: "$5000",
      successMetrics: "50% increase in organic traffic"
    },
    report: {
      summary: "Comprehensive growth strategy focusing on content marketing and SEO",
      channels: [
        {
          name: "Organic Search",
          priority: "High",
          expectedCAC: "$45",
          timeline: "3-6 months",
          resources: "SEO tools, content writers"
        },
        {
          name: "Social Media",
          priority: "Medium",
          expectedCAC: "$60",
          timeline: "2-4 months",
          resources: "Social media manager, ad budget"
        }
      ],
      forecast: {
        month1: 100,
        month3: 500,
        month6: 2000,
        month12: 10000
      }
    },
    status: "complete",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "growth2",
    title: "E-commerce Growth Strategy",
    icp_source: { type: "manual", manualDescription: "Online shoppers aged 25-45" },
    channels: ["paid_acquisition", "partnerships"],
    forecast: {
      targetUsers: "50000",
      expectedCAC: "$30",
      conversionRate: "5%",
      arpu: "$150",
      timeframeMonths: "18"
    },
    experiment: {
      hypothesis: "Paid ads will accelerate customer acquisition",
      methodology: "Google Ads + Facebook Ads testing",
      duration: "3 months",
      budget: "$10000",
      successMetrics: "CAC under $35"
    },
    report: null,
    status: "draft",
    workspace_id: "workspace1",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const dummyICPProfiles = [
  { id: "icp1", title: "SaaS Startup ICP" },
  { id: "icp2", title: "E-commerce ICP" },
  { id: "icp3", title: "B2B Enterprise ICP" }
];

const dummyProjects = [
  { id: "proj1", name: "AI Project Manager" },
  { id: "proj2", name: "Customer Analytics Platform" },
  { id: "proj3", name: "Supply Chain Optimizer" }
];

export default function GrowthEnginePage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Untitled Growth Plan");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [icpSource, setIcpSource] = useState<ICPSource>({ type: "existing" });
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [forecast, setForecast] = useState<ForecastInputs>({ targetUsers: "", expectedCAC: "", conversionRate: "", arpu: "", timeframeMonths: "" });
  const [experiment, setExperiment] = useState({ hypothesis: "", methodology: "", duration: "", budget: "", successMetrics: "" });
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const [icpProfiles, setIcpProfiles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setSaved(dummyGrowthPlans);
      setIcpProfiles(dummyICPProfiles);
      setProjects(dummyProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const saveGrowthPlan = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newGrowthPlan = {
          id: editingId || `growth${Date.now()}`,
          title,
          icp_source: icpSource as any,
          channels: selectedChannels,
          forecast: forecast as any,
          experiment: experiment as any,
          report: report || {},
          status: report ? "complete" : "draft",
          workspace_id: "workspace1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {})
        };

        if (editingId) {
          setSaved(prev => prev.map(plan => plan.id === editingId ? newGrowthPlan : plan));
        } else {
          setSaved(prev => [newGrowthPlan, ...prev]);
          setEditingId(newGrowthPlan.id);
        }

        toast.success("Growth plan saved");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving growth plan");
      setSaving(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const mockReport = {
          summary: `Growth strategy for ${icpSource.type === 'existing' ? 'selected ICP' : 'manual ICP description'} focusing on ${selectedChannels.length} key channels. Expected to reach ${forecast.targetUsers} users in ${forecast.timeframeMonths} months.`,
          channels: selectedChannels.map(channelId => {
            const channel = CHANNELS.find(c => c.id === channelId);
            return {
              name: channel?.label || channelId,
              priority: "High",
              expectedCAC: forecast.expectedCAC || "$50",
              timeline: "3-6 months",
              resources: "Marketing team, budget allocation"
            };
          }),
          forecast: {
            month1: Math.floor(parseInt(forecast.targetUsers || "1000") * 0.1),
            month3: Math.floor(parseInt(forecast.targetUsers || "1000") * 0.3),
            month6: Math.floor(parseInt(forecast.targetUsers || "1000") * 0.6),
            month12: parseInt(forecast.targetUsers || "1000")
          },
          recommendations: [
            `Focus on ${selectedChannels[0]} as primary acquisition channel`,
            "Optimize conversion funnel to improve CAC",
            "Scale successful channels after 3 months"
          ]
        };

        setReport(mockReport);
        toast.success("Growth plan generated!");
        setGenerating(false);
      }, 3000);
    } catch (e: any) {
      toast.error("Error generating growth plan");
      setGenerating(false);
    }
  };

  const loadPlan = (plan: any) => {
    setEditingId(plan.id);
    setTitle(plan.title);
    setIcpSource(plan.icp_source || { type: "manual", manualDescription: "" });
    setSelectedChannels(plan.channels || []);
    setForecast(plan.forecast || { targetUsers: "", expectedCAC: "", conversionRate: "", arpu: "", timeframeMonths: "" });
    setExperiment(plan.experiment || { hypothesis: "", methodology: "", duration: "", budget: "", successMetrics: "" });
    setReport(plan.report || null);
    setStep(0);
  };

  const startNew = () => {
    setEditingId(null);
    setTitle("Untitled Growth Plan");
    setIcpSource({ type: "manual", manualDescription: "" });
    setSelectedChannels([]);
    setForecast({ targetUsers: "", expectedCAC: "", conversionRate: "", arpu: "", timeframeMonths: "" });
    setExperiment({ hypothesis: "", methodology: "", duration: "", budget: "", successMetrics: "" });
    setReport(null);
    setStep(0);
  };

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  // Simple client-side projections
  const projections = (() => {
    const target = parseInt(forecast.targetUsers) || 0;
    const cac = parseFloat(forecast.expectedCAC) || 0;
    const conv = parseFloat(forecast.conversionRate) || 0;
    const arpu = parseFloat(forecast.arpu) || 0;
    const months = parseInt(forecast.timeframeMonths) || 12;
    if (!target || !months) return null;
    const monthlyGrowth = target / months;
    const totalCost = target * cac;
    const monthlyRevenue = target * arpu;
    const ltv = arpu * 12;
    return { monthlyGrowth: Math.round(monthlyGrowth), totalCost, monthlyRevenue, ltv, ltvCacRatio: cac > 0 ? (ltv / cac).toFixed(1) : "N/A", paybackMonths: arpu > 0 ? Math.ceil(cac / arpu) : 0 };
  })();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md"><CardHeader><CardTitle>Loading...</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">Please wait while we load your growth plans.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="h-6 w-6 text-accent" />Growth Engine</h1>
          <p className="text-muted-foreground text-sm">Design structured growth strategies from ICP to forecast to experiments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New</Button>
          <Button size="sm" onClick={() => saveGrowthPlan()} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Saved Plans</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {saved?.length === 0 ? <p className="text-xs text-muted-foreground">No growth plans yet.</p> :
              saved?.map((p: any) => (
                <button key={p.id} onClick={() => loadPlan(p)}
                  className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${editingId === p.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={p.status === "complete" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0" placeholder="Growth Plan Title..." />

          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* Step 1: ICP Selection */}
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle>ICP Selection</CardTitle><CardDescription>Choose your target customer profile for this growth strategy.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Source</Label>
                  <Select value={icpSource.type} onValueChange={(v: "existing" | "manual") => setIcpSource(s => ({ ...s, type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="existing">From ICP Builder</SelectItem>
                      <SelectItem value="manual">Define Manually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {icpSource.type === "existing" && (
                  <div>
                    <Label>Select ICP</Label>
                    <Select value={icpSource.icpId || ""} onValueChange={(v) => setIcpSource(s => ({ ...s, icpId: v }))}>
                      <SelectTrigger><SelectValue placeholder="Choose an ICP..." /></SelectTrigger>
                      <SelectContent>
                        {icpProfiles?.map((icp: any) => (
                          <SelectItem key={icp.id} value={icp.id}>{icp.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!icpProfiles?.length && <p className="text-xs text-muted-foreground mt-1">No ICPs found. Create one in the ICP Builder first.</p>}
                  </div>
                )}
                {icpSource.type === "manual" && (
                  <>
                    <div><Label>Target Customer Segment</Label><Input value={icpSource.segment || ""} onChange={(e) => setIcpSource(s => ({ ...s, segment: e.target.value }))} placeholder="e.g., Early-stage SaaS founders" /></div>
                    <div><Label>Description</Label><Textarea value={icpSource.manualDescription || ""} onChange={(e) => setIcpSource(s => ({ ...s, manualDescription: e.target.value }))} placeholder="Describe your ideal customer..." /></div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Growth Channels */}
          {step === 1 && (
            <Card>
              <CardHeader><CardTitle>Growth Channel Discovery</CardTitle><CardDescription>Select channels to explore for this growth strategy.</CardDescription></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {CHANNELS.map((ch) => (
                    <label key={ch.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedChannels.includes(ch.id) ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                      <Checkbox checked={selectedChannels.includes(ch.id)} onCheckedChange={() => toggleChannel(ch.id)} />
                      <span className="text-sm font-medium">{ch.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Growth Forecast */}
          {step === 2 && (
            <Card>
              <CardHeader><CardTitle>Growth Forecast</CardTitle><CardDescription>Input your growth assumptions for projections.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Target Users</Label><Input type="number" value={forecast.targetUsers} onChange={(e) => setForecast(f => ({ ...f, targetUsers: e.target.value }))} placeholder="e.g., 1000" /></div>
                  <div><Label>Expected CAC ($)</Label><Input type="number" value={forecast.expectedCAC} onChange={(e) => setForecast(f => ({ ...f, expectedCAC: e.target.value }))} placeholder="e.g., 25" /></div>
                  <div><Label>Conversion Rate (%)</Label><Input type="number" value={forecast.conversionRate} onChange={(e) => setForecast(f => ({ ...f, conversionRate: e.target.value }))} placeholder="e.g., 3" /></div>
                  <div><Label>Avg Revenue Per User ($)</Label><Input type="number" value={forecast.arpu} onChange={(e) => setForecast(f => ({ ...f, arpu: e.target.value }))} placeholder="e.g., 29" /></div>
                  <div><Label>Timeframe (months)</Label><Input type="number" value={forecast.timeframeMonths} onChange={(e) => setForecast(f => ({ ...f, timeframeMonths: e.target.value }))} placeholder="12" /></div>
                </div>

                {projections && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">Monthly User Growth</div>
                      <div className="text-xl font-bold text-primary">{projections.monthlyGrowth}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">Total Acquisition Cost</div>
                      <div className="text-xl font-bold">${projections.totalCost.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">Monthly Revenue (at target)</div>
                      <div className="text-xl font-bold text-accent">${projections.monthlyRevenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">LTV:CAC Ratio</div>
                      <div className="text-xl font-bold">{projections.ltvCacRatio}x</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">Payback Period</div>
                      <div className="text-xl font-bold">{projections.paybackMonths} mo</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 border">
                      <div className="text-xs text-muted-foreground">Est. LTV</div>
                      <div className="text-xl font-bold">${projections.ltv.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Experiment Design */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Growth Experiment Roadmap</CardTitle>
                <CardDescription>Generate an AI-powered growth experiment plan based on your inputs.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={generateReport} disabled={generating} className="w-full">
                  {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Generate Growth Strategy Blueprint
                </Button>
                <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full"><Link2 className="h-4 w-4 mr-2" />Link to Project</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Link to Project</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                      {projects?.map((p: any) => (
                        <button key={p.id} className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                          onClick={() => { saveGrowthPlan(p.id); setLinkProjectOpen(false); }}>{p.name}</button>
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
            {step < 3 && <Button onClick={() => setStep(s => s + 1)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>}
          </div>

          {/* Report */}
          {report && Object.keys(report).length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Growth Strategy Blueprint</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                {report.strategyOverview && <div><h4 className="text-sm font-semibold mb-1">Strategy Overview</h4><p className="text-sm text-muted-foreground">{report.strategyOverview}</p></div>}
                {report.channelPriority?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Channel Priority Map</h4>
                    <div className="space-y-2">
                      {report.channelPriority.map((ch: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-background rounded-lg p-3 border">
                          <div><span className="font-medium text-sm">{ch.channel}</span><p className="text-xs text-muted-foreground">{ch.rationale}</p></div>
                          <Badge variant={ch.priority === "High" ? "default" : "secondary"}>{ch.priority}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.experiments?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Growth Experiments</h4>
                    <div className="space-y-2">
                      {report.experiments.map((exp: any, i: number) => (
                        <div key={i} className="bg-background rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{exp.name}</span>
                            {exp.timeline && <Badge variant="outline" className="text-xs">{exp.timeline}</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{exp.description}</p>
                          {exp.expectedOutcome && <p className="text-xs text-accent mt-1">Expected: {exp.expectedOutcome}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {report.acquisitionTimeline && <div><h4 className="text-sm font-semibold mb-1">Acquisition Timeline</h4><p className="text-sm text-muted-foreground">{report.acquisitionTimeline}</p></div>}
                {report.revenueProjection && <div><h4 className="text-sm font-semibold mb-1">Revenue Projection</h4><p className="text-sm text-muted-foreground">{report.revenueProjection}</p></div>}
                {!report.strategyOverview && !report.channelPriority && (
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
