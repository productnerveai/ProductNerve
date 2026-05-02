import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileDown, CheckCircle2, Circle, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Phase1Container from "@/components/phase1/Phase1Container";
import Phase2Container from "@/components/phase2/Phase2Container";
import Phase3Container from "@/components/phase3/Phase3Container";
import MasterVentureDashboard from "@/components/dashboard/MasterVentureDashboard";
import PaywallModal from "@/components/billing/PaywallModal";
import { useProject } from "@/contexts/ProjectContext";

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { getProject } = useProject();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("phase1");
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Dummy access control
  const hasAccess = true;
  const accessLoading = false;

  useEffect(() => {
    if (projectId) loadProject();
  }, [projectId]);

  // Handle payment callback
  useEffect(() => {
    const payment = searchParams.get("payment");
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (payment === "success" && reference) {
      verifyPayment(reference);
    }

    // Deep-link into paywall
    if (searchParams.get("paywall") === "1") {
      setShowPaywall(true);
    }
  }, [searchParams]);

  const verifyPayment = async (_reference: string) => {
    // Payments disabled — coming soon
    toast.info("Payments will be activated shortly.");
  };

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await getProject(projectId!);
      if (data) {
        setProject(data);
        const p1 = data.phase1_status || "not_started";
        const p2 = data.phase2_status || "not_started";
        const p3 = data.phase3_status || "not_started";

        if (p3 === "locked" || p3 === "complete") {
          setActiveTab("dashboard");
        } else if (p2 === "locked" || p2 === "complete") {
          setActiveTab("phase3");
        } else if (p1 === "locked" || p1 === "complete") {
          setActiveTab("phase2");
        } else {
          setActiveTab("phase1");
        }
      } else {
        toast.error("Project not found");
      }
    } catch (error) {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }
    toast.loading("Generating comprehensive venture blueprint...", { id: "pdf" });
    
    try {
      // Fetch all validation data
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [r1, r2, r3, artifactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/validation/phase1/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase2/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/validation/phase3/${projectId}`, { headers }),
        fetch(`${API_BASE_URL}/artifacts?project_id=${projectId}`, { headers }),
      ]);

      const [d1, d2, d3, artifactsData] = await Promise.all([r1.json(), r2.json(), r3.json(), artifactsRes.json()]);

      // Extract phase data
      const p1Data = d1.data?.phase1_analysis || null;
      const p2Data = d2.data?.phase2_analysis || null;
      const p3Data = d3.data?.phase3_analysis || null;

      // Combine artifacts
      const allArtifacts = [];
      if (artifactsData.data?.prd?.artifacts) allArtifacts.push(...artifactsData.data.prd.artifacts.map(a => ({...a, type: 'PRD'})));
      if (artifactsData.data?.stories?.artifacts) allArtifacts.push(...artifactsData.data.stories.artifacts.map(a => ({...a, type: 'User Stories'})));
      if (artifactsData.data?.icp?.artifacts) allArtifacts.push(...artifactsData.data.icp.artifacts.map(a => ({...a, type: 'ICP Profile'})));

      // Generate comprehensive HTML
      const blueprintHtml = generateBlueprintHTML(project, p1Data, p2Data, p3Data, allArtifacts);
      
      const win = window.open("", "_blank");
      if (win) { 
        win.document.write(blueprintHtml); 
        win.document.close(); 
        setTimeout(() => win.print(), 500); 
      }
      toast.success("Comprehensive venture blueprint generated! Use Print > Save as PDF", { id: "pdf" });
    } catch (error) {
      console.error("Failed to generate blueprint:", error);
      toast.error("Failed to generate blueprint. Please try again.", { id: "pdf" });
    }
  };

  const generateBlueprintHTML = (project, p1Data, p2Data, p3Data, artifacts) => {
    const overallScore = project?.overall_score ?? (
      ((p1Data?.executive_summary?.viability_score || p1Data?.scoring_decisions?.viability_final || 0) * 0.4) +
      ((p2Data?.scoring_audit?.final_score || 0) * 0.3) +
      ((p3Data?.scoring_audit?.final_score || 0) * 0.3)
    );

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
              
              <h3>Strategic Routes</h3>
              ${p1Data.strategic_routes && p1Data.strategic_routes.length > 0 ? 
                p1Data.strategic_routes.map((route, index) => `
                  <div class="recommendation">
                    <strong>Route ${index + 1}: ${route.route || 'Unnamed Route'}</strong><br>
                    ${route.description || 'No description available'}<br>
                    ${route.recommended ? '<em>✓ Recommended</em>' : ''}
                  </div>
                `).join('') : 
                '<p>No strategic routes identified.</p>'
              }
              
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
              
              <h3>Validation Gaps</h3>
              ${p1Data.validation_gaps && p1Data.validation_gaps.length > 0 ? 
                p1Data.validation_gaps.map(gap => `<div class="risk-item"><strong>Gap:</strong> ${gap.area || 'Unknown'} - ${gap.description || 'No description'}</div>`).join('') : 
                '<p>No validation gaps identified.</p>'
              }
              
              <h3>Build Readiness</h3>
              ${p1Data.build_readiness ? `
                <div class="metric-row">
                  <span class="metric-label">Technical Feasibility</span>
                  <span class="metric-value">${p1Data.build_readiness.technical_feasibility || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Resource Requirements</span>
                  <span class="metric-value">${p1Data.build_readiness.resource_requirements || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Time to Market</span>
                  <span class="metric-value">${p1Data.build_readiness.time_to_market || 'N/A'}</span>
                </div>
              ` : '<p>No build readiness data available.</p>'}
              
              <h3>Confidence Breakdown</h3>
              ${p1Data.confidence_breakdown ? `
                <div class="metric-row">
                  <span class="metric-label">Problem-Solution Fit</span>
                  <span class="metric-value">${p1Data.confidence_breakdown.problem_solution_fit || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Product-Market Fit</span>
                  <span class="metric-value">${p1Data.confidence_breakdown.product_market_fit || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Founder-Market Fit</span>
                  <span class="metric-value">${p1Data.confidence_breakdown.founder_market_fit || 'N/A'}</span>
                </div>
              ` : '<p>No confidence breakdown available.</p>'}
              
              <h3>Recommendations</h3>
              ${p1Data.executive_summary?.recommendations ? 
                p1Data.executive_summary.recommendations.map(rec => `<div class="recommendation">• ${rec}</div>`).join('') : 
                '<p>No recommendations available.</p>'
              }
              
              <h3>Assumption Map</h3>
              ${p1Data.assumption_map && p1Data.assumption_map.length > 0 ? 
                p1Data.assumption_map.map(assumption => `
                  <div class="metric-row">
                    <span class="metric-label">${assumption.assumption || 'Assumption'}</span>
                    <span class="metric-value">${assumption.validation_status || 'Unvalidated'}</span>
                  </div>
                `).join('') : 
                '<p>No assumptions mapped.</p>'
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
              <div class="metric-row">
                <span class="metric-label">Execution Risk Level</span>
                <span class="metric-value">${p2Data.execution_risk_level || 'N/A'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-label">Primary Constraint</span>
                <span class="metric-value">${p2Data.primary_constraint || 'N/A'}</span>
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
              
              <h3>Strategic Build Logic</h3>
              ${p2Data.strategic_build_logic ? `
                <div class="metric-row">
                  <span class="metric-label">Build Philosophy</span>
                  <span class="metric-value">${p2Data.strategic_build_logic.build_philosophy || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">MVP Strategy</span>
                  <span class="metric-value">${p2Data.strategic_build_logic.mvp_strategy || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Scaling Path</span>
                  <span class="metric-value">${p2Data.strategic_build_logic.scaling_path || 'N/A'}</span>
                </div>
              ` : '<p>No strategic build logic available.</p>'}
              
              <h3>Product Architecture</h3>
              ${p2Data.product_architecture ? `
                <div class="metric-row">
                  <span class="metric-label">Technical Stack</span>
                  <span class="metric-value">${p2Data.product_architecture.tech_stack || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Architecture Pattern</span>
                  <span class="metric-value">${p2Data.product_architecture.architecture_pattern || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Scalability Design</span>
                  <span class="metric-value">${p2Data.product_architecture.scalability_design || 'N/A'}</span>
                </div>
              ` : '<p>No product architecture data available.</p>'}
              
              <h3>Feature Prioritization</h3>
              ${p2Data.feature_prioritization && p2Data.feature_prioritization.length > 0 ? 
                p2Data.feature_prioritization.map((feature, index) => `
                  <div class="metric-row">
                    <span class="metric-label">Feature ${index + 1}</span>
                    <span class="metric-value">${feature.name || 'Unnamed'} (Priority: ${feature.priority || 'N/A'})</span>
                  </div>
                `).join('') : 
                '<p>No feature prioritization available.</p>'
              }
              
              <h3>Execution Architecture</h3>
              ${p2Data.execution_architecture ? `
                <div class="metric-row">
                  <span class="metric-label">Team Structure</span>
                  <span class="metric-value">${p2Data.execution_architecture.team_structure?.team_composition || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Development Approach</span>
                  <span class="metric-value">${p2Data.execution_architecture.development_approach?.methodology || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Quality Assurance</span>
                  <span class="metric-value">${p2Data.execution_architecture.quality_assurance?.approach || 'N/A'}</span>
                </div>
              ` : '<p>No execution architecture data available.</p>'}
              
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
              
              <h3>Tool Stack</h3>
              ${p2Data.tool_stack && p2Data.tool_stack.length > 0 ? 
                p2Data.tool_stack.map(tool => `
                  <div class="metric-row">
                    <span class="metric-label">${tool.category || 'Tool'}</span>
                    <span class="metric-value">${tool.name || 'N/A'}</span>
                  </div>
                `).join('') : 
                '<p>No tool stack information available.</p>'
              }
              
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
              
              <h3>Execution Timeline</h3>
              ${p2Data.execution_timeline && p2Data.execution_timeline.length > 0 ? 
                p2Data.execution_timeline.map((milestone, index) => `
                  <div class="metric-row">
                    <span class="metric-label">Milestone ${index + 1}</span>
                    <span class="metric-value">${milestone.name || 'Unnamed'} (${milestone.timeline || 'No timeline'})</span>
                  </div>
                `).join('') : 
                '<p>No execution timeline available.</p>'
              }
              
              <h3>Scoring Audit Breakdown</h3>
              ${p2Data.scoring_audit?.pillar_scores ? `
                <div class="metric-row">
                  <span class="metric-label">Team Composition</span>
                  <span class="metric-value">${p2Data.scoring_audit.pillar_scores.team_composition?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Capital Efficiency</span>
                  <span class="metric-value">${p2Data.scoring_audit.pillar_scores.capital_efficiency?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Technical Complexity</span>
                  <span class="metric-value">${p2Data.scoring_audit.pillar_scores.technical_complexity?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Validation Approach</span>
                  <span class="metric-value">${p2Data.scoring_audit.pillar_scores.validation_approach?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Execution Commitment</span>
                  <span class="metric-value">${p2Data.scoring_audit.pillar_scores.execution_commitment?.score || 'N/A'}/20</span>
                </div>
              ` : '<p>No scoring audit breakdown available.</p>'}
              
              <h3>Risk Clusters</h3>
              ${p2Data.risk_clusters && Object.keys(p2Data.risk_clusters).length > 0 ? 
                Object.entries(p2Data.risk_clusters).map(([category, risks]) => `
                  <div class="risk-item">
                    <strong>${category}:</strong> ${Array.isArray(risks) ? risks.join(', ') : risks}
                  </div>
                `).join('') : 
                '<p>No risk clusters identified.</p>'
              }
              
              <h3>Build Readiness Gaps</h3>
              ${p2Data.build_readiness_gaps && p2Data.build_readiness_gaps.length > 0 ? 
                p2Data.build_readiness_gaps.map(gap => `<div class="risk-item"><strong>Gap:</strong> ${gap.area || 'Unknown'} - ${gap.description || 'No description'}</div>`).join('') : 
                '<p>No build readiness gaps identified.</p>'
              }
              
              <h3>Investor Snapshot</h3>
              ${p2Data.investor_snapshot ? `
                <div class="metric-row">
                  <span class="metric-label">Investment Readiness</span>
                  <span class="metric-value">${p2Data.investor_snapshot.investment_readiness || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Funding Stage</span>
                  <span class="metric-value">${p2Data.investor_snapshot.funding_stage || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Key Metrics</span>
                  <span class="metric-value">${p2Data.investor_snapshot.key_metrics || 'N/A'}</span>
                </div>
              ` : '<p>No investor snapshot available.</p>'}
              
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
                <span class="metric-label">Growth Confidence</span>
                <span class="metric-value">${p3Data.growth_confidence?.overall || 'N/A'}</span>
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
              ${p3Data.executive_summary?.action_summary ? `<p><strong>Action Summary:</strong> ${p3Data.executive_summary.action_summary}</p>` : ''}
              
              <h3>Growth Strategy Summary</h3>
              <p>${p3Data.executive_summary?.growth_strategy_summary || 'No growth strategy summary available.'}</p>
              
              <h3>Market Entry Architecture</h3>
              ${p3Data.market_entry_architecture ? `
                <div class="metric-row">
                  <span class="metric-label">Entry Strategy</span>
                  <span class="metric-value">${p3Data.market_entry_architecture.entry_strategy || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Target Segments</span>
                  <span class="metric-value">${p3Data.market_entry_architecture.target_segments ? p3Data.market_entry_architecture.target_segments.join(', ') : 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Geographic Focus</span>
                  <span class="metric-value">${p3Data.market_entry_architecture.geographic_focus || 'N/A'}</span>
                </div>
              ` : '<p>No market entry architecture data available.</p>'}
              
              <h3>Acquisition Engine</h3>
              ${p3Data.acquisition_engine ? `
                <div class="metric-row">
                  <span class="metric-label">Primary Channels</span>
                  <span class="metric-value">${p3Data.acquisition_engine.primary_channels ? p3Data.acquisition_engine.primary_channels.join(', ') : 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">CAC Target</span>
                  <span class="metric-value">${p3Data.acquisition_engine.cac_target || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Conversion Rate</span>
                  <span class="metric-value">${p3Data.acquisition_engine.conversion_rate || 'N/A'}</span>
                </div>
              ` : '<p>No acquisition engine data available.</p>'}
              
              <h3>Demand Channel Matrix</h3>
              ${p3Data.demand_channel_matrix && p3Data.demand_channel_matrix.length > 0 ? 
                p3Data.demand_channel_matrix.map((channel, index) => `
                  <div class="metric-row">
                    <span class="metric-label">Channel ${index + 1}</span>
                    <span class="metric-value">${channel.name || 'Unnamed'} (Efficiency: ${channel.efficiency || 'N/A'}, Cost: ${channel.cost || 'N/A'})</span>
                  </div>
                `).join('') : 
                '<p>No demand channel matrix available.</p>'
              }
              
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
              
              <h3>Growth Confidence Index</h3>
              ${p3Data.growth_confidence ? `
                <div class="metric-row">
                  <span class="metric-label">Customer Clarity</span>
                  <span class="metric-value">${p3Data.growth_confidence.customer_clarity || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Market Timing</span>
                  <span class="metric-value">${p3Data.growth_confidence.market_timing || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Distribution Feasibility</span>
                  <span class="metric-value">${p3Data.growth_confidence.distribution_feasibility || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Revenue Model</span>
                  <span class="metric-value">${p3Data.growth_confidence.revenue_model || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Pricing Strategy</span>
                  <span class="metric-value">${p3Data.growth_confidence.pricing_strategy || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Sales Efficiency</span>
                  <span class="metric-value">${p3Data.growth_confidence.sales_efficiency || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Retention Potential</span>
                  <span class="metric-value">${p3Data.growth_confidence.retention_potential || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Competitive Advantage</span>
                  <span class="metric-value">${p3Data.growth_confidence.competitive_advantage || 'N/A'}</span>
                </div>
              ` : '<p>No growth confidence index available.</p>'}
              
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
              
              <h3>Action 90-Day Plan</h3>
              ${p3Data.action_90day_plan && p3Data.action_90day_plan.length > 0 ? 
                p3Data.action_90day_plan.map((action, index) => `
                  <div class="metric-row">
                    <span class="metric-label">Month ${index + 1}</span>
                    <span class="metric-value">${action.action || 'Unnamed'} (${action.timeline || 'No timeline'})</span>
                  </div>
                `).join('') : 
                '<p>No 90-day action plan available.</p>'
              }
              
              <h3>Action Experiment Priorities</h3>
              ${p3Data.action_experiment_priorities && p3Data.action_experiment_priorities.length > 0 ? 
                p3Data.action_experiment_priorities.map((experiment, index) => `
                  <div class="metric-row">
                    <span class="metric-label">Experiment ${index + 1}</span>
                    <span class="metric-value">${experiment.name || 'Unnamed'} (Priority: ${experiment.priority || 'N/A'})</span>
                  </div>
                `).join('') : 
                '<p>No experiment priorities available.</p>'
              }
              
              <h3>Scoring Audit Breakdown</h3>
              ${p3Data.scoring_audit?.pillar_scores ? `
                <div class="metric-row">
                  <span class="metric-label">Customer Clarity</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.customer_clarity?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Market Timing</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.market_timing?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Distribution Feasibility</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.distribution_feasibility?.score || 'N/A'}/15</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Revenue Model</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.revenue_model?.score || 'N/A'}/20</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Pricing Strategy</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.pricing_strategy?.score || 'N/A'}/15</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Sales Efficiency</span>
                  <span class="metric-value">${p3Data.scoring_audit.pillar_scores.sales_efficiency?.score || 'N/A'}/20</span>
                </div>
              ` : '<p>No scoring audit breakdown available.</p>'}
              
              <h3>Growth Readiness Gaps</h3>
              ${p3Data.growth_readiness_gaps && p3Data.growth_readiness_gaps.length > 0 ? 
                p3Data.growth_readiness_gaps.map(gap => `<div class="risk-item"><strong>Gap:</strong> ${gap.area || 'Unknown'} - ${gap.description || 'No description'}</div>`).join('') : 
                '<p>No growth readiness gaps identified.</p>'
              }
              
              <h3>Investor Snapshot</h3>
              ${p3Data.investor_snapshot ? `
                <div class="metric-row">
                  <span class="metric-label">Growth Readiness</span>
                  <span class="metric-value">${p3Data.investor_snapshot.growth_readiness || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Funding Round</span>
                  <span class="metric-value">${p3Data.investor_snapshot.funding_round || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Key Metrics</span>
                  <span class="metric-value">${p3Data.investor_snapshot.key_metrics || 'N/A'}</span>
                </div>
              ` : '<p>No investor snapshot available.</p>'}
              
              <h3>AI Reasoning Trace</h3>
              ${p3Data.reasoning_trace ? `
                <div class="metric-row">
                  <span class="metric-label">Stage 1 - Problem Validation</span>
                  <span class="metric-value">${p3Data.reasoning_trace.stage_1_problem_validation || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Stage 2 - Solution Validation</span>
                  <span class="metric-value">${p3Data.reasoning_trace.stage_2_solution_validation || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Stage 3 - Market Validation</span>
                  <span class="metric-value">${p3Data.reasoning_trace.stage_3_market_validation || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Stage 11 - Constraint Analysis</span>
                  <span class="metric-value">${p3Data.reasoning_trace.stage_11_constraint || 'N/A'}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Stage 12 - Growth Strategy</span>
                  <span class="metric-value">${p3Data.reasoning_trace.stage_12_growth_strategy || 'N/A'}</span>
                </div>
              ` : '<p>No AI reasoning trace available.</p>'}
              
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
                  <small>Status: ${artifact.status || 'Unknown'} | Created: ${artifact.createdAt ? new Date(artifact.createdAt).toLocaleDateString() : 'N/A'}</small>
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

  const handleDashboardAccess = () => {
    if (!hasAccess) {
      setShowPaywall(true);
      return;
    }
    setActiveTab("dashboard");
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-16 text-muted-foreground">Project not found.</div>;

  const p1 = project.phase1_status || "not_started";
  const p2 = project.phase2_status || "not_started";
  const p3 = project.phase3_status || "not_started";

  const isP1Done = p1 === "locked" || p1 === "complete";
  const isP2Done = p2 === "locked" || p2 === "complete";
  const isP3Done = p3 === "locked" || p3 === "complete";

  const phaseSteps = [
    { key: "phase1", label: "Validation", done: isP1Done },
    { key: "phase2", label: "Execution", done: isP2Done },
    { key: "phase3", label: "Growth", done: isP3Done },
    { key: "dashboard", label: "Summary", done: isP3Done, locked: !hasAccess && isP3Done },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold">{project.name}</h1></div>
        <div className="flex items-center gap-2">
          <Link to={`/app/projects/${projectId}/overview`}>
            <Button variant="outline" className="gap-2"><Eye className="h-4 w-4" /> Overview</Button>
          </Link>
          <Button variant="outline" className="gap-2" onClick={handleExportPDF}><FileDown className="h-4 w-4" /> Export Full Blueprint</Button>
        </div>
      </div>

      {/* Phase progress stepper */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto">
        {phaseSteps.map((step, i) => {
          const isActive = activeTab === step.key;
          const isAccessible = step.key === "phase1"
            || (step.key === "phase2" && isP1Done)
            || (step.key === "phase3" && isP2Done)
            || (step.key === "dashboard" && isP3Done);

          return (
            <button
              key={step.key}
              onClick={() => {
                if (!isAccessible) return;
                if (step.key === "dashboard" && !hasAccess) {
                  setShowPaywall(true);
                  return;
                }
                setActiveTab(step.key);
              }}
              disabled={!isAccessible}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive ? "bg-primary text-primary-foreground shadow-sm" : ""}
                ${!isActive && isAccessible ? "bg-muted/50 text-foreground hover:bg-muted cursor-pointer" : ""}
                ${!isAccessible ? "text-muted-foreground/50 cursor-not-allowed" : ""}
              `}
            >
              {step.done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">{step.label}</span>
              {"locked" in step && step.locked && <span className="text-[10px] opacity-60">🔒</span>}
              {i < phaseSteps.length - 1 && (
                <span className={`ml-2 text-xs ${step.done ? "text-primary" : "text-muted-foreground/30"}`}>→</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "phase1" && (
          <Phase1Container
            projectId={projectId!}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase1_status: "complete" } : null);
              setActiveTab("phase2");
            }}
          />
        )}
        {activeTab === "phase2" && (
          <Phase2Container
            projectId={projectId!}
            phase1Status={p1}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase2_status: "complete" } : null);
              setActiveTab("phase3");
            }}
          />
        )}
        {activeTab === "phase3" && (
          <Phase3Container
            projectId={projectId!}
            phase2Status={p2}
            onPhaseComplete={() => {
              // Simulate phase completion
              setProject(prev => prev ? { ...prev, phase3_status: "complete" } : null);
              
              if (hasAccess) {
                setActiveTab("dashboard");
              } else {
                setShowPaywall(true);
                return;
              }
            }}
          />
        )}
        {activeTab === "dashboard" && hasAccess && project && (
          <MasterVentureDashboard project={project} onExportPDF={handleExportPDF} />
        )}
      </div>

      {showPaywall && (
        <PaywallModal
          projectId={projectId!}
          onClose={() => setShowPaywall(false)}
          onSuccess={() => {
            setShowPaywall(false);
            loadProject();
            setActiveTab("dashboard");
          }}
        />
      )}
    </div>
  );
}