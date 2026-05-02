import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Users, ArrowRight, ArrowLeft, Save, Link2, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useProject } from "@/contexts/ProjectContext";

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

export default function ICPBuilderPage() {
  const { icpId } = useParams();
  const { activeWorkspace } = useWorkspace();
  const { projects } = useProject();
  const [step, setStep] = useState(0);
  const [productContext, setProductContext] = useState<ProductContext>({
    product: "",
    coreProblem: "",
    whoExperiences: "",
    industriesAffected: ""
  });
  const [segments, setSegments] = useState<ICPSegment[]>([{ ...emptySegment }]);
  const [activeSegment, setActiveSegment] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("Untitled ICP");
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [savedICPs, setSavedICPs] = useState<any[]>([]);
  const [loadingICPs, setLoadingICPs] = useState(true);
  const [saving, setSaving] = useState(false);
  const [linkedProjectId, setLinkedProjectId] = useState<string | any>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [icpToDelete, setIcpToDelete] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (icpId) {
      loadICP(icpId);
    } else {
      loadSavedICPs();
    }
  }, [icpId, activeWorkspace]);

  const loadSavedICPs = async () => {
    if (!activeWorkspace) return;

    setLoadingICPs(true);
    try {
      const token = localStorage.getItem('token');
      const workspaceId = activeWorkspace._id || activeWorkspace.id;

      if (!workspaceId) {
        toast.error("No workspace ID found");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/icp?workspace_id=${workspaceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedICPs(data.data.icps || []);
      } else {
        const errorText = await response.text();
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: errorText };
        }
        toast.error(error.error || `Failed to load ICPs (${response.status})`);
      }
    } catch {
      toast.error("Network error while loading ICPs");
    } finally {
      setLoadingICPs(false);
    }
  };

  const loadICP = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/icp/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const icp = data.data;
        setEditingId(icp._id || icp.id);
        setTitle(icp.title);
        setProductContext(icp.product_context ? {
          product: icp.product_context.product || "",
          coreProblem: icp.product_context.core_problem || "",
          whoExperiences: icp.product_context.who_experiences || "",
          industriesAffected: icp.product_context.industries_affected || ""
        } : { product: "", coreProblem: "", whoExperiences: "", industriesAffected: "" });

        const frontendSegments = icp.segments?.length ? icp.segments.map((segment: any) => ({
          name: segment.name,
          jobRole: segment.job_role,
          industry: segment.industry,
          companySize: segment.company_size,
          geography: segment.geography,
          incomeLevel: segment.income_level,
          painProfile: {
            topProblems: segment.pain_profile?.top_problems || ["", "", ""],
            currentWorkaround: segment.pain_profile?.current_workaround || "",
            costOfProblem: segment.pain_profile?.cost_of_problem || "",
            urgencyLevel: segment.pain_profile?.urgency_level || "medium",
            emotionalTrigger: segment.pain_profile?.emotional_trigger || ""
          },
          buyingBehavior: {
            decisionMaker: segment.buying_behavior?.decision_maker || "",
            budgetAuthority: segment.buying_behavior?.budget_authority || "",
            buyingTriggers: segment.buying_behavior?.buying_triggers || "",
            buyingFrequency: segment.buying_behavior?.buying_frequency || "",
            priceSensitivity: segment.buying_behavior?.price_sensitivity || "medium"
          },
          channelDiscovery: {
            communities: segment.channel_discovery?.communities || "",
            socialPlatforms: segment.channel_discovery?.social_platforms || "",
            searchBehavior: segment.channel_discovery?.search_behavior || "",
            industryEvents: segment.channel_discovery?.industry_events || "",
            referrals: segment.channel_discovery?.referrals || ""
          }
        })) : [{ ...emptySegment }];

        setSegments(frontendSegments);
        setReport(icp.report && Object.keys(icp.report).length > 0 ? icp.report : null);
        setLinkedProjectId(icp.project_id);
        setStep(0);
        setActiveSegment(0);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load ICP");
      }
    } catch {
      toast.error("Network error while loading ICP");
    }
  };

  const saveICP = async (projectId?: string) => {
    if (!activeWorkspace) {
      toast.error("No active workspace selected");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const workspaceId = activeWorkspace._id || activeWorkspace.id;

      if (!workspaceId) {
        toast.error("No workspace ID found");
        return;
      }

      const resolvedTitle = title.trim() || `Untitled ICP ${new Date().toLocaleDateString()}`;
      if (!title.trim()) setTitle(resolvedTitle);

      const backendSegments = segments.map(segment => ({
        name: segment.name,
        job_role: segment.jobRole,
        industry: segment.industry,
        company_size: segment.companySize,
        geography: segment.geography,
        income_level: segment.incomeLevel,
        pain_profile: {
          top_problems: segment.painProfile.topProblems
            .map(p => (p || '').replace(/[\r\n]+/g, ' ').trim())
            .filter(p => p.length > 0),
          current_workaround: segment.painProfile.currentWorkaround,
          cost_of_problem: segment.painProfile.costOfProblem,
          urgency_level: segment.painProfile.urgencyLevel,
          emotional_trigger: segment.painProfile.emotionalTrigger
        },
        buying_behavior: {
          decision_maker: segment.buyingBehavior.decisionMaker,
          budget_authority: segment.buyingBehavior.budgetAuthority,
          buying_triggers: segment.buyingBehavior.buyingTriggers,
          buying_frequency: segment.buyingBehavior.buyingFrequency,
          price_sensitivity: segment.buyingBehavior.priceSensitivity
        },
        channel_discovery: {
          communities: segment.channelDiscovery.communities,
          social_platforms: segment.channelDiscovery.socialPlatforms,
          search_behavior: segment.channelDiscovery.searchBehavior,
          industry_events: segment.channelDiscovery.industryEvents || "",
          referrals: segment.channelDiscovery.referrals || ""
        }
      }));

      const payload = {
        title: resolvedTitle,
        product_context: {
          product: productContext.product,
          core_problem: productContext.coreProblem,
          who_experiences: productContext.whoExperiences,
          industries_affected: productContext.industriesAffected
        },
        segments: backendSegments,
        workspace_id: workspaceId,
        ...(projectId || linkedProjectId ? {
          project_id: projectId || (linkedProjectId && typeof linkedProjectId === 'object' && linkedProjectId._id ? linkedProjectId._id : linkedProjectId)
        } : {})
      };

      const url = editingId ? `${API_BASE_URL}/icp/${editingId}` : `${API_BASE_URL}/icp`;
      const method = editingId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const savedICP = data.data;
        if (!editingId) setEditingId(savedICP._id || savedICP.id);
        if (savedICP.project_id) setLinkedProjectId(savedICP.project_id?._id || savedICP.project_id);
        toast.success("ICP saved successfully");
        await loadSavedICPs();
      } else {
        const error = await response.json();
        console.error('Validation failed - full error response:', error);
        if (error.details && Array.isArray(error.details)) {
          console.error('Validation details:', error.details);
          error.details.forEach((detail: any, index: number) => {
            console.error(`Detail ${index + 1}:`, detail);
          });
        }
        toast.error(error.error || error.message || "Failed to save ICP");
      }
    } catch {
      toast.error("Network error while saving ICP");
    } finally {
      setSaving(false);
    }
  };

  const linkProject = async (projectId: string) => {
    if (!editingId) {
      toast.error("Please save the ICP first");
      return;
    }
    if (!projectId) {
      toast.error("Invalid project selected");  // ← will catch undefined
      return;
    }
    if (!editingId) {
      toast.error("Please save the ICP first");
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/icp/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ project_id: projectId })
      });
      if (response.ok) {
        const data = await response.json();
        const savedICP = data.data;
        setLinkedProjectId(savedICP.project_id?._id || savedICP.project_id);
        toast.success("Project linked successfully!");
        await loadSavedICPs();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to link project");
      }
    } catch {
      toast.error("Network error while linking project");
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteICP = (icpId: string) => {
    setIcpToDelete(icpId);
    setDeleteModalOpen(true);
  };

  const deleteICP = async () => {
    if (!icpToDelete) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/icp/${icpToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        toast.success("ICP deleted successfully");
        // If we're currently editing the deleted ICP, start a new one
        if (editingId === icpToDelete) {
          startNew();
        }
        await loadSavedICPs();
        setDeleteModalOpen(false);
        setIcpToDelete(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete ICP");
      }
    } catch {
      toast.error("Network error while deleting ICP");
    } finally {
      setSaving(false);
    }
  };

  const generateReport = async () => {
    if (!editingId) {
      toast.error("Please save the ICP first before generating a report");
      return;
    }
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/icp/${editingId}/generate-report`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReport(data.data.report);
        toast.success("ICP Report generated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate report");
      }
    } catch {
      toast.error("Network error while generating report");
    } finally {
      setGenerating(false);
    }
  };

  const loadICPFromList = (icp: any) => loadICP(icp._id || icp.id);

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
    if (segments.length >= 3) {
      toast.error("Maximum 3 ICP segments allowed");
      return;
    }
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

  // ─────────────────────────────────────────────────────────────
  // SILENT checker — pure boolean, NO toasts. Safe to call in JSX render.
  // industryEvents and referrals are optional (not required for validity).
  // ─────────────────────────────────────────────────────────────
  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!(
          productContext.product.trim() &&
          productContext.coreProblem.trim() &&
          productContext.whoExperiences.trim() &&
          productContext.industriesAffected.trim()
        );
      case 1:
        return segments.every(s =>
          s.name.trim() &&
          s.jobRole.trim() &&
          s.industry.trim() &&
          s.companySize.trim() &&
          s.geography.trim() &&
          s.incomeLevel.trim()
        );
      case 2:
        return segments.every(s =>
          s.painProfile.topProblems.some(p => p.trim()) &&
          s.painProfile.currentWorkaround.trim() &&
          s.painProfile.costOfProblem.trim() &&
          s.painProfile.emotionalTrigger.trim()
        );
      case 3:
        return segments.every(s =>
          s.buyingBehavior.decisionMaker.trim() &&
          s.buyingBehavior.budgetAuthority.trim() &&
          s.buyingBehavior.buyingTriggers.trim() &&
          s.buyingBehavior.buyingFrequency.trim()
        );
      case 4:
        // industryEvents and referrals are optional
        return segments.every(s =>
          s.channelDiscovery.communities.trim() &&
          s.channelDiscovery.socialPlatforms.trim() &&
          s.channelDiscovery.searchBehavior.trim()
        );
      default:
        return true;
    }
  };

  const validateStep = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        if (!productContext.product.trim()) { toast.error("Please describe your product or idea"); return false; }
        if (!productContext.coreProblem.trim()) { toast.error("Please describe the core problem it solves"); return false; }
        if (!productContext.whoExperiences.trim()) { toast.error("Please specify who experiences this problem"); return false; }
        if (!productContext.industriesAffected.trim()) { toast.error("Please specify which industries are affected"); return false; }
        return true;

      case 1:
        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          if (!s.name.trim()) { toast.error(`Please provide a name for Segment ${i + 1}`); return false; }
          if (!s.jobRole.trim()) { toast.error(`Please specify job role for Segment ${i + 1}`); return false; }
          if (!s.industry.trim()) { toast.error(`Please specify industry for Segment ${i + 1}`); return false; }
          if (!s.companySize.trim()) { toast.error(`Please specify company size for Segment ${i + 1}`); return false; }
          if (!s.geography.trim()) { toast.error(`Please specify geography for Segment ${i + 1}`); return false; }
          if (!s.incomeLevel.trim()) { toast.error(`Please specify income level for Segment ${i + 1}`); return false; }
        }
        return true;

      case 2:
        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          if (!s.painProfile.topProblems.some(p => p.trim())) { toast.error(`Please provide at least one problem for Segment ${i + 1}`); return false; }
          if (!s.painProfile.currentWorkaround.trim()) { toast.error(`Please describe current workaround for Segment ${i + 1}`); return false; }
          if (!s.painProfile.costOfProblem.trim()) { toast.error(`Please specify cost of problem for Segment ${i + 1}`); return false; }
          if (!s.painProfile.emotionalTrigger.trim()) { toast.error(`Please specify emotional trigger for Segment ${i + 1}`); return false; }
        }
        return true;

      case 3:
        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          if (!s.buyingBehavior.decisionMaker.trim()) { toast.error(`Please specify decision maker for Segment ${i + 1}`); return false; }
          if (!s.buyingBehavior.budgetAuthority.trim()) { toast.error(`Please specify budget authority for Segment ${i + 1}`); return false; }
          if (!s.buyingBehavior.buyingTriggers.trim()) { toast.error(`Please specify buying triggers for Segment ${i + 1}`); return false; }
          if (!s.buyingBehavior.buyingFrequency.trim()) { toast.error(`Please specify buying frequency for Segment ${i + 1}`); return false; }
        }
        return true;

      case 4:
        // Only the first 3 channel fields are required; industryEvents and referrals are optional
        for (let i = 0; i < segments.length; i++) {
          const s = segments[i];
          if (!s.channelDiscovery.communities.trim()) { toast.error(`Please specify communities for Segment ${i + 1}`); return false; }
          if (!s.channelDiscovery.socialPlatforms.trim()) { toast.error(`Please specify social platforms for Segment ${i + 1}`); return false; }
          if (!s.channelDiscovery.searchBehavior.trim()) { toast.error(`Please specify search behavior for Segment ${i + 1}`); return false; }
        }
        return true;

      default:
        return true;
    }
  };

  const validateAll = (): boolean => {
    for (let i = 0; i < STEPS.length; i++) {
      if (!validateStep(i)) return false;
    }
    return true;
  };

  const canNavigateToStep = (targetStep: number): boolean => {
    if (targetStep <= step) return true;
    for (let i = 0; i < targetStep; i++) {
      if (!isStepValid(i)) return false;
    }
    return true;
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    for (let i = step; i < targetStep; i++) {
      if (!validateStep(i)) return;
    }
    setStep(targetStep);
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(s => s + 1);
  };

  const handleSave = () => {
    if (validateAll()) saveICP();
  };

  const handleLinkProject = (projectId: string) => {
    console.log(projectId)
    setLinkProjectOpen(false);
    linkProject(projectId);
  };


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
          <Button variant="outline" size="sm" onClick={startNew}>
            <Plus className="h-4 w-4 mr-1" />New ICP
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
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
                <div
                  key={icp._id || icp.id}
                  className={`group relative p-2 rounded-md border text-sm transition-colors cursor-pointer ${editingId === (icp._id || icp.id)
                    ? "border-accent bg-accent/10"
                    : "border-border hover:bg-muted/50"
                    }`}
                >
                  <button
                    onClick={() => loadICPFromList(icp)}
                    className="w-full text-left"
                  >
                    <div className="font-medium truncate">{icp.title}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant={icp.status === "complete" ? "default" : "secondary"} className="text-[10px]">
                        {icp.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {icp.createdAt ? new Date(icp.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'No date'}
                      </span>
                    </div>
                  </button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDeleteICP(icp._id || icp.id);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                    disabled={saving}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
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
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 hover:bg-muted/30 rounded transition-colors"
            placeholder="ICP Title..."
            onFocus={(e) => { if (e.target.value === "Untitled ICP") e.target.select(); }}
          />

          {/* Step indicator */}
          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => {
              const accessible = canNavigateToStep(i);
              return (
                <button
                  key={s}
                  onClick={() => handleStepClick(i)}
                  disabled={!accessible}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${i === step
                    ? "bg-primary text-primary-foreground"
                    : accessible
                      ? "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
                      : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
                    }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${i === step
                    ? "border-current"
                    : accessible
                      ? "border-current"
                      : "border-current/50"
                    }`}>
                    {isStepValid(i) && i !== step ? "✓" : i + 1}
                  </span>
                  <span className="hidden sm:inline">{s}</span>
                </button>
              );
            })}
          </div>

          {/* Step 0: Product Context */}
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Product Context</CardTitle>
                <CardDescription>Tell us about the product or idea you're building.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>What product or idea are you building?</Label>
                  <Textarea
                    value={productContext.product}
                    onChange={(e) => setProductContext(p => ({ ...p, product: e.target.value }))}
                    placeholder="Describe your product..."
                  />
                </div>
                <div>
                  <Label>What core problem does it solve?</Label>
                  <Textarea
                    value={productContext.coreProblem}
                    onChange={(e) => setProductContext(p => ({ ...p, coreProblem: e.target.value }))}
                    placeholder="The main problem..."
                  />
                </div>
                <div>
                  <Label>Who experiences this problem most?</Label>
                  <Input
                    value={productContext.whoExperiences}
                    onChange={(e) => setProductContext(p => ({ ...p, whoExperiences: e.target.value }))}
                    placeholder="e.g., Early-stage founders, SMB owners..."
                  />
                </div>
                <div>
                  <Label>Which industries or user types are most affected?</Label>
                  <Input
                    value={productContext.industriesAffected}
                    onChange={(e) => setProductContext(p => ({ ...p, industriesAffected: e.target.value }))}
                    placeholder="e.g., SaaS, E-commerce, FinTech..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Segment Identification */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Segment Identification</CardTitle>
                    <CardDescription>Define up to 3 ICP segments.</CardDescription>
                  </div>
                  {segments.length < 3 && (
                    <Button size="sm" variant="outline" onClick={addSegment}>
                      <Plus className="h-3 w-3 mr-1" />Add Segment
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={String(activeSegment)} onValueChange={(v) => setActiveSegment(Number(v))}>
                  <div className="flex items-center gap-2 mb-4">
                    <TabsList>
                      {segments.map((s, i) => (
                        <TabsTrigger key={i} value={String(i)}>
                          ICP {i + 1}{s.name ? `: ${s.name}` : ""}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {segments.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeSegment(activeSegment)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  {segments.map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Segment Name</Label>
                          <Input value={seg.name} onChange={(e) => updateSegment("name", e.target.value)} placeholder="e.g., Technical Founders" />
                        </div>
                        <div>
                          <Label>Job Role / Persona</Label>
                          <Input value={seg.jobRole} onChange={(e) => updateSegment("jobRole", e.target.value)} placeholder="e.g., CTO, Product Manager" />
                        </div>
                        <div>
                          <Label>Industry</Label>
                          <Input value={seg.industry} onChange={(e) => updateSegment("industry", e.target.value)} placeholder="e.g., SaaS, FinTech" />
                        </div>
                        <div>
                          <Label>Company Size</Label>
                          <Input value={seg.companySize} onChange={(e) => updateSegment("companySize", e.target.value)} placeholder="e.g., 1-10 employees" />
                        </div>
                        <div>
                          <Label>Geography</Label>
                          <Input value={seg.geography} onChange={(e) => updateSegment("geography", e.target.value)} placeholder="e.g., North America, Global" />
                        </div>
                        <div>
                          <Label>Income / Revenue Level</Label>
                          <Input value={seg.incomeLevel} onChange={(e) => updateSegment("incomeLevel", e.target.value)} placeholder="e.g., $50K-$200K ARR" />
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Pain Profile */}
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
                      <div>
                        <Label>Top 3 Problems</Label>
                        {seg.painProfile.topProblems.map((p, pi) => (
                          <Input
                            key={pi}
                            value={p}
                            onChange={(e) => {
                              const probs = [...seg.painProfile.topProblems];
                              probs[pi] = e.target.value;
                              updateNested("painProfile", "topProblems", probs);
                            }}
                            placeholder={`Problem ${pi + 1}`}
                            className="mt-1"
                          />
                        ))}
                      </div>
                      <div>
                        <Label>Current Workaround</Label>
                        <Textarea
                          value={seg.painProfile.currentWorkaround}
                          onChange={(e) => updateNested("painProfile", "currentWorkaround", e.target.value)}
                          placeholder="How do they currently solve this?"
                        />
                      </div>
                      <div>
                        <Label>Cost of Problem</Label>
                        <Input
                          value={seg.painProfile.costOfProblem}
                          onChange={(e) => updateNested("painProfile", "costOfProblem", e.target.value)}
                          placeholder="e.g., $5K/month in lost productivity"
                        />
                      </div>
                      <div>
                        <Label>Urgency Level</Label>
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
                      <div>
                        <Label>Emotional Trigger</Label>
                        <Input
                          value={seg.painProfile.emotionalTrigger}
                          onChange={(e) => updateNested("painProfile", "emotionalTrigger", e.target.value)}
                          placeholder="e.g., Frustration with manual processes"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Buying Behavior */}
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
                      <div>
                        <Label>Who makes the buying decision?</Label>
                        <Input
                          value={seg.buyingBehavior.decisionMaker}
                          onChange={(e) => updateNested("buyingBehavior", "decisionMaker", e.target.value)}
                          placeholder="e.g., CEO, Head of Product"
                        />
                      </div>
                      <div>
                        <Label>Budget Authority</Label>
                        <Input
                          value={seg.buyingBehavior.budgetAuthority}
                          onChange={(e) => updateNested("buyingBehavior", "budgetAuthority", e.target.value)}
                          placeholder="e.g., $500/mo without approval"
                        />
                      </div>
                      <div>
                        <Label>Buying Trigger Events</Label>
                        <Textarea
                          value={seg.buyingBehavior.buyingTriggers}
                          onChange={(e) => updateNested("buyingBehavior", "buyingTriggers", e.target.value)}
                          placeholder="What events trigger a purchase?"
                        />
                      </div>
                      <div>
                        <Label>Buying Frequency</Label>
                        <Input
                          value={seg.buyingBehavior.buyingFrequency}
                          onChange={(e) => updateNested("buyingBehavior", "buyingFrequency", e.target.value)}
                          placeholder="e.g., Monthly subscription"
                        />
                      </div>
                      <div>
                        <Label>Price Sensitivity</Label>
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

          {/* Step 4: Channel Discovery */}
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
                      <div>
                        <Label>Communities <span className="text-destructive">*</span></Label>
                        <Input
                          value={seg.channelDiscovery.communities}
                          onChange={(e) => updateNested("channelDiscovery", "communities", e.target.value)}
                          placeholder="e.g., Indie Hackers, Reddit r/startups"
                        />
                      </div>
                      <div>
                        <Label>Social Platforms <span className="text-destructive">*</span></Label>
                        <Input
                          value={seg.channelDiscovery.socialPlatforms}
                          onChange={(e) => updateNested("channelDiscovery", "socialPlatforms", e.target.value)}
                          placeholder="e.g., LinkedIn, Twitter/X"
                        />
                      </div>
                      <div>
                        <Label>Search Behavior <span className="text-destructive">*</span></Label>
                        <Input
                          value={seg.channelDiscovery.searchBehavior}
                          onChange={(e) => updateNested("channelDiscovery", "searchBehavior", e.target.value)}
                          placeholder="e.g., 'how to validate startup idea'"
                        />
                      </div>
                      <div>
                        <Label>Industry Events <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                          value={seg.channelDiscovery.industryEvents}
                          onChange={(e) => updateNested("channelDiscovery", "industryEvents", e.target.value)}
                          placeholder="e.g., SaaStr, TechCrunch Disrupt"
                        />
                      </div>
                      <div>
                        <Label>Referrals <span className="text-muted-foreground text-xs">(optional)</span></Label>
                        <Input
                          value={seg.channelDiscovery.referrals}
                          onChange={(e) => updateNested("channelDiscovery", "referrals", e.target.value)}
                          placeholder="e.g., VC networks, accelerators"
                        />
                      </div>
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
                    {generating
                      ? <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      : <Sparkles className="h-4 w-4 mr-1" />
                    }
                    Generate Report
                  </Button>
                  <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><Link2 className="h-4 w-4 mr-1" />Link to Project</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Link ICP to Project</DialogTitle></DialogHeader>
                      <div className="space-y-2">
                        {projects?.map((p: any) => {
                          const projectId = p._id || p.id;  // ← normalize
                          return (
                            <button
                              key={projectId}
                              className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                              onClick={() => handleLinkProject(projectId)}
                            >
                              {p.name}
                            </button>
                          );
                        })}
                        {!projects?.length && (
                          <p className="text-sm text-muted-foreground">No projects in this workspace.</p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              {step < 4 && (
                <Button onClick={handleNext}>
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
                      {(sr.pain_intensity_score ?? sr.painIntensityScore) != null && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Pain Intensity</div>
                          <div className="text-2xl font-bold text-primary">
                            {sr.pain_intensity_score ?? sr.painIntensityScore}/100
                          </div>
                        </div>
                      )}
                      {(sr.purchase_probability ?? sr.purchaseProbability) != null && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Purchase Probability</div>
                          <div className="text-2xl font-bold text-accent">
                            {sr.purchase_probability ?? sr.purchaseProbability}%
                          </div>
                        </div>
                      )}
                      {(sr.revenue_potential ?? sr.revenuePotential) && (
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground">Revenue Potential</div>
                          <div className="text-lg font-bold">{sr.revenue_potential ?? sr.revenuePotential}</div>
                        </div>
                      )}
                    </div>
                    {(sr.persona_summary ?? sr.personaSummary) && (
                      <p className="mt-3 text-sm text-muted-foreground">
                        {sr.persona_summary ?? sr.personaSummary}
                      </p>
                    )}
                    {(sr.best_channels ?? sr.bestChannels)?.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-muted-foreground">Best Channels:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(sr.best_channels ?? sr.bestChannels).map((c: string, ci: number) => (
                            <Badge key={ci} variant="secondary">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {(sr.strategic_insights ?? sr.strategicInsights) && (
                      <p className="mt-3 text-sm border-l-2 border-accent pl-3 italic whitespace-pre-wrap">
                        {sr.strategic_insights ?? sr.strategicInsights}
                      </p>
                    )}
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {typeof report === "string" ? report : JSON.stringify(report, null, 2)}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ICP</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this ICP? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteICP} disabled={saving}>
                {saving ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}