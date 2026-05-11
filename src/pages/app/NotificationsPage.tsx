import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import NotificationApiService from "@/services/notificationApi";
import { toast } from "sonner";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, [filter, page]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const unreadOnly = filter === "unread";
      const result = await NotificationApiService.getNotifications(page, 20, unreadOnly);
      
      if (result.success) {
        if (page === 0) {
          setNotifications(result.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...result.data.notifications]);
        }
        setTotalPages(result.data.pagination.pages);
      } else {
        toast.error("Failed to load notifications");
      }
    } catch (error) {
      toast.error("Error loading notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      console.log('Marking notification as read, ID:', id, 'Full notification:', notifications.find(n => n._id === id || n.id === id));
      const result = await NotificationApiService.markAsRead(id);
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true, read_at: new Date().toISOString() } : n)
        );
      }
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const result = await NotificationApiService.markAllAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
        );
        toast.success("All notifications marked as read");
      }
    } catch (error) {
      toast.error("Failed to mark all notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "billing") return n.type === "billing" || n.type === "payment_received";
    if (filter === "system") return n.type === "account_suspended" || n.type === "account_activated" || n.type === "account_deactivated" || n.type === "admin_promotion" || n.type === "access_granted" || n.type === "system_update";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">High</Badge>;
      case "medium": return <Badge className="bg-accent text-accent-foreground text-[10px] px-1.5 py-0">Medium</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={markingAll}>
            <CheckCheck className="h-4 w-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((n) => (
                <div
                  key={n._id || n.id}
                  className={`glass-card rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read ? "border-l-2 border-l-accent" : ""}`}
                  onClick={() => {
                    const notificationId = n._id || n.id;
                    console.log('Clicked notification, ID:', notificationId, 'Full notification:', n);
                    if (!n.read && notificationId) markRead(notificationId);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${!n.read ? "bg-accent" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                      {getPriorityBadge((n as any).priority || "low")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {n.link && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                    {!n.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const notificationId = n._id || n.id;
                          if (notificationId) markRead(notificationId); 
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
