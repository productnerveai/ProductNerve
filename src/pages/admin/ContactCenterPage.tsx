import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, Send, Plus, MessageSquare, Bug, Lightbulb } from "lucide-react";

// Generate dummy contact center data
const generateDummyTickets = () => [
  {
    id: "ticket1",
    name: "John Doe",
    email: "john@example.com",
    subject: "Login Issue",
    message: "I'm having trouble logging into my account. The password reset link isn't working.",
    inquiry_type: "technical",
    priority: "high",
    status: "open",
    created_by_admin: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: null,
    admin_response: null,
  },
  {
    id: "ticket2",
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Feature Request",
    message: "Would it be possible to add a dark mode to the interface?",
    inquiry_type: "feature",
    priority: "medium",
    status: "in_progress",
    created_by_admin: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    admin_response: "We're considering this for a future release.",
  },
  {
    id: "ticket3",
    name: "Bob Wilson",
    email: "bob@example.com",
    subject: "Billing Question",
    message: "How do I upgrade to the Pro plan?",
    inquiry_type: "billing",
    priority: "low",
    status: "closed",
    created_by_admin: false,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    responded_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    admin_response: "You can upgrade from the billing page.",
  },
];

const generateDummyReplies = () => [
  {
    id: "reply1",
    ticket_id: "ticket1",
    admin_id: "admin",
    message: "I'm looking into your login issue. Can you try clearing your browser cache?",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "reply2",
    ticket_id: "ticket2",
    admin_id: "admin",
    message: "Thanks for the suggestion! We'll consider it for a future update.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const generateDummyFeedback = () => [
  {
    id: "feedback1",
    user_email: "user@example.com",
    rating: 5,
    comment: "Great platform! Very intuitive and helpful.",
    feature: "ICP Builder",
    feedback_type: "general",
    title: "Great Experience",
    description: "Great platform! Very intuitive and helpful.",
    status: "open",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feedback2",
    user_email: "test@example.com",
    rating: 4,
    comment: "The roadmap generator is amazing but could use more templates.",
    feature: "Roadmap Generator",
    feedback_type: "feature",
    title: "Feature Request",
    description: "The roadmap generator is amazing but could use more templates.",
    status: "in_progress",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feedback3",
    user_email: "feedback@example.com",
    rating: 3,
    comment: "User story generator needs improvement in formatting.",
    feature: "User Story Generator",
    feedback_type: "bug",
    title: "Formatting Issue",
    description: "User story generator needs improvement in formatting.",
    status: "resolved",
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function ContactCenterPage() {
  const [selected, setSelected] = useState<any>(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [activeSection, setActiveSection] = useState<"tickets" | "feedback">("tickets");
  const [ticketForm, setTicketForm] = useState({
    name: "", email: "", subject: "", message: "", inquiry_type: "general", priority: "medium",
  });
  const [tickets, setTickets] = useState(generateDummyTickets());
  const [replies, setReplies] = useState(generateDummyReplies());
  const [feedbackItems, setFeedbackItems] = useState(generateDummyFeedback());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const createTicket = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const newTicket = {
        id: `ticket_${Date.now()}`,
        name: ticketForm.name || "Admin Created",
        email: ticketForm.email,
        subject: ticketForm.subject,
        message: ticketForm.message,
        inquiry_type: ticketForm.inquiry_type,
        priority: ticketForm.priority,
        status: "open",
        created_by_admin: true,
        created_at: new Date().toISOString(),
        responded_at: null,
        admin_response: null,
      };
      
      setTickets(prev => [newTicket, ...prev]);
      toast.success("Ticket created");
      setShowCreate(false);
      setTicketForm({ name: "", email: "", subject: "", message: "", inquiry_type: "general", priority: "medium" });
      setIsLoading(false);
    }, 1000);
  };

  const updateTicket = async ({ id, updates }: { id: string; updates: any }) => {
    setIsLoading(true);
    setTimeout(() => {
      setTickets(prev => prev.map(ticket => ticket.id === id ? { ...ticket, ...updates } : ticket));
      toast.success("Ticket updated");
      setIsLoading(false);
    }, 1000);
  };

  const sendReply = async ({ ticketId, message }: { ticketId: string; message: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      const newReply = {
        id: `reply_${Date.now()}`,
        ticket_id: ticketId,
        admin_id: "admin",
        message,
        created_at: new Date().toISOString(),
      };
      
      setReplies(prev => [newReply, ...prev]);
      
      // Update ticket with admin response and status
      setTickets(prev => prev.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            admin_response: message,
            responded_at: new Date().toISOString(),
            status: "in_progress",
          };
        }
        return ticket;
      }));
      
      toast.success("Reply sent");
      setResponse("");
      setIsLoading(false);
    }, 1000);
  };

  const ticket = tickets?.find(t => t.id === selected?.id);

  const total = tickets?.length || 0;
  const open = tickets?.filter(t => t.status === "open").length || 0;
  const inProgress = tickets?.filter(t => t.status === "in_progress").length || 0;
  const resolved = tickets?.filter(t => t.status === "resolved").length || 0;
  const filtered = filter === "all" ? tickets : tickets?.filter(t => t.status === filter);
  const getTicketReplies = (ticketId: string) => replies?.filter(r => r.ticket_id === ticketId) || [];

  const statusColor = (status: string) => {
    if (status === "resolved") return "default" as const;
    if (status === "in_progress") return "secondary" as const;
    return "outline" as const;
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "destructive" as const;
    if (p === "medium") return "secondary" as const;
    return "outline" as const;
  };

  const feedbackTypeIcon = (type: string) => {
    if (type === "bug") return <Bug className="h-4 w-4 text-destructive" />;
    if (type === "feature") return <Lightbulb className="h-4 w-4 text-accent" />;
    return <MessageSquare className="h-4 w-4 text-primary" />;
  };

  const updateFeedbackStatus = async ({ id, status }: { id: string; status: string }) => {
    setIsLoading(true);
    setTimeout(() => {
      setFeedbackItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
      toast.success("Feedback status updated");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contact Center</h1>
          <p className="text-muted-foreground text-sm">Support tickets & user feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant={activeSection === "tickets" ? "default" : "outline"} size="sm" onClick={() => setActiveSection("tickets")}>
            <Send className="h-4 w-4 mr-1" /> Tickets ({total})
          </Button>
          <Button variant={activeSection === "feedback" ? "default" : "outline"} size="sm" onClick={() => setActiveSection("feedback")}>
            <MessageSquare className="h-4 w-4 mr-1" /> Feedback ({feedbackItems?.length || 0})
          </Button>
        </div>
      </div>

      {activeSection === "tickets" && (
      <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" /> Create Ticket
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-accent">{open}</p><p className="text-xs text-muted-foreground">Open</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{inProgress}</p><p className="text-xs text-muted-foreground">In Progress</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-green-600">{resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({total})</TabsTrigger>
          <TabsTrigger value="open">Open ({open})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgress})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolved})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead>
            <TableHead>Type</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead>
            <TableHead>Date</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {filtered?.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell className="text-sm">{t.email}</TableCell>
                <TableCell className="text-sm max-w-[150px] truncate">{(t as any).subject || "—"}</TableCell>
                <TableCell><Badge variant="outline">{t.inquiry_type || "general"}</Badge></TableCell>
                <TableCell><Badge variant={priorityColor((t as any).priority || "medium")}>{(t as any).priority || "medium"}</Badge></TableCell>
                <TableCell><Badge variant={statusColor(t.status)}>{t.status}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(t); setResponse(""); }}>
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!filtered || filtered.length === 0) && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No tickets</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>User Name (optional)</Label>
              <Input value={ticketForm.name} onChange={e => setTicketForm(f => ({ ...f, name: e.target.value }))} placeholder="User name" />
            </div>
            <div>
              <Label>User Email *</Label>
              <Input value={ticketForm.email} onChange={e => setTicketForm(f => ({ ...f, email: e.target.value }))} placeholder="user@example.com" type="email" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} placeholder="Ticket subject" />
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea value={ticketForm.message} onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))} rows={4} placeholder="Describe the issue..." />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Category</Label>
                <Select value={ticketForm.inquiry_type} onValueChange={v => setTicketForm(f => ({ ...f, inquiry_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={ticketForm.priority} onValueChange={v => setTicketForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => createTicket()} disabled={isLoading || !ticketForm.email || !ticketForm.message} className="w-full">
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Ticket Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
          <DialogHeader><DialogTitle>Ticket from {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Company:</span> {selected.company || "—"}</div>
                <div><span className="text-muted-foreground">Type:</span> {selected.inquiry_type || "general"}</div>
                <div><span className="text-muted-foreground">Priority:</span> <Badge variant={priorityColor((selected as any).priority || "medium")}>{(selected as any).priority || "medium"}</Badge></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant={statusColor(selected.status)}>{selected.status}</Badge></div>
                {(selected as any).subject && <div className="col-span-2"><span className="text-muted-foreground">Subject:</span> {(selected as any).subject}</div>}
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-sm">{selected.message}</div>

              {getTicketReplies(selected.id).length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Previous Replies</p>
                  {getTicketReplies(selected.id).map(r => (
                    <div key={r.id} className="p-2 rounded bg-primary/5 text-sm border-l-2 border-primary">
                      <p>{r.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t border-border pt-3 space-y-3">
                <Textarea placeholder="Type your reply..." value={response} onChange={e => setResponse(e.target.value)} rows={4} />
                <div className="flex gap-2">
                  <Select defaultValue={selected.status} onValueChange={v => updateTicket({ id: selected.id, updates: { status: v } })}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button disabled={!response || isLoading} onClick={() => sendReply({ ticketId: selected.id, message: response })}>
                    <Send className="h-4 w-4 mr-1" /> Reply & Email
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </>
      )}

      {activeSection === "feedback" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{feedbackItems?.length || 0}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-accent">{feedbackItems?.filter(f => f.status === "open").length || 0}</p><p className="text-xs text-muted-foreground">Open</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{feedbackItems?.filter(f => f.feedback_type === "bug").length || 0}</p><p className="text-xs text-muted-foreground">Bugs</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-accent">{feedbackItems?.filter(f => f.feedback_type === "feature").length || 0}</p><p className="text-xs text-muted-foreground">Features</p></CardContent></Card>
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Type</TableHead><TableHead>Title</TableHead><TableHead>Description</TableHead>
                <TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {feedbackItems?.map(f => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {feedbackTypeIcon(f.feedback_type)}
                        <span className="text-sm capitalize">{f.feedback_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{f.title}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{f.description}</TableCell>
                    <TableCell><Badge variant="outline">{f.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select defaultValue={f.status} onValueChange={v => updateFeedbackStatus({ id: f.id, status: v })}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {(!feedbackItems || feedbackItems.length === 0) && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No feedback submissions</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
