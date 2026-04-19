import { useState } from "react";
import { Bell, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Dummy notifications data
const dummyNotifications = [
  {
    id: "1",
    title: "New product launch",
    message: "Check out our latest product features and improvements",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    read_at: null,
    user_id: "user1",
    priority: "high",
    link: "/app/products"
  },
  {
    id: "2",
    title: "System update",
    message: "System maintenance scheduled for tonight at 11 PM",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    read_at: null,
    user_id: "user1",
    priority: "medium",
    link: null
  },
  {
    id: "3",
    title: "Welcome to ProductNerve",
    message: "Get started with our quick onboarding guide",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    user_id: "user1",
    priority: "low",
    link: "/app/onboarding"
  }
];

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);

  const markRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  };

  const markAllRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

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
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3 ${!n.read_at ? "bg-primary/[0.03]" : ""}`}
                  onClick={() => {
                    if (!n.read_at && n.user_id) markRead(n.id);
                    if (n.link) { setOpen(false); navigate(n.link); }
                  }}
                >
                  <div className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${!n.read_at ? getPriorityColor((n as any).priority || "low") : "bg-transparent"}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-tight ${!n.read_at ? "font-semibold" : "font-medium text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
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
