import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import TrackingProvider from "@/components/TrackingProvider";

// Marketing
import MarketingLayout from "@/components/marketing/MarketingLayout";
import Homepage from "@/pages/Homepage";
// import PricingPage from "@/pages/PricingPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsPage from "@/pages/TermsPage";
import DataDeletionPolicyPage from "./pages/DataDeletionPolicyPage";
import SocialMediaPolicyPage from "./pages/SocialMediaPolicyPage";

// Auth
import AuthRedirect from "@/components/auth/AuthRedirect";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";

// App
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppLayout from "@/components/app/AppLayout";
import DashboardPage from "@/pages/app/DashboardPage";
import ProjectsPage from "@/pages/app/ProjectsPage";
import ProjectDetailPage from "@/pages/app/ProjectDetailPage";
import SettingsPage from "@/pages/app/SettingsPage";
import BillingPage from "@/pages/app/BillingPage";
import ICPBuilderPage from "@/pages/app/ICPBuilderPage";
import ExperimentEnginePage from "@/pages/app/ExperimentEnginePage";
import GrowthEnginePage from "@/pages/app/GrowthEnginePage";
import RoadmapGeneratorPage from "@/pages/app/RoadmapGeneratorPage";
import UserStoryGeneratorPage from "@/pages/app/UserStoryGeneratorPage";
import PRDGeneratorPage from "@/pages/app/PRDGeneratorPage";
import StudioArtifactsPage from "@/pages/app/StudioArtifactsPage";
import NotificationsPage from "@/pages/app/NotificationsPage";
import ProjectOverviewPage from "@/pages/app/ProjectOverviewPage";
import SupportInboxPage from "@/pages/app/SupportInboxPage";

// Admin
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminOverviewPage from "@/pages/admin/AdminOverviewPage";
import PlatformAnalyticsPage from "@/pages/admin/PlatformAnalyticsPage";
import ProductAnalyticsPage from "@/pages/admin/ProductAnalyticsPage";
import GrowthAnalyticsPage from "@/pages/admin/GrowthAnalyticsPage";
import UserManagementPage from "@/pages/admin/UserManagementPage";
import WorkspaceManagementPage from "@/pages/admin/WorkspaceManagementPage";
import KYCManagementPage from "@/pages/admin/KYCManagementPage";
import AdminBillingPage from "@/pages/admin/AdminBillingPage";
import ContactCenterPage from "@/pages/admin/ContactCenterPage";
import CommunicationCenterPage from "@/pages/admin/CommunicationCenterPage";
import ContentManagementPage from "@/pages/admin/ContentManagementPage";
import StudioAnalyticsPage from "@/pages/admin/StudioAnalyticsPage";
import StudioContentPage from "@/pages/admin/StudioContentPage";
// import StudioAIMonitoringPage from "@/pages/admin/StudioAIMonitoringPage";
// import StudioActivityPage from "@/pages/admin/StudioActivityPage";
// import StudioModerationPage from "@/pages/admin/StudioModerationPage";
// import SecurityAuditPage from "@/pages/admin/SecurityAuditPage";
// import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

// Error pages
import ForbiddenPage from "@/pages/ForbiddenPage";
// import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceProvider>
              <ProjectProvider>
                <TrackingProvider>
                  <Routes>
                {/* Marketing */}
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<AuthRedirect><Homepage /></AuthRedirect>} />
                  {/* <Route path="/pricing" element={<PricingPage />} /> */}
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/privacy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms-and-conditions" element={<TermsPage />} />
                  <Route path="/terms" element={<Navigate to="/terms-and-conditions" replace />} />
                  <Route path="/data-deletion" element={<DataDeletionPolicyPage />} />
                  <Route path="/social-media-policy" element={<SocialMediaPolicyPage />} />
                </Route>

                {/* Redirects for removed pages */}
                <Route path="/about" element={<Navigate to="/" replace />} />
                <Route path="/solutions" element={<Navigate to="/" replace />} />

                {/* Auth */}
                <Route path="/login" element={<AuthRedirect><LoginPage /></AuthRedirect>} />
                <Route path="/signup" element={<AuthRedirect><SignupPage /></AuthRedirect>} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* 403 Forbidden */}
                <Route path="/forbidden" element={<ForbiddenPage />} />

                {/* Protected App */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/app" element={<AppLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                    <Route path="projects/:projectId/overview" element={<ProjectOverviewPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="billing" element={<BillingPage />} />
                    <Route path="support" element={<SupportInboxPage />} />
                    <Route path="studio/icp-builder" element={<ICPBuilderPage />} />
                    <Route path="studio/icp-builder/:icpId" element={<ICPBuilderPage />} />
                    <Route path="studio/experiment-engine" element={<ExperimentEnginePage />} />
                    <Route path="studio/experiment-engine/:experimentId" element={<ExperimentEnginePage />} />
                    <Route path="studio/growth-engine" element={<GrowthEnginePage />} />
                    <Route path="studio/growth-engine/:growthId" element={<GrowthEnginePage />} />
                    <Route path="studio/roadmap-generator" element={<RoadmapGeneratorPage />} />
                    <Route path="studio/roadmap-generator/:roadmapId" element={<RoadmapGeneratorPage />} />
                    <Route path="studio/user-stories" element={<UserStoryGeneratorPage />} />
                    <Route path="studio/user-stories/:storyId" element={<UserStoryGeneratorPage />} />
                    <Route path="studio/prd-generator" element={<PRDGeneratorPage />} />
                    <Route path="studio/prd-generator/:prdId" element={<PRDGeneratorPage />} />
                    <Route path="studio/artifacts" element={<StudioArtifactsPage />} />
                  </Route>
                </Route>

                {/* Admin Dashboard */}
                <Route element={<AdminProtectedRoute />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="platform-analytics" element={<PlatformAnalyticsPage />} />
                    <Route path="product-analytics" element={<ProductAnalyticsPage />} />
                    <Route path="growth-analytics" element={<GrowthAnalyticsPage />} />
                    <Route path="users" element={<UserManagementPage />} />
                    <Route path="workspaces" element={<WorkspaceManagementPage />} />
                    <Route path="kyc" element={<KYCManagementPage />} />
                    <Route path="billing" element={<AdminBillingPage />} />
                    <Route path="contacts" element={<ContactCenterPage />} />
                    <Route path="communications" element={<CommunicationCenterPage />} />
                    <Route path="content" element={<ContentManagementPage />} />
                    <Route path="studio-analytics" element={<StudioAnalyticsPage />} />
                    <Route path="studio-content" element={<StudioContentPage />} />
                    {/* <Route path="studio-ai" element={<StudioAIMonitoringPage />} /> */}
                    {/* <Route path="studio-activity" element={<StudioActivityPage />} /> */}
                    {/* <Route path="studio-moderation" element={<StudioModerationPage />} /> */}
                    {/* <Route path="security" element={<SecurityAuditPage />} /> */}
                    {/* <Route path="settings" element={<AdminSettingsPage />} /> */}
                  </Route>
                </Route>

                {/* <Route path="*" element={<NotFound />} /> */}
              </Routes>
                </TrackingProvider>
              </ProjectProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App
