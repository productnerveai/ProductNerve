import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Homepage from '@/pages/Homepage'
import MarketingLayout from './components/marketing/MarketingLayout'
import DataDeletionPolicyPage from './pages/DataDeletionPolicyPage'
import SocialMediaPolicyPage from './pages/SocialMediaPolicyPage'
import TermsPage from './pages/TermsPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import BlogPostPage from './pages/BlogPostPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ForbiddenPage from './pages/ForbiddenPage'
import AppLayout from './components/app/AppLayout'
import DashboardPage from './pages/app/DashboardPage'
import ProjectsPage from './pages/app/ProjectsPage'
import ProjectDetailPage from './pages/app/ProjectDetailPage'
import ProjectOverviewPage from './pages/app/ProjectOverviewPage'
import SettingsPage from './pages/app/SettingsPage'
import NotificationsPage from './pages/app/NotificationsPage'
import BillingPage from './pages/app/BillingPage'
import SupportInboxPage from './pages/app/SupportInboxPage'
import ICPBuilderPage from './pages/app/ICPBuilderPage'
import ExperimentEnginePage from './pages/app/ExperimentEnginePage'
import GrowthEnginePage from './pages/app/GrowthEnginePage'
import RoadmapGeneratorPage from './pages/app/RoadmapGeneratorPage'
import UserStoryGeneratorPage from './pages/app/UserStoryGeneratorPage'
import PRDGeneratorPage from './pages/app/PRDGeneratorPage'
import StudioArtifactsPage from './pages/app/StudioArtifactsPage'
import AdminLayout from './components/admin/AdminLayout'
import AdminOverviewPage from './pages/admin/AdminOverviewPage'
import PlatformAnalyticsPage from './pages/admin/PlatformAnalyticsPage'
import ProductAnalyticsPage from './pages/admin/ProductAnalyticsPage'
import GrowthAnalyticsPage from './pages/admin/GrowthAnalyticsPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import WorkspaceManagementPage from './pages/admin/WorkspaceManagementPage'
import KYCManagementPage from './pages/admin/KYCManagementPage'
import AdminBillingPage from './pages/admin/AdminBillingPage'
import ContactCenterPage from './pages/admin/ContactCenterPage'
import CommunicationCenterPage from './pages/admin/CommunicationCenterPage'
import ContentManagementPage from './pages/admin/ContentManagementPage'
import StudioAnalyticsPage from './pages/admin/StudioAnalyticsPage'
import StudioContentPage from './pages/admin/StudioContentPage'
// import StudioAIMonitoringPage from './pages/admin/StudioAIMonitoringPage'
// import StudioActivityPage from './pages/admin/StudioActivityPage'
// import StudioModerationPage from './pages/admin/StudioModerationPage'
// import SecurityAuditPage from './pages/admin/SecurityAuditPage'
// import AdminSettingsPage from './pages/admin/AdminSettingsPage'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Homepage />} />
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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* 403 Forbidden */}
        <Route path="/forbidden" element={<ForbiddenPage />} />

        {/* Protected App */}
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
          <Route path="studio/experiment-engine" element={<ExperimentEnginePage />} />
          <Route path="studio/growth-engine" element={<GrowthEnginePage />} />
          <Route path="studio/roadmap-generator" element={<RoadmapGeneratorPage />} />
          <Route path="studio/user-stories" element={<UserStoryGeneratorPage />} />
          <Route path="studio/prd-generator" element={<PRDGeneratorPage />} />
          <Route path="studio/artifacts" element={<StudioArtifactsPage />} />
        </Route>

        {/* Admin Routes */}
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
