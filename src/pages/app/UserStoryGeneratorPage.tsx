import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BookOpen, ArrowRight, ArrowLeft, Save, Plus, Loader2, Sparkles, Link2, Download, FileText, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STEPS = [
  "Product Context", "Module", "Epic", "Story Definition",
  "User Flow", "Preconditions", "Post Conditions", "Dependencies",
  "Design", "Technical", "Definition of Done"
];

interface TagInputProps {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}

function TagInput({ values, onChange, placeholder }: TagInputProps) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" size="sm" onClick={add}>Add</Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v, i) => (
            <Badge key={i} variant="secondary" className="text-xs gap-1">
              {v}
              <button onClick={() => onChange(values.filter((_, idx) => idx !== i))} className="ml-1 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Dummy data
const dummyUser = { id: "user123" };
const dummyWorkspace = { id: "workspace1", name: "Default Workspace" };

const dummyUserStories = [
  {
    id: "story1",
    title: "User Authentication Story",
    product_context: {
      productName: "Product Nerve",
      productDescription: "AI-powered venture validation platform",
      targetUser: "Startup founders",
      businessGoal: "Secure platform access",
      featureName: "User Authentication",
      featureDescription: "Login and registration system"
    },
    module_definition: {
      moduleName: "Authentication",
      moduleDescription: "User identity and access management"
    },
    epic_definition: {
      epicTitle: "User Authentication System",
      epicDescription: "Complete authentication workflow for platform access",
      epicObjective: "Enable secure user account access"
    },
    story_definition: {
      userPersona: "Startup founder",
      userNeed: "Secure account login",
      userGoal: "Access venture dashboard",
      businessValue: "Platform security and user trust",
      featureTrigger: "User clicks login button"
    },
    user_flow: {
      entryPoint: "User lands on login page",
      userActions: "Enter credentials → Click login → Verify identity",
      systemResponses: "Validate credentials → Create session → Redirect",
      exitPoint: "User redirected to dashboard"
    },
    preconditions: ["User account exists", "Valid credentials provided"],
    postconditions: ["User session created", "User authenticated"],
    dependencies: ["Authentication service", "Database connection"],
    design_considerations: ["Mobile responsive", "Error handling"],
    technical_considerations: ["JWT tokens", "Password hashing"],
    definition_of_done: ["All tests passing", "Security review complete"],
    report: {
      stories: [
        {
          module: "Authentication",
          epic: "User Authentication System",
          storyId: "AUTH-001",
          title: "User Login",
          why: "As a startup founder, I want to securely log into my account so that I can access my venture dashboard",
          story: "As a startup founder, I want to securely log into my account so that I can access my venture dashboard",
          precondition: "User account exists and valid credentials provided",
          userFlow: "Navigate to login page → Enter email/password → Click login → System validates → Redirect to dashboard",
          postCondition: "User session created and user authenticated",
          acceptanceCriteria: {
            happy: "User successfully logs in with valid credentials",
            unhappy: "User sees error message with invalid credentials"
          },
          dependencies: "Authentication service, Database connection",
          designConsideration: "Mobile responsive design with clear error states",
          technicalConsiderations: "JWT tokens for session management, bcrypt for password hashing",
          definitionOfDone: "Unit tests passing, Integration tests complete, Security review approved"
        }
      ]
    },
    status: "complete",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "story2",
    title: "Project Creation Story",
    product_context: {
      productName: "Product Nerve",
      productDescription: "AI-powered venture validation platform",
      targetUser: "Startup founders",
      businessGoal: "Enable venture creation",
      featureName: "Project Management",
      featureDescription: "Create and manage ventures"
    },
    module_definition: {
      moduleName: "Project Management",
      moduleDescription: "Venture creation and management"
    },
    epic_definition: {
      epicTitle: "Venture Creation Workflow",
      epicDescription: "Complete project lifecycle management",
      epicObjective: "Enable venture creation and tracking"
    },
    story_definition: {
      userPersona: "Startup founder",
      userNeed: "Create new venture",
      userGoal: "Start validation process",
      businessValue: "Platform engagement and retention",
      featureTrigger: "User clicks create project button"
    },
    user_flow: {
      entryPoint: "User on dashboard",
      userActions: "Click create project → Fill details → Submit",
      systemResponses: "Validate input → Create project → Show success",
      exitPoint: "User redirected to new project"
    },
    preconditions: ["User authenticated", "Valid project details"],
    postconditions: ["Project created", "User is project owner"],
    dependencies: ["Database", "Validation service"],
    design_considerations: ["Progress indicators", "Form validation"],
    technical_considerations: ["Data validation", "Error handling"],
    definition_of_done: ["Form validation complete", "Project created successfully"],
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

export default function UserStoryGeneratorPage() {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("Untitled User Story");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [linkProjectOpen, setLinkProjectOpen] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [saved, setSaved] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Step data
  const [productContext, setProductContext] = useState({ productName: "", productDescription: "", targetUser: "", businessGoal: "", featureName: "", featureDescription: "" });
  const [moduleDef, setModuleDef] = useState({ moduleName: "", moduleDescription: "" });
  const [epicDef, setEpicDef] = useState({ epicTitle: "", epicDescription: "", epicObjective: "" });
  const [storyDef, setStoryDef] = useState({ userPersona: "", userNeed: "", userGoal: "", businessValue: "", featureTrigger: "" });
  const [userFlow, setUserFlow] = useState({ entryPoint: "", userActions: "", systemResponses: "", exitPoint: "" });
  const [preconditions, setPreconditions] = useState<string[]>([]);
  const [postconditions, setPostconditions] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<string[]>([]);
  const [designConsiderations, setDesignConsiderations] = useState<string[]>([]);
  const [technicalConsiderations, setTechnicalConsiderations] = useState<string[]>([]);
  const [definitionOfDone, setDefinitionOfDone] = useState<string[]>([]);

  useEffect(() => {
    // Simulate loading saved stories and projects
    setTimeout(() => {
      setSaved(dummyUserStories);
      setProjects(dummyProjects);
      setIsLoading(false);
    }, 1000);
  }, []);

  const buildPayload = (projectId?: string) => ({
    user_id: dummyUser.id,
    workspace_id: dummyWorkspace.id,
    title,
    product_context: productContext as any,
    module_definition: moduleDef as any,
    epic_definition: epicDef as any,
    story_definition: storyDef as any,
    user_flow: userFlow as any,
    preconditions: preconditions as any,
    postconditions: postconditions as any,
    dependencies: dependencies as any,
    design_considerations: designConsiderations as any,
    technical_considerations: technicalConsiderations as any,
    definition_of_done: definitionOfDone as any,
    report: report || {},
    status: report ? "complete" : "draft",
    ...(projectId ? { project_id: projectId } : {}),
  });

  const saveStory = async (projectId?: string) => {
    setSaving(true);
    try {
      // Simulate saving
      setTimeout(() => {
        const newStory = {
          ...buildPayload(projectId),
          id: editingId || `story${Date.now()}`,
          created_at: new Date().toISOString()
        };
        
        if (editingId) {
          setSaved(prev => prev.map(story => story.id === editingId ? newStory : story));
        } else {
          setSaved(prev => [newStory, ...prev]);
          setEditingId(newStory.id);
        }
        
        toast.success("User story saved");
        setSaving(false);
      }, 1500);
    } catch (e: any) {
      toast.error("Error saving user story");
      setSaving(false);
    }
  };

  const deleteStory = async (id: string) => {
    try {
      // Simulate deletion
      setTimeout(() => {
        setSaved(prev => prev.filter(story => story.id !== id));
        if (editingId === id) startNew();
        toast.success("User story deleted");
      }, 500);
    } catch (e: any) {
      toast.error("Error deleting user story");
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      setTimeout(() => {
        const mockReport = {
          summary: `Generated ${Math.floor(Math.random() * 3) + 1} user stories for ${moduleDef.moduleName || "the specified module"}. Each story includes comprehensive acceptance criteria and technical considerations.`,
          stories: [
            {
              module: moduleDef.moduleName || "Authentication",
              epic: epicDef.epicTitle || "User System",
              storyId: `STORY-${Math.floor(Math.random() * 1000)}`,
              title: storyDef.userGoal || "User Goal Achievement",
              why: `As a ${storyDef.userPersona || "user"}, I want to ${storyDef.userNeed || "accomplish task"} so that I can ${storyDef.userGoal || "achieve objective"}`,
              story: `As a ${storyDef.userPersona || "user"}, I want to ${storyDef.userNeed || "accomplish task"} so that I can ${storyDef.userGoal || "achieve objective"}`,
              precondition: preconditions.slice(0, 2).join(", ") || "System is ready",
              userFlow: userFlow.entryPoint + " → " + userFlow.userActions + " → " + userFlow.systemResponses + " → " + userFlow.exitPoint,
              postCondition: postconditions.slice(0, 2).join(", ") || "Task completed successfully",
              acceptanceCriteria: {
                happy: "User successfully completes the intended action",
                unhappy: "System handles errors gracefully and provides clear feedback"
              },
              dependencies: dependencies.slice(0, 2).join(", ") || "No external dependencies",
              designConsideration: designConsiderations.slice(0, 2).join(", ") || "Follow design system guidelines",
              technicalConsiderations: technicalConsiderations.slice(0, 2).join(", ") || "Implement with standard patterns",
              definitionOfDone: definitionOfDone.slice(0, 2).join(", ") || "Tests pass and code reviewed"
            }
          ]
        };
        
        setReport(mockReport);
        toast.success("User story generated!");
        setGenerating(false);
      }, 3000);
    } catch (e: any) {
      toast.error("Error generating user story");
      setGenerating(false);
    }
  };

  const loadStory = (s: any) => {
    setEditingId(s.id);
    setTitle(s.title);
    const pc = s.product_context || {};
    setProductContext({ productName: pc.productName || "", productDescription: pc.productDescription || "", targetUser: pc.targetUser || "", businessGoal: pc.businessGoal || "", featureName: pc.featureName || "", featureDescription: pc.featureDescription || "" });
    const md = s.module_definition || {};
    setModuleDef({ moduleName: md.moduleName || "", moduleDescription: md.moduleDescription || "" });
    const ed = s.epic_definition || {};
    setEpicDef({ epicTitle: ed.epicTitle || "", epicDescription: ed.epicDescription || "", epicObjective: ed.epicObjective || "" });
    const sd = s.story_definition || {};
    setStoryDef({ userPersona: sd.userPersona || "", userNeed: sd.userNeed || "", userGoal: sd.userGoal || "", businessValue: sd.businessValue || "", featureTrigger: sd.featureTrigger || "" });
    const uf = s.user_flow || {};
    setUserFlow({ entryPoint: uf.entryPoint || "", userActions: uf.userActions || "", systemResponses: uf.systemResponses || "", exitPoint: uf.exitPoint || "" });
    setPreconditions(Array.isArray(s.preconditions) ? s.preconditions : []);
    setPostconditions(Array.isArray(s.postconditions) ? s.postconditions : []);
    setDependencies(Array.isArray(s.dependencies) ? s.dependencies : []);
    setDesignConsiderations(Array.isArray(s.design_considerations) ? s.design_considerations : []);
    setTechnicalConsiderations(Array.isArray(s.technical_considerations) ? s.technical_considerations : []);
    setDefinitionOfDone(Array.isArray(s.definition_of_done) ? s.definition_of_done : []);
    setReport(s.report && Object.keys(s.report).length > 0 ? s.report : null);
    setStep(0);
  };

  const startNew = () => {
    setEditingId(null); setTitle("Untitled User Story");
    setProductContext({ productName: "", productDescription: "", targetUser: "", businessGoal: "", featureName: "", featureDescription: "" });
    setModuleDef({ moduleName: "", moduleDescription: "" });
    setEpicDef({ epicTitle: "", epicDescription: "", epicObjective: "" });
    setStoryDef({ userPersona: "", userNeed: "", userGoal: "", businessValue: "", featureTrigger: "" });
    setUserFlow({ entryPoint: "", userActions: "", systemResponses: "", exitPoint: "" });
    setPreconditions([]); setPostconditions([]); setDependencies([]);
    setDesignConsiderations([]); setTechnicalConsiderations([]); setDefinitionOfDone([]);
    setReport(null); setStep(0);
  };

  const exportCSV = () => {
    if (!report?.stories?.length) return;
    const headers = ["MODULE", "EPIC", "USER STORY ID", "USER STORY TITLE", "WHY THE USER STORY", "USER STORY", "PRE-CONDITION", "USER FLOW", "POST CONDITION", "ACCEPTANCE CRITERIA", "DEPENDENCIES", "DESIGN CONSIDERATION", "TECHNICAL CONSIDERATIONS", "DEFINITION OF DONE"];
    const rows = report.stories.map((s: any) => [
      s.module, s.epic, s.storyId, s.title, s.why, s.story, s.precondition, s.userFlow, s.postCondition, `Happy: ${s.acceptanceCriteria?.happy || ""} | Unhappy: ${s.acceptanceCriteria?.unhappy || ""}`, s.dependencies, s.designConsideration, s.technicalConsiderations, s.definitionOfDone
    ]);
    const csv = [headers, ...rows].map(r => r.map((c: string) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${title}.csv`; a.click();
    URL.revokeObjectURL(url);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-accent" />User Story Generator</h1>
          <p className="text-muted-foreground text-sm">Generate structured, engineering-ready user stories for your product team.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startNew}><Plus className="h-4 w-4 mr-1" />New</Button>
          <Button size="sm" onClick={() => saveStory()} disabled={saving}>
            <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Saved stories sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Saved Stories</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> :
              saved?.length === 0 ? <p className="text-xs text-muted-foreground">No stories yet.</p> :
              saved?.map((s: any) => (
                <div key={s.id} className={`relative group w-full text-left p-2 rounded-md border text-sm transition-colors cursor-pointer ${editingId === s.id ? "border-accent bg-accent/10" : "border-border hover:bg-muted/50"}`}
                  onClick={() => loadStory(s)}>
                  <div className="font-medium truncate pr-6">{s.title}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant={s.status === "complete" ? "default" : "secondary"} className="text-[10px]">{s.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteStory(s.id); }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-4">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0" placeholder="User Story Title..." />

          {/* Step indicator */}
          <div className="flex items-center gap-1 flex-wrap">
            {STEPS.map((s, i) => (
              <button key={s} onClick={() => setStep(i)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium transition-colors ${i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] border border-current">{i + 1}</span>
                <span className="hidden md:inline">{s}</span>
              </button>
            ))}
          </div>

          {/* Step 0: Product Context */}
          {step === 0 && (
            <Card><CardHeader><CardTitle>Product Context</CardTitle><CardDescription>Describe the product and feature this story is for.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Product Name</Label><Input value={productContext.productName} onChange={(e) => setProductContext(c => ({ ...c, productName: e.target.value }))} placeholder="e.g., Product Nerve AI" /></div>
                  <div><Label>Target User</Label><Input value={productContext.targetUser} onChange={(e) => setProductContext(c => ({ ...c, targetUser: e.target.value }))} placeholder="e.g., Startup founders" /></div>
                </div>
                <div><Label>Product Description</Label><Textarea value={productContext.productDescription} onChange={(e) => setProductContext(c => ({ ...c, productDescription: e.target.value }))} placeholder="Brief description of the product..." /></div>
                <div><Label>Business Goal</Label><Input value={productContext.businessGoal} onChange={(e) => setProductContext(c => ({ ...c, businessGoal: e.target.value }))} placeholder="e.g., Enable secure venture validation" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><Label>Feature Name</Label><Input value={productContext.featureName} onChange={(e) => setProductContext(c => ({ ...c, featureName: e.target.value }))} placeholder="e.g., User Authentication" /></div>
                  <div><Label>Feature Description</Label><Input value={productContext.featureDescription} onChange={(e) => setProductContext(c => ({ ...c, featureDescription: e.target.value }))} placeholder="Secure login and registration" /></div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 1: Module */}
          {step === 1 && (
            <Card><CardHeader><CardTitle>Module Definition</CardTitle><CardDescription>Define the product module this story belongs to.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Module Name</Label><Input value={moduleDef.moduleName} onChange={(e) => setModuleDef(c => ({ ...c, moduleName: e.target.value }))} placeholder="e.g., Authentication, Payments, Analytics" /></div>
                <div><Label>Module Description</Label><Textarea value={moduleDef.moduleDescription} onChange={(e) => setModuleDef(c => ({ ...c, moduleDescription: e.target.value }))} placeholder="Describe what this module does..." /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Epic */}
          {step === 2 && (
            <Card><CardHeader><CardTitle>Epic Definition</CardTitle><CardDescription>Define the epic that this story belongs to.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Epic Title</Label><Input value={epicDef.epicTitle} onChange={(e) => setEpicDef(c => ({ ...c, epicTitle: e.target.value }))} placeholder="e.g., User Authentication System" /></div>
                <div><Label>Epic Description</Label><Textarea value={epicDef.epicDescription} onChange={(e) => setEpicDef(c => ({ ...c, epicDescription: e.target.value }))} placeholder="Describe the epic scope..." /></div>
                <div><Label>Epic Objective</Label><Input value={epicDef.epicObjective} onChange={(e) => setEpicDef(c => ({ ...c, epicObjective: e.target.value }))} placeholder="e.g., Enable secure user account access" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Story Definition */}
          {step === 3 && (
            <Card><CardHeader><CardTitle>User Story Definition</CardTitle><CardDescription>Define the core user story elements.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>User Persona</Label><Input value={storyDef.userPersona} onChange={(e) => setStoryDef(c => ({ ...c, userPersona: e.target.value }))} placeholder="e.g., Startup founder" /></div>
                <div><Label>User Need</Label><Input value={storyDef.userNeed} onChange={(e) => setStoryDef(c => ({ ...c, userNeed: e.target.value }))} placeholder="e.g., Secure account login" /></div>
                <div><Label>User Goal</Label><Input value={storyDef.userGoal} onChange={(e) => setStoryDef(c => ({ ...c, userGoal: e.target.value }))} placeholder="e.g., Access venture dashboard" /></div>
                <div><Label>Business Value</Label><Textarea value={storyDef.businessValue} onChange={(e) => setStoryDef(c => ({ ...c, businessValue: e.target.value }))} placeholder="Why this matters to the business..." /></div>
                <div><Label>Feature Trigger</Label><Input value={storyDef.featureTrigger} onChange={(e) => setStoryDef(c => ({ ...c, featureTrigger: e.target.value }))} placeholder="e.g., User clicks login button" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: User Flow */}
          {step === 4 && (
            <Card><CardHeader><CardTitle>User Flow Definition</CardTitle><CardDescription>Describe the intended interaction flow.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>Entry Point</Label><Input value={userFlow.entryPoint} onChange={(e) => setUserFlow(c => ({ ...c, entryPoint: e.target.value }))} placeholder="e.g., User lands on login page" /></div>
                <div><Label>User Actions</Label><Textarea value={userFlow.userActions} onChange={(e) => setUserFlow(c => ({ ...c, userActions: e.target.value }))} placeholder="Describe user actions step by step..." /></div>
                <div><Label>System Responses</Label><Textarea value={userFlow.systemResponses} onChange={(e) => setUserFlow(c => ({ ...c, systemResponses: e.target.value }))} placeholder="Describe system responses..." /></div>
                <div><Label>Exit Point</Label><Input value={userFlow.exitPoint} onChange={(e) => setUserFlow(c => ({ ...c, exitPoint: e.target.value }))} placeholder="e.g., User redirected to dashboard" /></div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Preconditions */}
          {step === 5 && (
            <Card><CardHeader><CardTitle>Preconditions</CardTitle><CardDescription>Define system state required before story execution.</CardDescription></CardHeader>
              <CardContent>
                <TagInput values={preconditions} onChange={setPreconditions} placeholder="e.g., User account exists" />
              </CardContent>
            </Card>
          )}

          {/* Step 6: Post Conditions */}
          {step === 6 && (
            <Card><CardHeader><CardTitle>Post Conditions</CardTitle><CardDescription>Define system state after story execution.</CardDescription></CardHeader>
              <CardContent>
                <TagInput values={postconditions} onChange={setPostconditions} placeholder="e.g., User session created" />
              </CardContent>
            </Card>
          )}

          {/* Step 7: Dependencies */}
          {step === 7 && (
            <Card><CardHeader><CardTitle>Dependencies</CardTitle><CardDescription>Identify dependencies for this story.</CardDescription></CardHeader>
              <CardContent>
                <TagInput values={dependencies} onChange={setDependencies} placeholder="e.g., Authentication service" />
              </CardContent>
            </Card>
          )}

          {/* Step 8: Design Considerations */}
          {step === 8 && (
            <Card><CardHeader><CardTitle>Design Considerations</CardTitle><CardDescription>Provide design inputs and requirements.</CardDescription></CardHeader>
              <CardContent>
                <TagInput values={designConsiderations} onChange={setDesignConsiderations} placeholder="e.g., Mobile responsiveness" />
              </CardContent>
            </Card>
          )}

          {/* Step 9: Technical Considerations */}
          {step === 9 && (
            <Card><CardHeader><CardTitle>Technical Considerations</CardTitle><CardDescription>Provide system architecture considerations.</CardDescription></CardHeader>
              <CardContent>
                <TagInput values={technicalConsiderations} onChange={setTechnicalConsiderations} placeholder="e.g., JWT authentication" />
              </CardContent>
            </Card>
          )}

          {/* Step 10: Definition of Done */}
          {step === 10 && (
            <Card><CardHeader><CardTitle>Definition of Done</CardTitle><CardDescription>Define completion criteria.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <TagInput values={definitionOfDone} onChange={setDefinitionOfDone} placeholder="e.g., All tests passing" />
                <div className="border-t pt-4 space-y-3">
                  <Button onClick={generateReport} disabled={generating} className="w-full">
                    {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Generate User Story Artifact
                  </Button>
                  <div className="flex gap-2">
                    <Dialog open={linkProjectOpen} onOpenChange={setLinkProjectOpen}>
                      <DialogTrigger asChild><Button variant="outline" className="flex-1"><Link2 className="h-4 w-4 mr-2" />Link to Project</Button></DialogTrigger>
                      <DialogContent>
                        <DialogHeader><DialogTitle>Link to Project</DialogTitle></DialogHeader>
                        <div className="space-y-2">
                          {projects?.map((p: any) => (
                            <button key={p.id} className="w-full text-left p-3 rounded-md border hover:bg-muted/50 transition-colors"
                              onClick={() => { saveStory(p.id); setLinkProjectOpen(false); }}>{p.name}</button>
                          ))}
                          {!projects?.length && <p className="text-sm text-muted-foreground">No projects in this workspace.</p>}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {report?.stories?.length > 0 && (
                      <Button variant="outline" className="flex-1" onClick={exportCSV}>
                        <Download className="h-4 w-4 mr-2" />Export CSV
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ArrowLeft className="h-4 w-4 mr-1" />Previous</Button>
            {step < STEPS.length - 1 && <Button onClick={() => setStep(s => s + 1)}>Next<ArrowRight className="h-4 w-4 ml-1" /></Button>}
          </div>

          {/* Generated Report */}
          {report && report.stories?.length > 0 && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-accent" />Generated User Stories</CardTitle>
                <CardDescription>Engineering-ready user story artifacts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {report.summary && <p className="text-sm text-muted-foreground">{report.summary}</p>}

                {report.stories.map((story: any, i: number) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{story.storyId} — {story.title}</h4>
                        <span className="text-xs text-muted-foreground">{story.module} → {story.epic}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{story.storyId}</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableBody>
                          <TableRow><TableCell className="font-medium text-xs w-44 text-muted-foreground">MODULE</TableCell><TableCell className="text-sm">{story.module}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">EPIC</TableCell><TableCell className="text-sm">{story.epic}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">WHY</TableCell><TableCell className="text-sm">{story.why}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">USER STORY</TableCell><TableCell className="text-sm italic">{story.story}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">PRE-CONDITION</TableCell><TableCell className="text-sm">{story.precondition}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">USER FLOW</TableCell><TableCell className="text-sm">{story.userFlow}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">POST CONDITION</TableCell><TableCell className="text-sm">{story.postCondition}</TableCell></TableRow>
                          <TableRow>
                            <TableCell className="font-medium text-xs text-muted-foreground align-top">ACCEPTANCE CRITERIA</TableCell>
                            <TableCell className="text-sm">
                              <div className="space-y-1">
                                <div><span className="font-medium text-xs text-primary">Happy Path:</span> {story.acceptanceCriteria?.happy}</div>
                                <div><span className="font-medium text-xs text-destructive">Unhappy Path:</span> {story.acceptanceCriteria?.unhappy}</div>
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">DEPENDENCIES</TableCell><TableCell className="text-sm">{story.dependencies}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">DESIGN</TableCell><TableCell className="text-sm">{story.designConsideration}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">TECHNICAL</TableCell><TableCell className="text-sm">{story.technicalConsiderations}</TableCell></TableRow>
                          <TableRow><TableCell className="font-medium text-xs text-muted-foreground">DEFINITION OF DONE</TableCell><TableCell className="text-sm">{story.definitionOfDone}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {report && !report.stories && (
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent" />Generated Output</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{typeof report === "string" ? report : JSON.stringify(report, null, 2)}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
