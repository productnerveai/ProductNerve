import { useState, useEffect, useMemo } from "react";
import { Bell, BarChart3, Plus, RotateCcw, Send, Trash2, Users, Archive } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  channel: string;
  priority: string;
  sent_status: string;
  user_id: string | null;
  action_url: string | null;
  link: string | null;
  created_at: string;
};

type BroadcastRow = {
  id: string;
  title: string;
  message: string;
  channel: string;
  target_group: string;
  sent_count: number | null;
  created_at: string;
};

type AdminBroadcastForm = {
  title: string;
  message: string;
  channel: string;
  audience: string;
  timeFilter: string;
};

const initialForm: AdminBroadcastForm = {
  title: "",
  message: "",
  channel: "in_app",
  audience: "all_users",
  timeFilter: "all",
};

// Generate dummy communication data
const generateDummyBroadcasts = () => [
  {
    id: "broadcast1",
    title: "System Maintenance Notice",
    message: "We will be performing scheduled maintenance on our servers tonight from 2-4 AM EST.",
    channel: "in_app",
    target_group: "all_users",
    sent_count: 1247,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "broadcast2",
    title: "New Feature Release",
    message: "Excited to announce our new AI-powered roadmap generator is now live!",
    channel: "email",
    target_group: "pro_users",
    sent_count: 342,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "broadcast3",
    title: "Beta Program Invitation",
    message: "Join our exclusive beta program and get early access to new features.",
    channel: "in_app",
    target_group: "active_users",
    sent_count: 892,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const generateDummyNotifications = () => [
  {
    id: "notif1",
    title: "Project Completed",
    message: "Your AI Project Manager project has been successfully completed.",
    channel: "in_app",
    priority: "high",
    sent_status: "sent",
    user_id: "user1",
    action_url: "/projects/proj1",
    link: "/projects/proj1",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif2",
    title: "Subscription Renewal",
    message: "Your Pro subscription will renew in 7 days.",
    channel: "email",
    priority: "medium",
    sent_status: "pending",
    user_id: "user2",
    action_url: "/billing",
    link: "/billing",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif3",
    title: "New Feature Available",
    message: "Check out our new user story generator tool.",
    channel: "in_app",
    priority: "low",
    sent_status: "failed",
    user_id: "user3",
    action_url: "/studio/user-stories",
    link: "/studio/user-stories",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const generateDummyFeedback = () => [
  {
    id: "feedback1",
    user_email: "user@example.com",
    rating: 5,
    comment: "Great platform! Very intuitive.",
    feature: "ICP Builder",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "feedback2",
    user_email: "test@example.com",
    rating: 4,
    comment: "Roadmap generator is amazing.",
    feature: "Roadmap Generator",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CommunicationCenterPage() {
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState<AdminBroadcastForm>(initialForm);
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => {
      setBroadcasts(generateDummyBroadcasts());
      setNotifications(generateDummyNotifications());
      setFeedbackList(generateDummyFeedback());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Generate dummy delivery stats
  const deliveryStats = useMemo(() => ({
    total: 2487,
    email_sent: 1834,
    email_failed: 23,
    in_app: 567,
    push: 63,
  }), []);

  const sendBroadcast = async () => {
    setIsLoading(true);
    setTimeout(() => {
      const newBroadcast = {
        id: `broadcast_${Date.now()}`,
        title: form.title,
        message: form.message,
        channel: form.channel,
        target_group: form.audience,
        sent_count: Math.floor(Math.random() * 1500) + 500,
        created_at: new Date().toISOString(),
      };
      
      setBroadcasts(prev => [newBroadcast, ...prev]);
      
      // Add notifications for the broadcast
      const newNotifications = Array.from({ length: 10 }, (_, i) => ({
        id: `notif_${Date.now()}_${i}`,
        title: form.title,
        message: form.message,
        channel: form.channel,
        priority: "medium",
        sent_status: "sent",
        user_id: `user${i + 1}`,
        action_url: null,
        link: null,
        created_at: new Date().toISOString(),
      }));
      
      setNotifications(prev => [...newNotifications, ...prev]);
      
      toast.success(`Broadcast queued for ${newBroadcast.sent_count} users`);
      setDialog(false);
      setForm(initialForm);
      setIsLoading(false);
    }, 1500);
  };

  const resendNotification = async (notification: NotificationRow) => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => 
        n.id === notification.id 
          ? { ...n, sent_status: "sent" as const }
          : n
      ));
      toast.success("Notification resent");
      setIsLoading(false);
    }, 1000);
  };

  const archiveNotification = async (notificationId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, sent_status: "archived" as const }
          : n
      ));
      toast.success("Notification archived");
      setIsLoading(false);
    }, 1000);
  };

  const deleteNotification = async (notificationId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success("Notification deleted");
      setIsLoading(false);
    }, 1000);
  };

  const sent = useMemo(
    () => notifications.filter((notification) => notification.sent_status !== "archived").length,
    [notifications]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication Center</h1>
          <p className="text-sm text-muted-foreground">Send notifications and manage previous sends from one place.</p>
        </div>
        <Button size="sm" onClick={() => setDialog(true)}>
          <Plus className="mr-1 h-4 w-4" /> New Broadcast
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="pt-4 text-center"><Bell className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-2xl font-bold">{sent}</p><p className="text-xs text-muted-foreground">Active Notifications</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Send className="mx-auto mb-1 h-5 w-5 text-primary" /><p className="text-2xl font-bold">{deliveryStats?.email_sent || 0}</p><p className="text-xs text-muted-foreground">Emails Delivered</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><BarChart3 className="mx-auto mb-1 h-5 w-5 text-accent" /><p className="text-2xl font-bold">{deliveryStats?.in_app || 0}</p><p className="text-xs text-muted-foreground">In-App Delivered</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Users className="mx-auto mb-1 h-5 w-5 text-muted-foreground" /><p className="text-2xl font-bold">{broadcasts.length}</p><p className="text-xs text-muted-foreground">Broadcasts</p></CardContent></Card>
      </div>

      <Tabs defaultValue="broadcasts">
        <TabsList>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="feedback">Beta Feedback ({feedbackList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Sent To</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((broadcast) => (
                  <TableRow key={broadcast.id}>
                    <TableCell className="font-medium">{broadcast.title}</TableCell>
                    <TableCell className="capitalize">{broadcast.channel}</TableCell>
                    <TableCell className="capitalize">{(broadcast.target_group || "").replace(/_/g, " ")}</TableCell>
                    <TableCell><Badge variant="outline">{broadcast.sent_count || 0} users</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(broadcast.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {broadcasts.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No broadcasts yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const isArchived = notification.sent_status === "archived";
                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="font-medium">{notification.title}</div>
                        <div className="max-w-[320px] truncate text-xs text-muted-foreground">{notification.message}</div>
                      </TableCell>
                      <TableCell className="capitalize">{notification.channel}</TableCell>
                      <TableCell>
                        <Badge variant={notification.priority === "high" ? "destructive" : notification.priority === "medium" ? "secondary" : "outline"} className="capitalize">
                          {notification.priority || "low"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isArchived ? "secondary" : notification.sent_status === "sent" ? "default" : "outline"}>
                          {notification.sent_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(notification.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading || !notification.user_id}
                            onClick={() => resendNotification(notification)}
                          >
                            <RotateCcw className="mr-1 h-4 w-4" /> Resend
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLoading || isArchived}
                            onClick={() => archiveNotification(notification.id)}
                          >
                            <Archive className="mr-1 h-4 w-4" /> Archive
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            disabled={isLoading}
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {notifications.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No notifications yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.map((fb: any) => (
                  <TableRow key={fb.id}>
                    <TableCell><Badge variant="outline" className="capitalize">{fb.feedback_type}</Badge></TableCell>
                    <TableCell className="font-medium">{fb.title}</TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{fb.description || "—"}</TableCell>
                    <TableCell><Badge variant={fb.status === "reviewed" ? "default" : "secondary"}>{fb.status}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(fb.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {feedbackList.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No feedback yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Send Broadcast</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="Broadcast title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea placeholder="Message body..." value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Channel</Label>
                <Select value={form.channel} onValueChange={(value) => setForm((current) => ({ ...current, channel: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">In-App</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select value={form.audience} onValueChange={(value) => setForm((current) => ({ ...current, audience: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="free_users">Free Users</SelectItem>
                    <SelectItem value="paid_users">Paid Users</SelectItem>
                    <SelectItem value="inactive_users">Inactive Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Time Filter (Signup Date)</Label>
              <Select value={form.timeFilter || "all"} onValueChange={(value) => setForm((current) => ({ ...current, timeFilter: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="3d">Last 3 Days</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="14d">Last 14 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={() => sendBroadcast()}
              disabled={isLoading || !form.title || !form.message}
            >
              Send Broadcast
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}