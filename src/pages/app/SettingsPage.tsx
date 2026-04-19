import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { User, Building2, Trash2, Plus, ShieldCheck, Upload, Bell } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// ─── Dummy data ────────────────────────────────────────────────────────────────

const DUMMY_USER = {
  email: "jane.doe@company.com",
};

const DUMMY_PROFILE = {
  firstName: "Jane",
  lastName: "Doe",
  companyName: "Acme Inc.",
};

const DUMMY_WORKSPACES = [
  { id: "ws-1", name: "Marketing Hub", description: "", created_at: "2025-01-05T00:00:00Z" },
  { id: "ws-2", name: "Product Team", description: "For design & eng collaboration", created_at: "2025-03-12T00:00:00Z" },
];

// ──────────────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState(DUMMY_PROFILE.firstName);
  const [lastName, setLastName] = useState(DUMMY_PROFILE.lastName);
  const [companyName, setCompanyName] = useState(DUMMY_PROFILE.companyName);

  // Notification fields
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyBilling, setNotifyBilling] = useState(true);

  // Password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Workspaces
  const [workspaces, setWorkspaces] = useState(DUMMY_WORKSPACES);
  const [showCreate, setShowCreate] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");

  // KYC
  const [kycStatus, setKycStatus] = useState<string>("not_submitted");
  const [kycForm, setKycForm] = useState({
    official_company_name: "",
    registration_number: "",
    website: "",
    custom_email: "",
    phone: "",
  });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycSubmitting, setKycSubmitting] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setLoading(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    toast.success("Profile updated!");
  };

  const handleToggleNotification = (
    field: "notify_email" | "notify_push" | "notify_updates" | "notify_billing",
    value: boolean
  ) => {
    if (field === "notify_email") setNotifyEmail(value);
    if (field === "notify_push") setNotifyPush(value);
    if (field === "notify_updates") setNotifyUpdates(value);
    if (field === "notify_billing") setNotifyBilling(value);
    // TODO: replace with real API call
    toast.success("Notification settings updated");
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    // TODO: replace with real API call
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    toast.success("Password updated!");
    setNewPassword("");
    setConfirmPassword("");
  };

  const createWorkspace = async () => {
    if (!wsName.trim()) return;
    // TODO: replace with real API call
    const newWs = {
      id: `ws-${Date.now()}`,
      name: wsName.trim(),
      description: wsDesc.trim(),
      created_at: new Date().toISOString(),
    };
    setWorkspaces((prev) => [...prev, newWs]);
    setShowCreate(false);
    setWsName("");
    setWsDesc("");
    toast.success("Workspace created!");
  };

  const deleteWorkspace = async (wsId: string) => {
    // TODO: replace with real API call
    setWorkspaces((prev) => prev.filter((w) => w.id !== wsId));
    toast.success("Workspace deleted");
  };

  const handleKYCSubmit = async () => {
    setKycSubmitting(true);
    // TODO: replace with real API call (file upload + record insert)
    await new Promise((r) => setTimeout(r, 600));
    toast.success("KYC submitted for review!");
    setKycStatus("pending");
    setKycSubmitting(false);
  };

  // ─── KYC badge ──────────────────────────────────────────────────────────────

  const kycStatusBadge = () => {
    const variants: Record<string, any> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    const labels: Record<string, string> = {
      pending: "Pending Review",
      approved: "Verified",
      rejected: "Rejected",
      not_submitted: "Not Submitted",
    };
    return (
      <Badge variant={variants[kycStatus] || "outline"}>
        {labels[kycStatus] || kycStatus}
      </Badge>
    );
  };


  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your profile, workspaces, and verification
      </p>

      <Tabs defaultValue={initialTab} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-2">
            <Building2 className="h-3.5 w-3.5" /> Workspaces
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2">
            <ShieldCheck className="h-3.5 w-3.5" /> KYC Verification
          </TabsTrigger>
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile">
          <div className="glass-card rounded-xl p-6 max-w-lg space-y-4">
            <h3 className="font-semibold">Profile</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={50} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={50} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input value={DUMMY_USER.email} disabled />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Company Name</label>
              <Input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Your company"
                maxLength={100}
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>

            <div className="border-t border-border pt-4 mt-4 space-y-4">
              <h3 className="font-semibold">Change Password</h3>
              <div>
                <label className="text-sm font-medium mb-1.5 block">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button onClick={handleChangePassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ── Workspaces ── */}
        <TabsContent value="workspaces">
          <div className="max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Your Workspaces</h3>
              <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" /> New Workspace
              </Button>
            </div>

            {workspaces.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No workspaces yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws.id}
                    className="glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{ws.name}</h4>
                      {ws.description && (
                        <p className="text-xs text-muted-foreground">{ws.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ws.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteWorkspace(ws.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <Input
                  placeholder="Workspace name"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  maxLength={100}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={wsDesc}
                  onChange={(e) => setWsDesc(e.target.value)}
                  maxLength={500}
                />
                <Button onClick={createWorkspace} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ── Notifications ── */}
        <TabsContent value="notifications">
          <div className="glass-card rounded-xl p-6 max-w-lg space-y-6">
            <div>
              <h3 className="font-semibold mb-1">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Manage how and when you receive notifications.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  field: "notify_email" as const,
                  label: "Email Notifications",
                  desc: "Receive project updates and alerts via email.",
                  value: notifyEmail,
                },
                {
                  field: "notify_push" as const,
                  label: "Push Notifications",
                  desc: "Receive notifications directly in your browser.",
                  value: notifyPush,
                },
                {
                  field: "notify_updates" as const,
                  label: "Product Updates",
                  desc: "Get notified about new features and improvements.",
                  value: notifyUpdates,
                },
                {
                  field: "notify_billing" as const,
                  label: "Billing Alerts",
                  desc: "Receive alerts about your subscription and payments.",
                  value: notifyBilling,
                },
              ].map(({ field, label, desc, value }) => (
                <div key={field} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-medium">{label}</Label>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(val) => handleToggleNotification(field, val)}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* ── KYC ── */}
        <TabsContent value="kyc">
          <div className="glass-card rounded-xl p-6 max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">KYC Verification</h3>
              {kycStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Submit your company verification documents for review.
            </p>

            {kycStatus === "approved" ? (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
                ✓ Your company has been verified.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Official Company Name</Label>
                  <Input
                    value={kycForm.official_company_name}
                    onChange={(e) => setKycForm((f) => ({ ...f, official_company_name: e.target.value }))}
                    placeholder="Registered company name"
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={kycForm.registration_number}
                    onChange={(e) => setKycForm((f) => ({ ...f, registration_number: e.target.value }))}
                    placeholder="Company registration number"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={kycForm.website}
                    onChange={(e) => setKycForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Business Email</Label>
                  <Input
                    value={kycForm.custom_email}
                    onChange={(e) => setKycForm((f) => ({ ...f, custom_email: e.target.value }))}
                    placeholder="business@company.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={kycForm.phone}
                    onChange={(e) => setKycForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label>Company Registration Document</Label>
                  <div className="mt-1.5">
                    <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {kycFile?.name || "Upload PDF, JPG, or PNG (max 10MB)"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="hidden"
                        onChange={(e) => setKycFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
                <Button
                  onClick={handleKYCSubmit}
                  disabled={kycSubmitting || kycStatus === "pending"}
                  className="w-full"
                >
                  {kycSubmitting
                    ? "Submitting..."
                    : kycStatus === "pending"
                    ? "Pending Review"
                    : "Submit for Verification"}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
