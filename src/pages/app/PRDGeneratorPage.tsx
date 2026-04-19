import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { FileText, ArrowRight, ArrowLeft, Save, Plus, Loader2, Sparkles, Link2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ToolGate from "@/components/tools/ToolGate";

const STEPS = ["PRD Type", "Product Context", "Strategic Context", "Product Definition", "Execution Context", "Generate"];

const PRD_TYPES = [
  { value: "simple", label: "Simple PRD", description: "Product clarity, internal alignment, early-stage definition." },
  { value: "growth", label: "Growth PRD", description: "Acquisition strategy, engagement design, monetization planning." },
  { value: "technical", label: "Technical PRD", description: "Engineering planning, system architecture, infrastructure design." },
];

const SECTION_LABELS: Record<string, string> = {
  productInformation: "Product Information",
  goalsAndObjectives: "Goals & Objectives",
  targetUsers: "Target Users",
  problemStatement: "Problem Statement",
  valueProposition: "Value Proposition",
  assumptions: "Assumptions",
  constraints: "Constraints",
  backgroundAndStrategicFit: "Background & Strategic Fit",
  productRoadmap: "Product Roadmap",
  scope: "Scope (User Stories)",
  coreFeatures: "Core Features",
  releaseCriteria: "Release Criteria",
  successMetrics: "Success Metrics",
  dependencies: "Dependencies",
  risks: "Risks",
  exclusions: "Exclusions",
  strategicNote: "Strategic Note",
  growthGoals: "Growth Goals",
  icpDefinition: "ICP Definition",
  acquisitionChannels: "Acquisition Channels",
  conversionStrategy: "Conversion Strategy",
  retentionStrategy: "Retention Strategy",
  monetizationModel: "Monetization Model",
  growthAssumptions: "Growth Assumptions",
  growthConstraints: "Growth Constraints",
  strategicGrowthFit: "Strategic Growth Fit",
  growthRoadmap: "Growth Roadmap",
  userLifecycleScope: "User Lifecycle Scope",
  growthFeatures: "Growth Features",
  technicalGrowthRequirements: "Technical Growth Requirements",
  experimentationPlan: "Experimentation Plan",
  growthRisks: "Growth Risks",
  technicalObjectives: "Technical Objectives",
  coreProductFeatures: "Core Product Features",
  technicalSpecifications: "Technical Specifications",
  coreTechnicalComponents: "Core Technical Components",
  apiArchitecture: "API Architecture",
  dataArchitecture: "Data Architecture",
  featureLevelTechnicalConsiderations: "Feature-Level Technical Considerations",
  systemArchitecturePrinciples: "System Architecture Principles",
  highLevelArchitecture: "High-Level Architecture",
  securityModel: "Security Model",
  performanceTargets: "Performance Targets",
  scalabilityStrategy: "Scalability Strategy",
  integrationRequirements: "Integration Requirements",
};

// Dummy data
const dummyUser = { id: "user123" };
const dummyWorkspace = { id: "workspace1", name: "Default Workspace" };

const dummyPRDs = [
  {
    id: "prd1",
    title: "AI Project Manager PRD",
    prd_type: "simple",
    product_context: {
      productName: "AI Project Manager",
      productDescription: "AI-powered project management tool for startups",
      problemSolved: "Inefficient team collaboration and project tracking",
      targetUsers: "Startup founders and project managers",
      businessGoal: "Achieve product-market fit in 6 months"
    },
    strategic_context: {
      marketOpportunity: "$50B project management market with 15% CAGR",
      keyAssumptions: "Teams will adopt AI for productivity gains",
      constraints: "Limited engineering resources",
      risks: "Competition from established players"
    },
    product_definition: {
      coreFeatures: "AI task assignment, automated reporting, team analytics",
      userFlows: "Onboarding → Project creation → AI recommendations",
      valueProp: "Reduce project management overhead by 40%"
    },
    execution_context: {
      timeline: "6 months",
      teamSize: "4 engineers, 1 designer, 1 PM",
      technicalComplexity: "Medium"
    },
    report: {
      productInformation: "AI Project Manager is a cutting-edge solution...",
      goalsAndObjectives: "Primary goal: Streamline project management workflows...",
      targetUsers: "Startup teams, SMB project managers, remote teams..."
    },
    status: "complete",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "prd2",
    title: "E-commerce Analytics PRD",
    prd_type: "growth",
    product_context: {
      productName: "Customer Analytics Platform",
      productDescription: "Real-time customer behavior analytics",
      problemSolved: "Limited customer insights and personalization",
      targetUsers: "E-commerce managers",
      businessGoal: "Increase customer retention by 25%"
    },
    strategic_context: {
      marketOpportunity: "Growing e-commerce analytics market",
      keyAssumptions: "Businesses want actionable insights",
      constraints: "Data privacy regulations",
      risks: "Data integration challenges"
    },
    product_definition: {
      coreFeatures: "Real-time analytics, customer segmentation",
      userFlows: "Data integration → Dashboard setup → Insight generation",
      valueProp: "Actionable customer insights in real-time"
    },
    execution_context: {
      timeline: "4 months",
      teamSize: "3 engineers, 1 data scientist",
      technicalComplexity: "High"
    },
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

export default function PRDGeneratorPage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Untitled PRD");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [prdType, setPrdType] = useState("simple");
  const [productContext, setProductContext] = useState({ productName: "", productDescription: "", problemSolved: "", targetUsers: "", businessGoal: "" });
  const [strategicContext, setStrategicContext] = useState({ marketOpportunity: "", keyAssumptions: "", constraints: "", risks: "" });
  const [productDefinition, setProductDefinition] = useState({ coreFeatures: "", userFlows: "", valueProp: "" });
  const [executionContext, setExecutionContext] = useState({ timeline: "", teamSize: "", technicalComplexity: "" });
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [saved, setSaved] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simulate loading saved PRDs and projects
    setTimeout(() => {
      setSaved(dummyPRDs);
      setProjects(dummyProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const savePRD = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newPRD = {
          id: editingId || `prd${Date.now()}`,
          title,
          prd_type: prdType,
          product_context: productContext,
          strategic_context: strategicContext,
          product_definition: productDefinition,
          execution_context: executionContext,
          report: report || {},
          status: report ? "complete" : "draft",
          created_at: new Date().toISOString(),
          ...(projectId ? { project_id: projectId } : {})
        };
        
        if (editingId) {
          setSaved(prev => prev.map(prd => prd.id === editingId ? newPRD : prd));
        } else {
          setSaved(prev => [newPRD, ...prev]);
          setEditingId(newPRD.id);
        }
        
        toast.success("PRD saved");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving PRD");
      setSaving(false);
    }
  };

  const deletePRD = async (id: string) => {
    try {
      // Simulate deletion
      setTimeout(() => {
        setSaved(prev => prev.filter(prd => prd.id !== id));
        if (editingId === id) startNew();
        toast.success("PRD deleted");
      }, 500);
    } catch (e: any) {
      toast.error("Error deleting PRD");
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const mockReport = {
          productInformation: `## ${productContext.productName}\n\n${productContext.productDescription}\n\nThis document outlines the comprehensive requirements for ${productContext.productName}, targeting ${productContext.targetUsers}.`,
          goalsAndObjectives: `## Goals & Objectives\n\nPrimary Objective: ${productContext.businessGoal}\n\nKey Goals:\n- Solve ${productContext.problemSolved}\n- Achieve market traction\n- Scale to 1000+ users`,
          targetUsers: `## Target Users\n\nPrimary Users: ${productContext.targetUsers}\n\nUser Personas:\n- Early adopters looking for innovative solutions\n- Teams struggling with current alternatives\n- Organizations seeking efficiency gains`,
          problemStatement: `## Problem Statement\n\n${productContext.problemSolved}\n\nCurrent solutions fail to address:\n- Efficiency gaps\n- User experience issues\n- Cost optimization opportunities`,
          valueProposition: `## Value Proposition\n\n${productDefinition.valueProp}\n\nKey Differentiators:\n- Superior user experience\n- Advanced features\n- Competitive pricing`,
          assumptions: `## Assumptions\n\n${strategicContext.keyAssumptions}\n\nMarket Assumptions:\n- Growing demand for solutions\n- Willingness to adopt new technology\n- Budget availability in target segment`
        };
        
        setReport(mockReport);
        toast.success("PRD generated!");
        setGenerating(false);
      }, 3000);
    } catch (e: any) {
      toast.error("Error generating PRD");
      setGenerating(false);
    }
  };

  const loadPRD = (p: any) => {
    setEditingId(p.id); setTitle(p.title); setPrdType(p.prd_type || "simple");
    const pc = p.product_context || {};
    setProductContext({ productName: pc.productName || "", productDescription: pc.productDescription || "", problemSolved: pc.problemSolved || "", targetUsers: pc.targetUsers || "", businessGoal: pc.businessGoal || "" });
    const sc = p.strategic_context || {};
    setStrategicContext({ marketOpportunity: sc.marketOpportunity || "", keyAssumptions: sc.keyAssumptions || "", constraints: sc.constraints || "", risks: sc.risks || "" });
    const pd = p.product_definition || {};
    setProductDefinition({ coreFeatures: pd.coreFeatures || "", userFlows: pd.userFlows || "", valueProp: pd.valueProp || "" });
    const ec = p.execution_context || {};
    setExecutionContext({ timeline: ec.timeline || "", teamSize: ec.teamSize || "", technicalComplexity: ec.technicalComplexity || "" });
    setReport(p.report && Object.keys(p.report).length > 0 ? p.report : null);
    setStep(0);
  };

  const startNew = () => {
    setEditingId(null); setTitle("Untitled PRD"); setPrdType("simple");
    setProductContext({ productName: "", productDescription: "", problemSolved: "", targetUsers: "", businessGoal: "" });
    setStrategicContext({ marketOpportunity: "", keyAssumptions: "", constraints: "", risks: "" });
    setProductDefinition({ coreFeatures: "", userFlows: "", valueProp: "" });
    setExecutionContext({ timeline: "", teamSize: "", technicalComplexity: "" });
    setReport(null); setStep(0);
  };


  return (
    <ToolGate toolName="prd_generator">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6 text-accent" />PRD Generator</h1>
            <p className="text-muted-foreground text-sm">Generate structured Product Requirement Documents for your team.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New</Button>
            <Button size="sm" onClick={() => savePRD()} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Saved PRDs</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> :
                saved?.length === 0 ? <p className="text-xs text-muted-foreground">No PRDs yet.</p> :
                saved?.map((p: any) => (
                  <div key={p.id} className={`relative group w-full text-left p-2 rounded-md border text-sm transition-colors cursor-pointer ${editingId === p.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}
                    onClick={() => loadPRD(p)}>
                    <div className="font-medium truncate pr-6">{p.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={p.status === "complete" ? "default" : "secondary"} className="text-[10px]">{p.status}</Badge>
                      <Badge variant="outline" className="text-[10px]">{p.prd_type}</Badge>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deletePRD(p.id); }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0" placeholder="PRD Title..." />

            <div className="flex items-center gap-1 flex-wrap">
              {STEPS.map((s, i) => (
                <button key={s} onClick={() => setStep(i)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-current">{i + 1}</span>
                  <span className="hidden md:inline">{s}</span>
                </button>
              ))}
            </div>

            {/* Step 0: PRD Type */}
            {step === 0 && (
              <Card>
                <CardHeader><CardTitle>Select PRD Type</CardTitle><CardDescription>Choose the type of PRD to generate.</CardDescription></CardHeader>
                <CardContent>
                  <RadioGroup value={prdType} onValueChange={setPrdType} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {PRD_TYPES.map((t) => (
                      <label key={t.value} className={`flex flex-col gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${prdType === t.value ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}>
                        <RadioGroupItem value={t.value} className="sr-only" />
                        <span className="text-sm font-bold text-primary">{t.label}</span>
                        <span className="text-xs text-muted-foreground">{t.description}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Product Context */}
            {step === 1 && (
              <Card>
                <CardHeader><CardTitle>Product Context</CardTitle><CardDescription>Describe the product this PRD is for.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Product Name</Label><Input value={productContext.productName} onChange={(e) => setProductContext(c => ({ ...c, productName: e.target.value }))} placeholder="e.g., Product Nerve AI" /></div>
                    <div><Label>Target Users</Label><Input value={productContext.targetUsers} onChange={(e) => setProductContext(c => ({ ...c, targetUsers: e.target.value }))} placeholder="e.g., Startup founders" /></div>
                  </div>
                  <div><Label>Product Description</Label><Textarea value={productContext.productDescription} onChange={(e) => setProductContext(c => ({ ...c, productDescription: e.target.value }))} placeholder="Brief product description..." /></div>
                  <div><Label>Problem Solved</Label><Textarea value={productContext.problemSolved} onChange={(e) => setProductContext(c => ({ ...c, problemSolved: e.target.value }))} placeholder="What problem does this solve?" /></div>
                  <div><Label>Business Goal</Label><Input value={productContext.businessGoal} onChange={(e) => setProductContext(c => ({ ...c, businessGoal: e.target.value }))} placeholder="e.g., Achieve product-market fit" /></div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Strategic Context */}
            {step === 2 && (
              <Card>
                <CardHeader><CardTitle>Strategic Context</CardTitle><CardDescription>Define the strategic landscape.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Market Opportunity</Label><Textarea value={strategicContext.marketOpportunity} onChange={(e) => setStrategicContext(c => ({ ...c, marketOpportunity: e.target.value }))} placeholder="Describe the market opportunity..." /></div>
                  <div><Label>Key Assumptions</Label><Textarea value={strategicContext.keyAssumptions} onChange={(e) => setStrategicContext(c => ({ ...c, keyAssumptions: e.target.value }))} placeholder="What assumptions are you making?" /></div>
                  <div><Label>Constraints</Label><Textarea value={strategicContext.constraints} onChange={(e) => setStrategicContext(c => ({ ...c, constraints: e.target.value }))} placeholder="Budget, timeline, tech constraints..." /></div>
                  <div><Label>Risks</Label><Textarea value={strategicContext.risks} onChange={(e) => setStrategicContext(c => ({ ...c, risks: e.target.value }))} placeholder="Key risks to the project..." /></div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Product Definition */}
            {step === 3 && (
              <Card>
                <CardHeader><CardTitle>Product Definition</CardTitle><CardDescription>Define the core product.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Core Features</Label><Textarea value={productDefinition.coreFeatures} onChange={(e) => setProductDefinition(c => ({ ...c, coreFeatures: e.target.value }))} placeholder="List core features..." /></div>
                  <div><Label>User Flows</Label><Textarea value={productDefinition.userFlows} onChange={(e) => setProductDefinition(c => ({ ...c, userFlows: e.target.value }))} placeholder="Describe primary user flows..." /></div>
                  <div><Label>Primary Value Proposition</Label><Textarea value={productDefinition.valueProp} onChange={(e) => setProductDefinition(c => ({ ...c, valueProp: e.target.value }))} placeholder="What is the core value proposition?" /></div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Execution Context */}
            {step === 4 && (
              <Card>
                <CardHeader><CardTitle>Execution Context</CardTitle><CardDescription>Define execution parameters.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <div><Label>Timeline</Label><Input value={executionContext.timeline} onChange={(e) => setExecutionContext(c => ({ ...c, timeline: e.target.value }))} placeholder="e.g., 3 months, 6 months" /></div>
                  <div><Label>Team Size</Label><Input value={executionContext.teamSize} onChange={(e) => setExecutionContext(c => ({ ...c, teamSize: e.target.value }))} placeholder="e.g., 3 engineers, 1 designer" /></div>
                  <div><Label>Technical Complexity</Label><Input value={executionContext.technicalComplexity} onChange={(e) => setExecutionContext(c => ({ ...c, technicalComplexity: e.target.value }))} placeholder="e.g., Low, Medium, High" /></div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Generate */}
            {step === 5 && (
              <Card>
                <CardHeader><CardTitle>Generate PRD</CardTitle><CardDescription>AI will create a comprehensive {PRD_TYPES.find(t => t.value === prdType)?.label}.</CardDescription></CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={generateReport} disabled={generating} className="w-full">
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate {PRD_TYPES.find(t => t.value === prdType)?.label}
                  </Button>
                  <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                    <DialogTrigger asChild><Button variant="outline" className="w-full"><Link2 className="h-4 w-4 mr-2" />Link to Project</Button></DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Link to Project</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {projects?.map((p: any) => (
                          <button key={p.id} className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                            onClick={() => { savePRD(p.id); setLinkProjectOpen(false); }}>{p.name}</button>
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
              {step < 5 && <Button onClick={() => setStep(s => s + 1)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>}
            </div>

            {/* Report Output */}
            {report && Object.keys(report).length > 0 && (
              <Card className="border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent" />
                    {PRD_TYPES.find(t => t.value === prdType)?.label} — Generated
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(report).filter(([k]) => k !== "raw").map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-4 last:border-0">
                      <h4 className="text-sm font-semibold text-primary mb-2">{SECTION_LABELS[key] || key}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{String(value)}</p>
                    </div>
                  ))}
                  {report.raw && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.raw}</p>}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ToolGate>
  );
}
