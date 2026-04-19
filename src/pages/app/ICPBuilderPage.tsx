import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, ArrowRight, ArrowLeft, Save, FileDown, Link2, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Types
interface ICPSegment {
  name: string;
  jobRole: string;
  industry: string;
  companySize: string;
  geography: string;
  incomeLevel: string;
  painProfile: {
    topProblems: string[];
    currentWorkaround: string;
    costOfProblem: string;
    urgencyLevel: string;
    emotionalTrigger: string;
  };
  buyingBehavior: {
    decisionMaker: string;
    budgetAuthority: string;
    buyingTriggers: string;
    buyingFrequency: string;
    priceSensitivity: string;
  };
  channelDiscovery: {
    communities: string;
    socialPlatforms: string;
    searchBehavior: string;
    industryEvents: string;
    referrals: string;
  };
}

interface ProductContext {
  product: string;
  coreProblem: string;
  whoExperiences: string;
  industriesAffected: string;
}

const emptySegment: ICPSegment = {
  name: "", jobRole: "", industry: "", companySize: "", geography: "", incomeLevel: "",
  painProfile: { topProblems: ["", "", ""], currentWorkaround: "", costOfProblem: "", urgencyLevel: "medium", emotionalTrigger: "" },
  buyingBehavior: { decisionMaker: "", budgetAuthority: "", buyingTriggers: "", buyingFrequency: "", priceSensitivity: "medium" },
  channelDiscovery: { communities: "", socialPlatforms: "", searchBehavior: "", industryEvents: "", referrals: "" },
};

const STEPS = ["Product Context", "Segment Identification", "Pain Profile", "Buying Behavior", "Channel Discovery"];

// Dummy data
const dummyUser = { id: "user123" };
const dummyWorkspace = { id: "workspace1", name: "Default Workspace" };

const dummyICPs = [
  {
    id: "icp1",
    title: "SaaS Startup ICP",
    product_context: {
      product: "AI-powered project management tool",
      coreProblem: "Inefficient team collaboration and project tracking",
      whoExperiences: "Tech startups and remote teams",
      industriesAffected: "SaaS, Technology, Consulting"
    },
    segments: [],
    report: {
      segments: [
        {
          name: "Technical Founders",
          painIntensityScore: 85,
          purchaseProbability: 78,
          revenuePotential: "High",
          personaSummary: "Early-stage technical founders looking for scalable solutions",
          bestChannels: ["LinkedIn", "TechCrunch", "Y Combinator"],
          strategicInsights: "Focus on technical integration capabilities and scalability features"
        }
      ]
    },
    status: "complete",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "icp2",
    title: "E-commerce ICP",
    product_context: {
      product: "Customer analytics platform",
      coreProblem: "Limited customer insights and personalization",
      whoExperiences: "E-commerce businesses",
      industriesAffected: "Retail, E-commerce, D2C"
    },
    segments: [],
    report: null,
    status: "draft",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const dummyProjects = [
  { id: "proj1", name: "AI Project Manager" },
  { id: "proj2", name: "Customer Analytics Platform" },
  { id: "proj3", name: "Supply Chain Optimizer" }
];

export default function ICPBuilderPage() {
  const [step, setStep] = useState(0);
  const [productContext, setProductContext] = useState<ProductContext>({ product: "", coreProblem: "", whoExperiences: "", industriesAffected: "" });
  const [segments, setSegments] = useState<ICPSegment[]>([{ ...emptySegment }]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled ICP");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [savedICPs, setSavedICPs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingICPs, setLoadingICPs] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading saved ICPs and projects
    setTimeout(() => {
      setSavedICPs(dummyICPs);
      setProjects(dummyProjects);
      setLoadingICPs(false);
    }, 1000);
  }, []);

  const saveICP = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newICP = {
          id: editingId || `icp${Date.now()}`,
          title,
          product_context: productContext,
          segments,
          report: report || {},
          status: report ? "complete" : "draft",
          created_at: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {})
        };
        
        if (editingId) {
          setSavedICPs(prev => prev.map(icp => icp.id === editingId ? newICP : icp));
        } else {
          setSavedICPs(prev => [newICP, ...prev]);
          setEditingId(newICP.id);
        }
        
        toast.success("ICP saved successfully");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving ICP");
      setSaving(false);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const mockReport = {
          segments: segments.map((seg, i) => ({
            name: seg.name || `ICP ${i + 1}`,
            painIntensityScore: Math.floor(Math.random() * 30) + 70,
            purchaseProbability: Math.floor(Math.random() * 40) + 60,
            revenuePotential: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
            personaSummary: `Detailed persona summary for ${seg.name || `ICP ${i + 1}`} based on analysis of pain points and buying behavior.`,
            bestChannels: seg.channelDiscovery.communities?.split(", ").slice(0, 3) || ["LinkedIn", "Twitter", "Industry Events"],
            strategicInsights: `Strategic recommendation: Focus on ${seg.painProfile.topProblems[0] || "primary pain points"} and leverage ${seg.channelDiscovery.socialPlatforms || "key channels"} for acquisition.`
          }))
        };
        setReport(mockReport);
        toast.success("ICP Report generated!");
        setGenerating(false);
      }, 2000);
    } catch (e: any) {
      toast.error("Error generating report");
      setGenerating(false);
    }
  };

  const loadICP = (icp: any) => {
    setEditingId(icp.id);
    setTitle(icp.title);
    setProductContext(icp.product_context || { product: "", coreProblem: "", whoExperiences: "", industriesAffected: "" });
    setSegments(icp.segments?.length ? icp.segments : [{ ...emptySegment }]);
    setReport(icp.report && Object.keys(icp.report).length > 0 ? icp.report : null);
    setStep(0);
    setActiveSegment(0);
  };

  const startNew = () => {
    setEditingId(null);
    setTitle("Untitled ICP");
    setProductContext({ product: "", coreProblem: "", whoExperiences: "", industriesAffected: "" });
    setSegments([{ ...emptySegment }]);
    setReport(null);
    setStep(0);
    setActiveSegment(0);
  };

  const addSegment = () => {
    if (segments.length >= 3) return toast({ title: "Maximum 3 ICP segments allowed" });
    setSegments([...segments, { ...emptySegment }]);
    setActiveSegment(segments.length);
  };

  const removeSegment = (i: number) => {
    if (segments.length <= 1) return;
    const next = segments.filter((_, idx) => idx !== i);
    setSegments(next);
    setActiveSegment(Math.min(activeSegment, next.length - 1));
  };

  const updateSegment = (field: string, value: any) => {
    setSegments(prev => prev.map((s, i) => i === activeSegment ? { ...s, [field]: value } : s));
  };

  const updateNested = (group: "painProfile" | "buyingBehavior" | "channelDiscovery", field: string, value: any) => {
    setSegments(prev => prev.map((s, i) => i === activeSegment ? { ...s, [group]: { ...s[group], [field]: value } } : s));
  };

  const seg = segments[activeSegment] || emptySegment;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            ICP Builder
          </h1>
          <p className="text-muted-foreground text-sm">Design structured Ideal Customer Profiles for your venture.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New ICP</Button>
          <Button size="sm" onClick={() => saveICP()} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved ICPs sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Saved ICPs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingICPs ? (
              <p className="text-xs text-muted-foreground">Loading...</p>
            ) : savedICPs?.length === 0 ? (
              <p className="text-xs text-muted-foreground">No ICPs yet. Create your first one!</p>
            ) : (
              savedICPs?.map((icp: any) => (
                <button
                  key={icp.id}
                  onClick={() => loadICP(icp)}
                  className={`w-full text-left p-2 rounded-md border text-sm transition-colors ${editingId === icp.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}
                >
                  <div className="font-medium truncate">{icp.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={icp.status === "complete" ? "default" : "secondary"} className="text-[10px]">
                      {icp.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(icp.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Main builder */}
        <div className="lg:col-span-3 space-y-4">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
            placeholder="ICP Title..."
          />

          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] border border-current">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* Step 1: Product Context */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Context</CardTitle>
                <CardDescription>Tell us about the product or idea you're building.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label>What product or idea are you building?</Label><Textarea value={productContext.product} onChange={(e) => setProductContext(p => ({ ...p, product: e.target.value }))} placeholder="Describe your product..." /></div>
                <div><Label>What core problem does it solve?</Label><Textarea value={productContext.coreProblem} onChange={(e) => setProductContext(p => ({ ...p, coreProblem: e.target.value }))} placeholder="The main problem..." /></div>
                <div><Label>Who experiences this problem most?</Label><Input value={productContext.whoExperiences} onChange={(e) => setProductContext(p => ({ ...p, whoExperiences: e.target.value }))} placeholder="e.g., Early-stage founders, SMB owners..." /></div>
                <div><Label>Which industries or user types are most affected?</Label><Input value={productContext.industriesAffected} onChange={(e) => setProductContext(p => ({ ...p, industriesAffected: e.target.value }))} placeholder="e.g., SaaS, E-commerce, FinTech..." /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Segment Identification */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Segment Identification</CardTitle>
                    <CardDescription>Define up to 3 ICP segments.</CardDescription>
                  </div>
                  {segments.length < 3 && (
                    <Button size="sm" variant="outline" onClick={addSegment}><Plus className="h-3 w-3 mr-1" />Add Segment</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={String(activeSegment)} onValueChange={(v) => setActiveSegment(Number(v))}>
                  <div className="flex items-center gap-2 mb-4">
                    <TabsList>
                      {segments.map((s, i) => (
                        <TabsTrigger key={i} value={String(i)}>ICP {i + 1}{s.name ? `: ${s.name}` : ""}</TabsTrigger>
                      ))}
                    </TabsList>
                    {segments.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeSegment(activeSegment)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    )}
                  </div>
                  {segments.map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Segment Name</Label><Input value={seg.name} onChange={(e) => updateSegment("name", e.target.value)} placeholder="e.g., Technical Founders" /></div>
                        <div><Label>Job Role / Persona</Label><Input value={seg.jobRole} onChange={(e) => updateSegment("jobRole", e.target.value)} placeholder="e.g., CTO, Product Manager" /></div>
                        <div><Label>Industry</Label><Input value={seg.industry} onChange={(e) => updateSegment("industry", e.target.value)} placeholder="e.g., SaaS, FinTech" /></div>
                        <div><Label>Company Size</Label><Input value={seg.companySize} onChange={(e) => updateSegment("companySize", e.target.value)} placeholder="e.g., 1-10 employees" /></div>
                        <div><Label>Geography</Label><Input value={seg.geography} onChange={(e) => updateSegment("geography", e.target.value)} placeholder="e.g., North America, Global" /></div>
                        <div><Label>Income / Revenue Level</Label><Input value={seg.incomeLevel} onChange={(e) => updateSegment("incomeLevel", e.target.value)} placeholder="e.g., $50K-$200K ARR" /></div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Pain Profile */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Pain Profile — {seg.name || `ICP ${activeSegment + 1}`}</CardTitle>
                <CardDescription>What keeps this customer up at night?</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={String(activeSegment)} onValueChange={(v) => setActiveSegment(Number(v))}>
                  <TabsList className="mb-4">
                    {segments.map((s, i) => <TabsTrigger key={i} value={String(i)}>ICP {i + 1}</TabsTrigger>)}
                  </TabsList>
                  {segments.map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="space-y-4">
                      <div><Label>Top 3 Problems</Label>
                        {seg.painProfile.topProblems.map((p, pi) => (
                          <Input key={pi} value={p} onChange={(e) => {
                            const probs = [...seg.painProfile.topProblems];
                            probs[pi] = e.target.value;
                            updateNested("painProfile", "topProblems", probs);
                          }} placeholder={`Problem ${pi + 1}`} className="mt-1" />
                        ))}
                      </div>
                      <div><Label>Current Workaround</Label><Textarea value={seg.painProfile.currentWorkaround} onChange={(e) => updateNested("painProfile", "currentWorkaround", e.target.value)} placeholder="How do they currently solve this?" /></div>
                      <div><Label>Cost of Problem</Label><Input value={seg.painProfile.costOfProblem} onChange={(e) => updateNested("painProfile", "costOfProblem", e.target.value)} placeholder="e.g., $5K/month in lost productivity" /></div>
                      <div><Label>Urgency Level</Label>
                        <Select value={seg.painProfile.urgencyLevel} onValueChange={(v) => updateNested("painProfile", "urgencyLevel", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>Emotional Trigger</Label><Input value={seg.painProfile.emotionalTrigger} onChange={(e) => updateNested("painProfile", "emotionalTrigger", e.target.value)} placeholder="e.g., Frustration with manual processes" /></div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Buying Behavior */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Buying Behavior — {seg.name || `ICP ${activeSegment + 1}`}</CardTitle>
                <CardDescription>How does this customer buy?</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={String(activeSegment)} onValueChange={(v) => setActiveSegment(Number(v))}>
                  <TabsList className="mb-4">
                    {segments.map((s, i) => <TabsTrigger key={i} value={String(i)}>ICP {i + 1}</TabsTrigger>)}
                  </TabsList>
                  {segments.map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="space-y-4">
                      <div><Label>Who makes the buying decision?</Label><Input value={seg.buyingBehavior.decisionMaker} onChange={(e) => updateNested("buyingBehavior", "decisionMaker", e.target.value)} placeholder="e.g., CEO, Head of Product" /></div>
                      <div><Label>Budget Authority</Label><Input value={seg.buyingBehavior.budgetAuthority} onChange={(e) => updateNested("buyingBehavior", "budgetAuthority", e.target.value)} placeholder="e.g., $500/mo without approval" /></div>
                      <div><Label>Buying Trigger Events</Label><Textarea value={seg.buyingBehavior.buyingTriggers} onChange={(e) => updateNested("buyingBehavior", "buyingTriggers", e.target.value)} placeholder="What events trigger a purchase?" /></div>
                      <div><Label>Buying Frequency</Label><Input value={seg.buyingBehavior.buyingFrequency} onChange={(e) => updateNested("buyingBehavior", "buyingFrequency", e.target.value)} placeholder="e.g., Monthly subscription" /></div>
                      <div><Label>Price Sensitivity</Label>
                        <Select value={seg.buyingBehavior.priceSensitivity} onValueChange={(v) => updateNested("buyingBehavior", "priceSensitivity", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low — Will pay premium</SelectItem>
                            <SelectItem value="medium">Medium — Price-conscious</SelectItem>
                            <SelectItem value="high">High — Very price-sensitive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Channel Discovery */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Channel Discovery — {seg.name || `ICP ${activeSegment + 1}`}</CardTitle>
                <CardDescription>Where does this customer live online?</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={String(activeSegment)} onValueChange={(v) => setActiveSegment(Number(v))}>
                  <TabsList className="mb-4">
                    {segments.map((s, i) => <TabsTrigger key={i} value={String(i)}>ICP {i + 1}</TabsTrigger>)}
                  </TabsList>
                  {segments.map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="space-y-4">
                      <div><Label>Communities</Label><Input value={seg.channelDiscovery.communities} onChange={(e) => updateNested("channelDiscovery", "communities", e.target.value)} placeholder="e.g., Indie Hackers, Reddit r/startups" /></div>
                      <div><Label>Social Platforms</Label><Input value={seg.channelDiscovery.socialPlatforms} onChange={(e) => updateNested("channelDiscovery", "socialPlatforms", e.target.value)} placeholder="e.g., LinkedIn, Twitter/X" /></div>
                      <div><Label>Search Behavior</Label><Input value={seg.channelDiscovery.searchBehavior} onChange={(e) => updateNested("channelDiscovery", "searchBehavior", e.target.value)} placeholder="e.g., 'how to validate startup idea'" /></div>
                      <div><Label>Industry Events</Label><Input value={seg.channelDiscovery.industryEvents} onChange={(e) => updateNested("channelDiscovery", "industryEvents", e.target.value)} placeholder="e.g., SaaStr, TechCrunch Disrupt" /></div>
                      <div><Label>Referrals</Label><Input value={seg.channelDiscovery.referrals} onChange={(e) => updateNested("channelDiscovery", "referrals", e.target.value)} placeholder="e.g., VC networks, accelerators" /></div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Navigation + Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" />Previous
            </Button>
            <div className="flex gap-2">
              {step === 4 && (
                <>
                  <Button variant="outline" onClick={generateReport} disabled={generating}>
                    {generating ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    Generate Report
                  </Button>
                  <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><Link2 className="h-4 w-4 mr-1" />Link to Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Link ICP to Project</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {projects?.map((p: any) => (
                          <button
                            key={p.id}
                            className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                            onClick={() => {
                              saveICP(p.id);
                              setLinkProjectOpen(false);
                            }}
                          >
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
                <Button onClick={() => setStep(s => s + 1)}>
                  Next<ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          {/* Report Display */}
          {report && Object.keys(report).length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  Strategic ICP Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(report.segments) ? report.segments.map((sr: any, i: number) => (
                  <div key={i} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-3">{sr.name || `ICP ${i + 1}`}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {sr.painIntensityScore != null && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Pain Intensity</div>
                          <div className="text-2xl font-bold text-primary">{sr.painIntensityScore}/100</div>
                        </div>
                      )}
                      {sr.purchaseProbability != null && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Purchase Probability</div>
                          <div className="text-2xl font-bold text-accent">{sr.purchaseProbability}%</div>
                        </div>
                      )}
                      {sr.revenuePotential && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Revenue Potential</div>
                          <div className="text-lg font-bold">{sr.revenuePotential}</div>
                        </div>
                      )}
                    </div>
                    {sr.personaSummary && <p className="mt-3 text-sm text-muted-foreground">{sr.personaSummary}</p>}
                    {sr.bestChannels?.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-muted-foreground">Best Channels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sr.bestChannels.map((c: string, ci: number) => <Badge key={ci} variant="secondary">{c}</Badge>)}
                        </div>
                      </div>
                    )}
                    {sr.strategicInsights && <p className="mt-3 text-sm border-l-2 border-accent pl-3 italic">{sr.strategicInsights}</p>}
                  </div>
                )) : (
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
