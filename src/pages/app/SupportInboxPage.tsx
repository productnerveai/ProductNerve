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
import { format, formatDistanceToNow } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function SupportInboxPage() {
  const [tab, setTab] = useState("create");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "support" });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load tickets
  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.data || []);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load tickets");
      }
    } catch (error) {
      toast.error("Network error while loading tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: form.title,
          description: form.message,
          feedback_type: form.type
        })
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(prev => [data.data, ...prev]);
        toast.success("Ticket submitted successfully");
        setForm({ title: "", message: "", type: "support" });
        setTab("tickets");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit ticket");
      }
    } catch (error) {
      toast.error("Network error while submitting ticket");
    } finally {
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
          <TabsTrigger value="tickets">My Tickets ({tickets?.length || 0})</TabsTrigger>
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
              {!tickets?.length ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No tickets submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket: any) => (
                    <div key={ticket._id} className="flex items-start gap-3 p-4 rounded-lg border">
                      {typeIcon(ticket.feedback_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium truncate">{ticket.title}</p>
                          <Badge className={`text-[10px] ${statusColor(ticket.status)}`}>{ticket.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
                        {ticket.admin_response && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                            <p className="font-medium text-primary">Admin Response:</p>
                            <p className="text-muted-foreground">{ticket.admin_response}</p>
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {format(ticket.createdAt, 'MMM d, yyyy')} • {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })} • {ticket.feedback_type}
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
