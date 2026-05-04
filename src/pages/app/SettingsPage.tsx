import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { User, Building2, Trash2, Plus, ShieldCheck, Upload, Bell, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function SettingsPage() {
  const { user } = useAuth();
  const { workspaces, loading: workspacesLoading, setWorkspaces, setActiveWorkspace, refreshWorkspaces } = useWorkspace();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);

  // Profile fields - initialize with real user data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  // Initialize profile fields when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setCompanyName(user.company_name || "");
    }
  }, [user]);

  // Notification fields
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(true);
  const [notifyBilling, setNotifyBilling] = useState(true);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Workspaces
  const [showCreate, setShowCreate] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");

  // Load workspaces on component mount
  useEffect(() => {
    refreshWorkspaces();
  }, []);

  // Profile Completion
  const [profileStatus, setProfileStatus] = useState<string>("not_submitted");
  const [profileForm, setProfileForm] = useState({
    official_company_name: user?.company_name || "",
    registration_number: "",
    website: "",
    custom_email: "",
    phone: "",
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profileDocumentUrl, setProfileDocumentUrl] = useState<string | null>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Load profile completion status on component mount
  useEffect(() => {
    if (user) {
      loadProfileCompletionStatus();
    }
  }, [user]);

  const loadProfileCompletionStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/profile-completion`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfileStatus(data.data.profile_completion_status);
        setProfileForm({
          official_company_name: data.data.official_company_name || "",
          registration_number: data.data.registration_number || "",
          website: data.data.website || "",
          custom_email: data.data.custom_email || "",
          phone: data.data.phone || "",
        });
        setProfileDocumentUrl(data.data.profile_document_url || null);
      }
    } catch (error) {
      console.error('Failed to load profile completion status:', error);
    }
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          company_name: companyName
        })
      });

      if (response.ok) {
        toast.success("Profile updated!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Network error during profile update");
    } finally {
      setLoading(false);
    }
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
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error("New password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update password");
      }
    } catch (error) {
      toast.error("Network error during password update");
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!wsName.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: wsName.trim(),
          description: wsDesc.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setWorkspaces([data.data, ...workspaces]);
        setActiveWorkspace(data.data);
        setShowCreate(false);
        setWsName("");
        setWsDesc("");
        toast.success("Workspace created!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create workspace");
      }
    } catch (error) {
      toast.error("Network error while creating workspace");
    }
  };

  const deleteWorkspace = async (wsId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/workspaces/${wsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedWorkspaces = workspaces.filter((w) => w._id !== wsId && w.id !== wsId);
        setWorkspaces(updatedWorkspaces);
        
        // Set first remaining workspace as active, or null if no workspaces left
        if (updatedWorkspaces.length > 0) {
          setActiveWorkspace(updatedWorkspaces[0]);
        } else {
          setActiveWorkspace(null);
        }
        
        toast.success("Workspace deleted");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete workspace");
      }
    } catch (error) {
      toast.error("Network error while deleting workspace");
    }
  };

  const handleProfileSubmit = async () => {
    setProfileSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare submission data with proper typing
      const submissionData: any = {
        official_company_name: profileForm.official_company_name,
        registration_number: profileForm.registration_number,
        website: profileForm.website,
        custom_email: profileForm.custom_email,
        phone: profileForm.phone
      };

      // Handle file upload as base64 if file exists
      if (profileFile) {
        const reader = new FileReader();
        
        const fileData = await new Promise<any>((resolve, reject) => {
          reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
              resolve({
                name: profileFile.name,
                type: profileFile.type,
                data: result.split(',')[1] // Get base64 data without prefix
              });
            } else {
              reject(new Error('Failed to read file as string'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(profileFile);
        });

        submissionData.document = fileData;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile-completion`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Profile completion submitted for review!");
        setProfileStatus(data.data.profile_completion_status);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit profile completion");
      }
    } catch (error) {
      toast.error("Network error during profile submission");
    } finally {
      setProfileSubmitting(false);
    }
  };

  // ─── Profile Completion badge ──────────────────────────────────────────────────────────────

  const profileStatusBadge = () => {
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
      <Badge variant={variants[profileStatus] || "outline"}>
        {labels[profileStatus] || profileStatus}
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
            <ShieldCheck className="h-3.5 w-3.5" /> Profile Completion
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
              <Input value={user?.email || ""} disabled />
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
                <label className="text-sm font-medium mb-1.5 block">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
              </div>
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

            {workspacesLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p>Loading workspaces...</p>
              </div>
            ) : workspaces.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No workspaces yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workspaces.map((ws) => (
                  <div
                    key={ws._id || ws.id}
                    className="glass-card rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{ws.name}</h4>
                      {ws.description && (
                        <p className="text-xs text-muted-foreground">{ws.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(ws.createdAt || ws.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteWorkspace(ws._id || ws.id)}
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

        {/* ── Complete Profile ── */}
        <TabsContent value="kyc">
          <div className="glass-card rounded-xl p-6 max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Complete Profile</h3>
              {profileStatusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Submit your company verification documents for review.
            </p>

            {profileStatus === "approved" ? (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
                ✓ Your company has been verified.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Label>Official Company Name</Label>
                  <Input
                    value={profileForm.official_company_name}
                    onChange={(e) => setProfileForm((f) => ({ ...f, official_company_name: e.target.value }))}
                    placeholder="Registered company name"
                  />
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    value={profileForm.registration_number}
                    onChange={(e) => setProfileForm((f) => ({ ...f, registration_number: e.target.value }))}
                    placeholder="Company registration number"
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    value={profileForm.website}
                    onChange={(e) => setProfileForm((f) => ({ ...f, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <Label>Business Email</Label>
                  <Input
                    value={profileForm.custom_email}
                    onChange={(e) => setProfileForm((f) => ({ ...f, custom_email: e.target.value }))}
                    placeholder="business@company.com"
                    type="email"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <Label>Company Registration Document</Label>
                  <div className="mt-1.5">
                    {profileDocumentUrl ? (
                      <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-green-50">
                        <FileText className="h-4 w-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Document Uploaded</p>
                          <a 
                            href={profileDocumentUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-green-600 hover:underline"
                          >
                            View Document
                          </a>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                        <Upload className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {profileFile?.name || "Upload PDF, JPG, or PNG (max 10MB)"}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => setProfileFile(e.target.files?.[0] || null)}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleProfileSubmit}
                  disabled={profileSubmitting || profileStatus === "pending"}
                  className="w-full"
                >
                  {profileSubmitting
                    ? "Submitting..."
                    : profileStatus === "pending"
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
