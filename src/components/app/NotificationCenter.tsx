import { useState, useEffect } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import NotificationApiService from "@/services/notificationApi";

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await NotificationApiService.getNotifications(0, 15, false);
      if (result.success) {
        setNotifications(result.data.notifications);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
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
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      const result = await NotificationApiService.markAllAsRead();
      if (result.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
        );
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive";
      case "medium": return "bg-accent";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
          <Bell className="h-4 w-4" />
          {/* {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )} */}
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={markAllRead}
              >
                <Check className="h-3 w-3 mr-1" /> Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => { setOpen(false); navigate("/app/notifications"); }}
            >
              View all
            </Button>
          </div>
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.slice(0, 15).map((n) => (
                <button
                  key={n._id || n.id}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3 ${!n.read ? "bg-primary/[0.03]" : ""}`}
                  onClick={() => {
                    const notificationId = n._id || n.id;
                    console.log('Clicked notification, ID:', notificationId, 'Full notification:', n);
                    if (!n.read && notificationId) markRead(notificationId);
                    if (n.link) { setOpen(false); navigate(n.link); }
                  }}
                >
                  <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read ? getPriorityColor((n as any).priority || "low") : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <p 
                      className={`text-sm leading-tight ${!n.read ? "font-semibold" : "font-medium text-muted-foreground"}`}
                      style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {n.title}
                    </p>
                    <p 
                      className="text-xs text-muted-foreground mt-0.5 break-words"
                      style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        wordBreak: 'break-word'
                      }}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {n.link && <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 mt-1" />}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
