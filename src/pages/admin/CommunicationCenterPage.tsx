import { useState, useEffect, useMemo } from "react";
import { Bell, BarChart3, Plus, RotateCcw, Send, Trash2, Users, Archive, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
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
import AdminApiService from "@/services/adminApi";

type NotificationRow = {
  _id: string;
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  archived: boolean;
  user_id: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  metadata: any;
  created_at: string;
};

type BroadcastRow = {
  id: string;
  title: string;
  message: string;
  channel: 'email' | 'in_app' | 'sms';
  target_group: 'all_users' | 'active_users' | 'pro_users' | 'free_users' | 'beta_users';
  sent_count: number | null;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
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

export default function CommunicationCenterPage() {
  const [dialog, setDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<NotificationRow | null>(null);
  const [form, setForm] = useState<AdminBroadcastForm>(initialForm);
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<NotificationRow[]>([]);
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [notificationsPagination, setNotificationsPagination] = useState<any>(null);
  const [archivedPagination, setArchivedPagination] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const notificationsPerPage = 10;

  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = async (page = 1) => {
    setIsLoading(true);
    try {
      const [broadcastsResponse, notificationsResponse, archivedResponse] = await Promise.all([
        AdminApiService.getAllBroadcasts(),
        AdminApiService.getAllNotifications({ page, limit: notificationsPerPage }),
        AdminApiService.getAllNotifications({ page: archivedPage, limit: notificationsPerPage, include_archived: true })
      ]);

      if (broadcastsResponse.success) {
        console.log('Broadcasts data received:', broadcastsResponse.data.broadcasts);
        setBroadcasts(broadcastsResponse.data.broadcasts);
      }

      if (notificationsResponse.success) {
        console.log('Notifications data received:', notificationsResponse.data.notifications);
        setNotifications(notificationsResponse.data.notifications);
        setNotificationsPagination(notificationsResponse.data.pagination);
      }

      if (archivedResponse.success) {
        setArchivedNotifications(archivedResponse.data.notifications.filter((n: NotificationRow) => n.archived));
        setArchivedPagination(archivedResponse.data.pagination);
      }

      if (!broadcastsResponse.success || !notificationsResponse.success) {
        toast.error("Failed to load communication data");
      }
    } catch (error) {
      toast.error("Error loading communication data");
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotificationsPage = (page: number) => {
    setNotificationPage(page);
    loadCommunicationData(page);
  };

  const loadArchivedPage = (page: number) => {
    setArchivedPage(page);
    loadCommunicationData(notificationPage);
  };

  // Calculate real delivery stats from actual data
  const deliveryStats = useMemo(() => {
    const totalBroadcasts = broadcasts.length;
    const totalNotifications = notificationsPagination?.total || notifications.length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const readNotifications = notifications.filter(n => n.read).length;
    
    // Count notification types
    const typeCounts = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalBroadcasts + totalNotifications,
      email_sent: totalNotifications, // All notifications are sent via email
      in_app: totalNotifications, // All notifications also appear in-app
      unread: unreadNotifications,
      read: readNotifications,
      type_counts: typeCounts,
      push: 0, // No push notifications yet
      total_sent: totalNotifications
    };
  }, [broadcasts, notifications, notificationsPagination]);

  const sendBroadcast = async () => {
    setIsLoading(true);
    try {
      const response = await AdminApiService.createBroadcast({
        title: form.title,
        message: form.message,
        channel: form.channel,
        target_group: form.audience
      });

      if (response.success) {
        setBroadcasts(prev => [response.data, ...prev]);
        toast.success(`Broadcast queued for ${response.data.sent_count || 0} users`);
        setDialog(false);
        setForm(initialForm);
      } else {
        toast.error(response.error || "Failed to create broadcast");
      }
    } catch (error) {
      toast.error("Error creating broadcast");
    } finally {
      setIsLoading(false);
    }
  };

  const resendNotification = async (notification: NotificationRow) => {
    setIsLoading(true);
    try {
      console.log('Resending notification:', notification);
      const notificationId = notification._id || notification.id;
      const response = await AdminApiService.resendNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.map(n =>
          (n._id === notificationId || n.id === notificationId)
            ? { ...response.data }
            : n
        ));
        toast.success("Notification resent");
      } else {
        toast.error(response.error || "Failed to resend notification");
      }
    } catch (error) {
      toast.error("Error resending notification");
    } finally {
      setIsLoading(false);
    }
  };

  const archiveNotification = async (notification: NotificationRow) => {
    setIsLoading(true);
    try {
      const notificationId = notification._id;
      const response = await AdminApiService.archiveNotification(notificationId);
      if (response.success) {
        // Remove from active notifications
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Add to archived notifications
        setArchivedNotifications(prev => [response.data, ...prev]);
        toast.success("Notification archived");
      } else {
        toast.error(response.error || "Failed to archive notification");
      }
    } catch (error) {
      toast.error("Error archiving notification");
    } finally {
      setIsLoading(false);
    }
  };

  const unarchiveNotification = async (notification: NotificationRow) => {
    setIsLoading(true);
    try {
      const notificationId = notification._id;
      const response = await AdminApiService.unarchiveNotification(notificationId);
      if (response.success) {
        // Remove from archived notifications
        setArchivedNotifications(prev => prev.filter(n => n._id !== notificationId));
        // Add to active notifications
        setNotifications(prev => [response.data, ...prev]);
        toast.success("Notification unarchived");
      } else {
        toast.error(response.error || "Failed to unarchive notification");
      }
    } catch (error) {
      toast.error("Error unarchiving notification");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotification = async (notification: NotificationRow) => {
    setNotificationToDelete(notification);
    setDeleteDialog(true);
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    
    setIsLoading(true);
    try {
      const notificationId = notificationToDelete._id;
      const response = await AdminApiService.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setArchivedNotifications(prev => prev.filter(n => n._id !== notificationId));
        toast.success("Notification deleted");
        setDeleteDialog(false);
        setNotificationToDelete(null);
      } else {
        toast.error(response.error || "Failed to delete notification");
      }
    } catch (error) {
      toast.error("Error deleting notification");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = useMemo(
    () => notifications.filter((notification) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const title = notification.title?.toLowerCase() || '';
      const message = notification.message?.toLowerCase() || '';
      const type = notification.type?.toLowerCase() || '';
      const userName = notification.user_id 
        ? `${notification.user_id.first_name} ${notification.user_id.last_name}`.toLowerCase()
        : '';
      const userEmail = notification.user_id 
        ? notification.user_id.email?.toLowerCase() || ''
        : '';
      
      return title.includes(searchLower) || 
             message.includes(searchLower) || 
             type.includes(searchLower) || 
             userName.includes(searchLower) || 
             userEmail.includes(searchLower);
    }),
    [notifications, searchTerm]
  );

  const sent = useMemo(
    () => notificationsPagination?.unread || filteredNotifications.filter((notification) => !notification.read).length,
    [filteredNotifications, notificationsPagination]
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
          <TabsTrigger value="archived">Archived ({archivedNotifications.length})</TabsTrigger>
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
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-lg border min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Read Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotifications.map((notification) => {
                  const isRead = notification.read;
                  return (
                    <TableRow key={notification.id}>
                      <TableCell className="max-w-sm">
                        <div className="font-medium text-sm mb-1">{notification.title}</div>
                        <div className="text-xs text-muted-foreground max-w-xs break-words">{notification.message}</div>
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">
                          {notification.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="text-sm font-medium mb-1">
                          {notification.user_id && typeof notification.user_id === 'object' ?
                            `${notification.user_id.first_name} ${notification.user_id.last_name}` :
                            "Unknown User"
                          }
                        </div>
                        <div className="text-xs text-muted-foreground break-all">
                          {notification.user_id && typeof notification.user_id === 'object' ? notification.user_id.email : "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isRead ? "secondary" : "default"}>
                          {isRead ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{format(new Date(notification.created_at), 'MMM d, yyyy')}</div>
                        <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</div>
                      </TableCell>
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
                            disabled={isLoading}
                            onClick={() => archiveNotification(notification)}
                          >
                            <Archive className="mr-1 h-4 w-4" /> Archive
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            disabled={isLoading}
                            onClick={() => deleteNotification(notification)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredNotifications.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    {searchTerm ? `No notifications found for "${searchTerm}"` : "No notifications yet"}
                  </TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className='mt-4'>
            {/* Pagination Controls */}
            {notificationsPagination && notificationsPagination.pages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Showing {((notificationPage - 1) * notificationsPerPage) + 1} to {Math.min(notificationPage * notificationsPerPage, filteredNotifications.length)} of {filteredNotifications.length} notifications
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadNotificationsPage(notificationPage - 1)}
                    disabled={notificationPage <= 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {notificationPage} of {notificationsPagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadNotificationsPage(notificationPage + 1)}
                    disabled={notificationPage >= notificationsPagination.pages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archived">
          <div className="overflow-x-auto rounded-lg border min-w-[1000px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {archivedNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="max-w-sm">
                      <div className="font-medium text-sm mb-1">{notification.title}</div>
                      <div className="text-xs text-muted-foreground max-w-xs break-words">{notification.message}</div>
                    </TableCell>
                    <TableCell className="capitalize">
                      <Badge variant="outline">
                        {notification.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="text-sm font-medium mb-1">
                        {notification.user_id && typeof notification.user_id === 'object' ?
                          `${notification.user_id.first_name} ${notification.user_id.last_name}` :
                          "Unknown User"
                        }
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {notification.user_id && typeof notification.user_id === 'object' ? notification.user_id.email : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div>{format(new Date(notification.created_at), 'MMM d, yyyy')}</div>
                      <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isLoading}
                          onClick={() => unarchiveNotification(notification)}
                        >
                          <Archive className="mr-1 h-4 w-4" /> Unarchive
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={isLoading}
                          onClick={() => deleteNotification(notification)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {archivedNotifications.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No archived notifications yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className='mt-4'>
            {/* Pagination Controls */}
            {archivedPagination && archivedPagination.pages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-muted-foreground">
                  Showing {((archivedPage - 1) * notificationsPerPage) + 1} to {Math.min(archivedPage * notificationsPerPage, archivedNotifications.length)} of {archivedNotifications.length} archived notifications
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadArchivedPage(archivedPage - 1)}
                    disabled={archivedPage <= 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {archivedPage} of {archivedPagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadArchivedPage(archivedPage + 1)}
                    disabled={archivedPage >= archivedPagination.pages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            {notificationToDelete && (
              <div className="p-3 bg-muted rounded-md">
                <p className="font-medium text-sm">{notificationToDelete.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{notificationToDelete.message}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialog(false);
                  setNotificationToDelete(null);
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteNotification}
                disabled={isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}