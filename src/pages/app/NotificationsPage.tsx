import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

// Dummy notifications data
const dummyNotifications = [
  // {
  //   id: "notif1",
  //   title: "Welcome to ProductNerve!",
  //   message: "Get started by creating your first project and running it through our validation engine.",
  //   type: "system",
  //   priority: "high",
  //   read_at: null,
  //   created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  //   user_id: "user123",
  //   link: "/app/projects"
  // },
  // {
  //   id: "notif2",
  //   title: "Phase 1 Complete!",
  //   message: "Congratulations! Your venture validation is complete. View your scores and insights.",
  //   type: "system",
  //   priority: "medium",
  //   read_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  //   created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  //   user_id: "user123",
  //   link: "/app/projects/proj1/overview"
  // },
  // {
  //   id: "notif3",
  //   title: "New Feature: Product Studio",
  //   message: "Check out our new Product Studio tools for generating user stories and PRDs.",
  //   type: "info",
  //   priority: "low",
  //   read_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  //   created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  //   user_id: "user123",
  //   link: "/app/studio"
  // },
  // {
  //   id: "notif4",
  //   title: "Payment Reminder",
  //   message: "Your Pro subscription is due for renewal in 7 days.",
  //   type: "billing",
  //   priority: "medium",
  //   read_at: null,
  //   created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  //   user_id: "user123",
  //   link: "/app/billing"
  // },
  // {
  //   id: "notif5",
  //   title: "Phase 2 Ready",
  //   message: "Your venture has passed Phase 1. Start Phase 2 to build your execution blueprint.",
  //   type: "system",
  //   priority: "high",
  //   read_at: null,
  //   created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  //   user_id: "user123",
  //   link: "/app/projects/proj1"
  // }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    // Simulate loading notifications
    setTimeout(() => {
      setNotifications(dummyNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const markRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
    );
  };

  const markAllRead = () => {
    setMarkingAll(true);
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => !n.read_at && n.user_id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      setMarkingAll(false);
    }, 1000);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read_at;
    if (filter === "billing") return n.type === "billing";
    if (filter === "system") return n.type === "info" || n.type === "system";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

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
                  key={n.id}
                  className={`glass-card rounded-lg p-4 flex items-start gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${!n.read_at ? "border-l-2 border-l-accent" : ""}`}
                  onClick={() => {
                    if (!n.read_at && n.user_id) markRead(n.id);
                    if (n.link) navigate(n.link);
                  }}
                >
                  <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${!n.read_at ? "bg-accent" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read_at ? "font-semibold" : "font-medium text-muted-foreground"}`}>{n.title}</p>
                      {getPriorityBadge((n as any).priority || "low")}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {n.link && <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                    {!n.read_at && n.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
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
