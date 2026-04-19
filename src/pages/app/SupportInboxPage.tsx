import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Send, MessageSquare, Bug, Lightbulb } from "lucide-react";

// Dummy user and support data
const dummyUser = {
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com"
};

const dummyFeedback = [
  {
    id: "ticket1",
    title: "Login issues on mobile",
    description: "Having trouble logging in using the mobile app. The login button doesn't respond on iOS Safari.",
    feedback_type: "bug",
    status: "open",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: dummyUser.id
  },
  {
    id: "ticket2",
    title: "Feature request: Dark mode",
    description: "Would love to see a dark mode option for the dashboard. It would be easier on the eyes during late night work sessions.",
    feedback_type: "feature",
    status: "in_progress",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: dummyUser.id
  },
  {
    id: "ticket3",
    title: "Great product!",
    description: "Just wanted to say that this platform has been incredibly helpful for our startup. The validation reports are top-notch.",
    feedback_type: "feedback",
    status: "resolved",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    user_id: dummyUser.id
  }
];

export default function SupportInboxPage() {
  const [tab, setTab] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "support" });
  const [profileData, setProfileData] = useState<any>(null);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load profile data and feedback
  useEffect(() => {
    setTimeout(() => {
      setProfileData(dummyUser);
      setFeedback(dummyFeedback);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      // Simulate ticket submission
      setTimeout(() => {
        const newTicket = {
          id: `ticket${Date.now()}`,
          title: form.title,
          description: form.message,
          feedback_type: form.type,
          status: "open",
          created_at: new Date().toISOString(),
          user_id: dummyUser.id
        };
        
        setFeedback(prev => [newTicket, ...prev]);
        toast.success("Ticket submitted successfully");
        setForm({ title: "", message: "", type: "support" });
        setTab("tickets");
        setSubmitting(false);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit ticket");
      setSubmitting(false);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "bug": return <Bug className="h-4 w-4 text-destructive" />;
      case "feature": return <Lightbulb className="h-4 w-4 text-accent" />;
      default: return <MessageSquare className="h-4 w-4 text-primary" />;
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-accent/15 text-accent border-accent/30";
      case "resolved": return "bg-primary/15 text-primary border-primary/30";
      case "in_progress": return "bg-yellow-500/15 text-yellow-600 border-yellow-500/30";
      default: return "";
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground">Create tickets and track your submissions</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="create">New Ticket</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets ({feedback?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader><CardTitle>Submit a Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="support">Support Request</SelectItem>
                    <SelectItem value="bug">Bug Report</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="feedback">General Feedback</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input
                  placeholder="Brief summary..."
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Textarea
                  placeholder="Describe in detail..."
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
                <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <Card>
            <CardHeader><CardTitle>Your Tickets</CardTitle></CardHeader>
            <CardContent>
              {!feedback?.length ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No tickets submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {feedback.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-3 p-4 rounded-lg border">
                      {typeIcon(item.feedback_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <Badge className={`text-[10px] ${statusColor(item.status)}`}>{item.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(item.created_at).toLocaleDateString()} • {item.feedback_type}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
