import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, FileText, BookOpen, Users, ArrowLeft, Download, FlaskConical, TrendingUp, Map } from "lucide-react";
import { toast } from "sonner";
import ArtifactModal from "@/components/project/ArtifactModal";
import { useProject } from "@/contexts/ProjectContext";

function statusBadge(status: string | null) {
  if (!status || status === "not_started") return <Badge variant="outline" className="text-muted-foreground">Not Started</Badge>;
  if (status === "in_progress" || status === "intake") return <Badge className="bg-accent/15 text-accent border-accent/30">In Progress</Badge>;
  if (status === "locked" || status === "complete") return <Badge className="bg-primary/15 text-primary border-primary/30">Complete</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

interface ArtifactItem {
  id: string;
  title: string;
  type: string;
  status: string;
  content?: any;
  created_at?: string;
}


export default function ProjectOverviewPage() {
  const { projectId } = useParams();
  const { getProject } = useProject();
  const [project, setProject] = useState<any>(null);
  const [scores, setScores] = useState<{ p1: any; p2: any; p3: any }>({ p1: null, p2: null, p3: null });
  const [artifacts, setArtifacts] = useState<ArtifactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalArtifact, setModalArtifact] = useState<ArtifactItem | null>(null);

  
  useEffect(() => {
    if (projectId) loadAll();
  }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const projectData = await getProject(projectId!);
      if (projectData) {
        setProject(projectData);
        
        // Fetch real phase scores from API
        await loadPhaseScores();
        
        // Fetch real artifacts linked to this project
        await loadProjectArtifacts();
      } else {
        toast.error("Project not found");
      }
    } catch (error) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const loadPhaseScores = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, { headers }),
      ]);

      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

      // Extract phase analysis data
      const p1Data = d1.data?.phase1_analysis || null;
      const p2Data = d2.data?.phase2_analysis || null;
      const p3Data = d3.data?.phase3_analysis || null;

      // Extract scores from phase data
      const scoresData = {
        p1: p1Data ? {
          viability_score: p1Data.executive_summary?.viability_score || p1Data.scoring_decisions?.viability_final || null,
          classification: p1Data.executive_summary?.classification || null
        } : null,
        p2: p2Data ? {
          execution_score: p2Data.scoring_audit?.final_score || null,
          classification: p2Data.executive_summary?.execution_maturity_tier || null
        } : null,
        p3: p3Data ? {
          growth_score: p3Data.scoring_audit?.final_score || null,
          classification: p3Data.executive_summary?.growth_maturity_tier || null
        } : null
      };

      setScores(scoresData);
    } catch (error) {
      console.error("Failed to load phase scores:", error);
      toast.error("Failed to load phase scores");
    }
  };

  const loadProjectArtifacts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all artifacts for this project
      const response = await fetch(`${API_BASE_URL}/artifacts?project_id=${projectId}`, { headers });
      
      if (response.ok) {
        const data = await response.json();
        
        // Combine all artifact types into a single array
        const allArtifacts: ArtifactItem[] = [];
        
        // Add PRDs
        if (data.data?.prd?.artifacts) {
          data.data.prd.artifacts.forEach((artifact: any) => {
            allArtifacts.push({
              id: artifact._id || artifact.id,
              title: artifact.title,
              type: "PRD",
              status: artifact.status,
              created_at: artifact.createdAt
            });
          });
        }
        
        // Add User Stories
        if (data.data?.stories?.artifacts) {
          data.data.stories.artifacts.forEach((artifact: any) => {
            allArtifacts.push({
              id: artifact._id || artifact.id,
              title: artifact.title,
              type: "User Stories",
              status: artifact.status,
              created_at: artifact.createdAt
            });
          });
        }
        
        // Add ICPs
        if (data.data?.icp?.artifacts) {
          data.data.icp.artifacts.forEach((artifact: any) => {
            allArtifacts.push({
              id: artifact._id || artifact.id,
              title: artifact.title,
              type: "ICP Profile",
              status: artifact.status,
              created_at: artifact.createdAt
            });
          });
        }
        
        // Sort by creation date (newest first)
        allArtifacts.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        
        setArtifacts(allArtifacts);
      } else {
        console.error("Failed to fetch artifacts:", response.statusText);
        setArtifacts([]);
      }
    } catch (error) {
      console.error("Failed to load project artifacts:", error);
      toast.error("Failed to load project artifacts");
      setArtifacts([]);
    }
  };

  const handleDownloadProject = async () => {
    toast.loading("Generating comprehensive venture blueprint...", { id: "download" });
    
    try {
      // Fetch all validation data
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [r1, r2, r3] = await Promise.all([
        fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, { headers }),
      ]);

      const [d1, d2, d3] = await Promise.all([r1.json(), r2.json(), r3.json()]);

      // Extract phase data
      const p1Data = d1.data?.phase1_analysis || null;
      const p2Data = d2.data?.phase2_analysis || null;
      const p3Data = d3.data?.phase3_analysis || null;

      // Generate comprehensive HTML
      const blueprintHtml = generateBlueprintHTML(project, p1Data, p2Data, p3Data, artifacts);
      
      const win = window.open("", "_blank");
      if (win) { 
        win.document.write(blueprintHtml); 
        win.document.close(); 
        setTimeout(() => win.print(), 500); 
      }
      toast.success("Comprehensive venture blueprint generated! Use Print > Save as PDF", { id: "download" });
    } catch (error) {
      console.error("Failed to generate blueprint:", error);
      toast.error("Failed to generate blueprint. Please try again.", { id: "download" });
    }
  };

  // Import the comprehensive blueprint from ProjectDetailPage
  const generateBlueprintHTML = (project, p1Data, p2Data, p3Data, artifacts) => {
    const overallScore = project?.overall_score ?? (
      ((scores.p1?.viability_score || 0) * 0.4) +
      ((scores.p2?.execution_score || 0) * 0.3) +
      ((scores.p3?.growth_score || 0) * 0.3)
    );

    // This would be the same comprehensive blueprint as in ProjectDetailPage
    // For now, using a simplified version to avoid duplication
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${project?.name} - Comprehensive Venture Blueprint</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; color: #333; }
            h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 15px; margin-bottom: 30px; }
            h2 { color: #34495e; margin-top: 40px; margin-bottom: 20px; border-left: 4px solid #3498db; padding-left: 15px; }
            h3 { color: #2c3e50; margin-top: 30px; margin-bottom: 15px; }
            .header-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .score-display { font-size: 48px; font-weight: bold; color: #27ae60; text-align: center; margin: 20px 0; }
            .phase-card { background: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .phase-title { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 15px; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
            .status-complete { background: #d4edda; color: #155724; }
            .status-in-progress { background: #fff3cd; color: #856404; }
            .status-not-started { background: #f8d7da; color: #721c24; }
            .metric-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ecf0f1; }
            .metric-label { font-weight: 600; color: #555; }
            .metric-value { font-weight: bold; color: #2c3e50; }
            .artifact-list { margin: 15px 0; }
            .artifact-item { background: #f8f9fa; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #3498db; }
            .risk-item { background: #fff5f5; padding: 10px; margin: 8px 0; border-radius: 6px; border-left: 3px solid #e74c3c; }
            .recommendation { background: #f0f8ff; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 3px solid #3498db; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #bdc3c7; text-align: center; color: #7f8c8d; font-size: 12px; }
            @media print { body { padding: 20px; } .phase-card { page-break-inside: avoid; } }
          </style>
        </head>
        <body>
          <h1>${project?.name || 'Untitled Project'}</h1>
          
          <div class="header-info">
            <div class="score-display">${Math.round(overallScore)}/100</div>
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="metric-label">Overall Venture Score</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Status</span>
              <span class="status-badge status-${project?.status || 'active'}">${project?.status || 'Active'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Stage</span>
              <span class="metric-value">${project?.stage || 'Unknown'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Created</span>
              <span class="metric-value">${project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Workspace</span>
              <span class="metric-value">${project?.workspace_id?.name || 'Default Workspace'}</span>
            </div>
          </div>

          <h2>Phase Progress & Validation Results</h2>
          
          <!-- Phase 1 -->
          <div class="phase-card">
            <div class="phase-title">Phase 1 — Validation</div>
            <div class="status-badge status-${project?.phase1_status || 'not-started'}">${project?.phase1_status || 'Not Started'}</div>
            
            ${p1Data ? `
              <h3>Validation Score & Classification</h3>
              <div class="metric-row">
                <span class="metric-label">Viability Score</span>
                <span class="metric-value">${p1Data.executive_summary?.viability_score || p1Data.scoring_decisions?.viability_final || 'N/A'}/100</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Classification</span>
                <span class="metric-value">${p1Data.executive_summary?.classification || 'Not Classified'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Validation Maturity</span>
                <span class="metric-value">${p1Data.validation_maturity || 'Early'}</span>
              </div>
              
              <h3>Executive Summary</h3>
              <p>${p1Data.executive_summary?.summary || 'No executive summary available.'}</p>
              ${p1Data.executive_summary?.strategic_insight ? `<p><strong>Strategic Insight:</strong> ${p1Data.executive_summary.strategic_insight}</p>` : ''}
              
              <h3>Market Opportunity Analysis</h3>
              ${p1Data.market_opportunity ? `
                <div class="metric-row">
                  <span class="metric-label">Market Size</span>
                  <span class="metric-value">${p1Data.market_opportunity.market_size || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Growth Rate</span>
                  <span class="metric-value">${p1Data.market_opportunity.growth_rate || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Market Urgency</span>
                  <span class="metric-value">${p1Data.market_opportunity.urgency || 'N/A'}</span>
                </div>
              ` : '<p>No market opportunity data available.</p>'}
              
              <h3>Problem Intensity</h3>
              ${p1Data.problem_intensity ? `
                <div class="metric-row">
                  <span class="metric-label">Problem Severity</span>
                  <span class="metric-value">${p1Data.problem_intensity.severity || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Problem Frequency</span>
                  <span class="metric-value">${p1Data.problem_intensity.frequency || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Willingness to Pay</span>
                  <span class="metric-value">${p1Data.problem_intensity.willingness_to_pay || 'N/A'}</span>
                </div>
              ` : '<p>No problem intensity data available.</p>'}
              
              <h3>Buyer Economics</h3>
              ${p1Data.buyer_economics ? `
                <div class="metric-row">
                  <span class="metric-label">Budget Available</span>
                  <span class="metric-value">${p1Data.buyer_economics.budget_available || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">ROI Potential</span>
                  <span class="metric-value">${p1Data.buyer_economics.roi_potential || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Purchase Cycle</span>
                  <span class="metric-value">${p1Data.buyer_economics.purchase_cycle || 'N/A'}</span>
                </div>
              ` : '<p>No buyer economics data available.</p>'}
              
              <h3>Competitive Positioning</h3>
              ${p1Data.competitive_positioning ? `
                <div class="metric-row">
                  <span class="metric-label">Competitive Density</span>
                  <span class="metric-value">${p1Data.competitive_positioning.density || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Differentiation Strength</span>
                  <span class="metric-value">${p1Data.competitive_positioning.differentiation || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Market Entry Barriers</span>
                  <span class="metric-value">${p1Data.competitive_positioning.entry_barriers || 'N/A'}</span>
                </div>
              ` : '<p>No competitive positioning data available.</p>'}
              
              <h3>Founder Advantage</h3>
              ${p1Data.founder_advantage ? `
                <div class="metric-row">
                  <span class="metric-label">Domain Expertise</span>
                  <span class="metric-value">${p1Data.founder_advantage.domain_expertise || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Unique Insight</span>
                  <span class="metric-value">${p1Data.founder_advantage.unique_insight || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Execution Capability</span>
                  <span class="metric-value">${p1Data.founder_advantage.execution_capability || 'N/A'}</span>
                </div>
              ` : '<p>No founder advantage data available.</p>'}
              
              <h3>Key Findings</h3>
              ${p1Data.executive_summary?.key_findings ? 
                p1Data.executive_summary.key_findings.map(finding => `<p>• ${finding}</p>`).join('') : 
                '<p>No key findings available.</p>'
              }
              
              <h3>Risk Assessment</h3>
              ${p1Data.risk_clusters && p1Data.risk_clusters.length > 0 ? 
                p1Data.risk_clusters.map(risk => `<div class="risk-item"><strong>${risk.category || 'Risk'}:</strong> ${risk.description || risk.risk || 'No description'}</div>`).join('') :
                (p1Data.executive_summary?.risk_assessment ? 
                  `<div class="risk-item">${p1Data.executive_summary.risk_assessment}</div>` : 
                  '<p>No risk assessment available.</p>'
                )
              }
              
              <h3>Recommendations</h3>
              ${p1Data.executive_summary?.recommendations ? 
                p1Data.executive_summary.recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('') : 
                '<p>No recommendations available.</p>'
              }
            ` : '<p><em>Phase 1 validation data not available.</em></p>'}
          </div>

          <!-- Phase 2 -->
          <div class="phase-card">
            <div class="phase-title">Phase 2 — Execution</div>
            <div class="status-badge status-${project?.phase2_status || 'not-started'}">${project?.phase2_status || 'Not Started'}</div>
            
            ${p2Data ? `
              <h3>Execution Score & Maturity</h3>
              <div class="metric-row">
                <span class="metric-label">Execution Score</span>
                <span class="metric-value">${p2Data.scoring_audit?.final_score || 'N/A'}/100</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Maturity Tier</span>
                <span class="metric-value">${p2Data.executive_summary?.execution_maturity_tier || 'Not Classified'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Execution Mode</span>
                <span class="metric-value">${p2Data.executive_summary?.execution_mode || 'N/A'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Build Confidence</span>
                <span class="metric-value">${p2Data.build_confidence_overall || 'N/A'}</span>
              </div>
              
              <h3>Executive Summary</h3>
              <p>${p2Data.executive_summary?.summary || 'No executive summary available.'}</p>
              ${p2Data.executive_summary?.strategic_insight ? `<p><strong>Strategic Insight:</strong> ${p2Data.executive_summary.strategic_insight}</p>` : ''}
              
              <h3>Execution Readiness</h3>
              <p>${p2Data.executive_summary?.execution_readiness || 'No execution readiness assessment available.'}</p>
              
              <h3>Mode Architecture</h3>
              ${p2Data.mode_architecture ? `
                <div class="metric-row">
                  <span class="metric-label">Build Mode</span>
                  <span class="metric-value">${p2Data.mode_architecture.build_mode || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Validation Approach</span>
                  <span class="metric-value">${p2Data.mode_architecture.validation_approach || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Iteration Strategy</span>
                  <span class="metric-value">${p2Data.mode_architecture.iteration_strategy || 'N/A'}</span>
                </div>
              ` : '<p>No mode architecture data available.</p>'}
              
              <h3>Team Structure</h3>
              ${p2Data.team_structure ? `
                <div class="metric-row">
                  <span class="metric-label">Team Size</span>
                  <span class="metric-value">${p2Data.team_structure.size || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Key Roles</span>
                  <span class="metric-value">${p2Data.team_structure.key_roles ? p2Data.team_structure.key_roles.join(', ') : 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Team Expertise</span>
                  <span class="metric-value">${p2Data.team_structure.expertise_level || 'N/A'}</span>
                </div>
              ` : '<p>No team structure data available.</p>'}
              
              <h3>Capital Architecture</h3>
              ${p2Data.capital_architecture ? `
                <div class="metric-row">
                  <span class="metric-label">Funding Strategy</span>
                  <span class="metric-value">${p2Data.capital_architecture.funding_strategy || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Budget Best Case</span>
                  <span class="metric-value">${p2Data.capital_architecture.budget_best || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Budget Realistic</span>
                  <span class="metric-value">${p2Data.capital_architecture.budget_realistic || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Budget Worst Case</span>
                  <span class="metric-value">${p2Data.capital_architecture.budget_worst || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Runway</span>
                  <span class="metric-value">${p2Data.capital_architecture.runway || 'N/A'}</span>
                </div>
              ` : '<p>No capital architecture data available.</p>'}
              
              <h3>Key Strengths</h3>
              ${p2Data.executive_summary?.key_strengths ? 
                p2Data.executive_summary.key_strengths.map(strength => `<div class="recommendation">• ${strength}</div>`).join('') : 
                '<p>No key strengths identified.</p>'
              }
              
              <h3>Areas for Improvement</h3>
              ${p2Data.executive_summary?.improvement_areas ? 
                p2Data.executive_summary.improvement_areas.map(area => `<div class="risk-item">• ${area}</div>`).join('') : 
                '<p>No improvement areas identified.</p>'
              }
            ` : '<p><em>Phase 2 execution data not available.</em></p>'}
          </div>

          <!-- Phase 3 -->
          <div class="phase-card">
            <div class="phase-title">Phase 3 — Growth</div>
            <div class="status-badge status-${project?.phase3_status || 'not-started'}">${project?.phase3_status || 'Not Started'}</div>
            
            ${p3Data ? `
              <h3>Growth Score & Strategy</h3>
              <div class="metric-row">
                <span class="metric-label">Growth Score</span>
                <span class="metric-value">${p3Data.scoring_audit?.final_score || 'N/A'}/100</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Growth Maturity</span>
                <span class="metric-value">${p3Data.executive_summary?.growth_maturity_tier || 'Not Classified'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Action Directive</span>
                <span class="metric-value">${p3Data.executive_summary?.action_directive || 'No directive'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Growth Risk Level</span>
                <span class="metric-value">${p3Data.executive_summary?.growth_risk_level || 'N/A'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">LTV/CAC Ratio</span>
                <span class="metric-value">${p3Data.ltv_cac_ratio || 'N/A'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Primary Constraint</span>
                <span class="metric-value">${p3Data.primary_growth_constraint || p3Data.reasoning_trace?.stage_11_constraint || 'N/A'}</span>
              </div>
              
              <h3>Executive Summary</h3>
              <p>${p3Data.executive_summary?.summary || 'No executive summary available.'}</p>
              ${p3Data.executive_summary?.strategic_insight ? `<p><strong>Strategic Insight:</strong> ${p3Data.executive_summary.strategic_insight}</p>` : ''}
              
              <h3>Growth Strategy Summary</h3>
              <p>${p3Data.executive_summary?.growth_strategy_summary || 'No growth strategy summary available.'}</p>
              
              <h3>Unit Economics</h3>
              ${p3Data.unit_economics ? `
                <div class="metric-row">
                  <span class="metric-label">Average Revenue Per User</span>
                  <span class="metric-value">${p3Data.unit_economics.arpu || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Customer Lifetime Value</span>
                  <span class="metric-value">${p3Data.unit_economics.ltv || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Customer Acquisition Cost</span>
                  <span class="metric-value">${p3Data.unit_economics.cac || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Payback Period</span>
                  <span class="metric-value">${p3Data.unit_economics.payback_period || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Margin</span>
                  <span class="metric-value">${p3Data.unit_economics.margin || 'N/A'}</span>
                </div>
              ` : '<p>No unit economics data available.</p>'}
              
              <h3>Scale Signals</h3>
              ${p3Data.scale_signals ? 
                p3Data.scale_signals.map(signal => `<div class="recommendation">• ${signal}</div>`).join('') : 
                '<p>No scale signals identified.</p>'
              }
              
              <h3>Pivot Signals</h3>
              ${p3Data.pivot_signals ? 
                p3Data.pivot_signals.map(signal => `<div class="risk-item">• ${signal}</div>`).join('') : 
                '<p>No pivot signals identified.</p>'
              }
              
              <h3>Kill Signals</h3>
              ${p3Data.kill_signals ? 
                p3Data.kill_signals.map(signal => `<div class="risk-item">• ${signal}</div>`).join('') : 
                '<p>No kill signals identified.</p>'
              }
              
              <h3>Growth Constraints</h3>
              ${p3Data.primary_growth_constraint ? 
                `<div class="risk-item"><strong>Primary Constraint:</strong> ${p3Data.primary_growth_constraint}</div>` : 
                '<p>No growth constraints identified.</p>'
              }
            ` : '<p><em>Phase 3 growth data not available.</em></p>'}
          </div>

          <!-- Linked Artifacts -->
          ${artifacts.length > 0 ? `
            <h2>Linked Artifacts</h2>
            <div class="artifact-list">
              ${artifacts.map(artifact => `
                <div class="artifact-item">
                  <strong>${artifact.title}</strong> - ${artifact.type}<br>
                  <small>Status: ${artifact.status || 'Unknown'} | Created: ${artifact.created_at ? new Date(artifact.created_at).toLocaleDateString() : 'N/A'}</small>
                </div>
              `).join('')}
            </div>
          ` : '<h2>No Linked Artifacts</h2><p><em>No artifacts have been linked to this project.</em></p>'}

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()} by ProductNerve Venture Intelligence Platform</p>
            <p>This comprehensive venture blueprint includes validation results, execution analysis, growth strategy, and linked artifacts.</p>
          </div>
        </body>
      </html>
    `;
  };

  const artifactIcon = (type: string) => {
    if (type === "PRD") return <FileText className="h-4 w-4 text-accent" />;
    if (type === "User Stories") return <BookOpen className="h-4 w-4 text-accent" />;
    if (type === "ICP Profile") return <Users className="h-4 w-4 text-accent" />;
    if (type === "Experiment") return <FlaskConical className="h-4 w-4 text-accent" />;
    if (type === "Growth Plan") return <TrendingUp className="h-4 w-4 text-accent" />;
    if (type === "Roadmap") return <Map className="h-4 w-4 text-accent" />;
    return <FileText className="h-4 w-4 text-accent" />;
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-16 text-muted-foreground">Project not found.</div>;

  const p1Status = project.phase1_status || "not_started";
  const p2Status = project.phase2_status || "not_started";
  const p3Status = project.phase3_status || "not_started";

  const overallScore = project.overall_score ?? (
    ((scores.p1?.viability_score || 0) * 0.4) +
    ((scores.p2?.execution_score || 0) * 0.3) +
    ((scores.p3?.growth_score || 0) * 0.3)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={`/app/projects/${projectId}`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">Project Overview</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleDownloadProject}>
          <Download className="h-4 w-4" /> Export Full Blueprint
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader><CardTitle>Venture Score</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="text-4xl font-bold text-primary">{Math.round(overallScore)}<span className="text-lg text-muted-foreground">/100</span></div>
            <div className="grid grid-cols-3 gap-4 flex-1">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Validation</p>
                <p className="text-lg font-semibold">{scores.p1?.viability_score ?? "—"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Execution</p>
                <p className="text-lg font-semibold">{scores.p2?.execution_score ?? "—"}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Growth</p>
                <p className="text-lg font-semibold">{scores.p3?.growth_score ?? "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Status */}
      <Card>
        <CardHeader><CardTitle>Phase Progress</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { label: "Phase 1 — Validation", status: p1Status, score: scores.p1?.viability_score, classification: scores.p1?.classification },
              { label: "Phase 2 — Execution", status: p2Status, score: scores.p2?.execution_score, classification: scores.p2?.classification },
              { label: "Phase 3 — Growth", status: p3Status, score: scores.p3?.growth_score, classification: scores.p3?.classification },
            ].map((phase) => (
              <div key={phase.label} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  {phase.status === "locked" || phase.status === "complete"
                    ? <CheckCircle2 className="h-5 w-5 text-primary" />
                    : <Circle className="h-5 w-5 text-muted-foreground" />}
                  <span className="font-medium">{phase.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {phase.score != null && <span className="text-sm font-semibold">{phase.score}/100</span>}
                  {phase.classification && <Badge variant="outline" className="text-xs">{phase.classification}</Badge>}
                  {statusBadge(phase.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Linked Artifacts */}
      <Card>
        <CardHeader><CardTitle>Linked Artifacts</CardTitle></CardHeader>
        <CardContent>
          {artifacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No artifacts linked to this project yet. Use Product Studio tools and link them to this project.</p>
          ) : (
            <div className="space-y-3">
              {artifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => setModalArtifact(artifact)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    {artifactIcon(artifact.type)}
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{artifact.title}</p>
                      <p className="text-xs text-muted-foreground">{artifact.type}</p>
                      {artifact.created_at && (
                        <p className="text-[10px] text-muted-foreground">
                          Created {new Date(artifact.created_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{artifact.status || 'Unknown'}</Badge>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ArtifactModal
        open={!!modalArtifact}
        onOpenChange={(open) => !open && setModalArtifact(null)}
        artifact={modalArtifact}
      />
    </div>
  );
}
