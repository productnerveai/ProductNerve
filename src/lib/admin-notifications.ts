import { supabase } from "@/integrations/supabase/client";

export type AdminBroadcastForm = {
  title: string;
  message: string;
  channel: string;
  audience: string;
  timeFilter?: string;
};

type BroadcastResult = {
  attempted: number;
  delivered: number;
};

const chunkArray = <T,>(items: T[], size: number) => {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

async function getTargetUserIds(audience: string, timeFilter?: string) {
  let query = supabase.from("profiles").select("id");

  if (audience === "free_users") {
    query = query.or("plan_type.eq.free,plan_type.is.null");
  } else if (audience === "paid_users") {
    query = query.in("plan_type", ["pro", "project_unlock"]);
  } else if (audience === "inactive_users") {
    query = query.eq("user_status", "inactive");
  }

  // Apply time-based filter on created_at
  if (timeFilter && timeFilter !== "all") {
    const now = new Date();
    let cutoff: Date;
    switch (timeFilter) {
      case "24h": cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); break;
      case "3d": cutoff = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); break;
      case "7d": cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case "14d": cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000); break;
      case "30d": cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      default: cutoff = new Date(0);
    }
    query = query.gte("created_at", cutoff.toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((user) => user.id);
}

async function deliverAdminNotification(params: {
  adminUserId: string;
  userId: string;
  title: string;
  message: string;
  channel: string;
  actionUrl?: string | null;
}) {
  const { error } = await supabase.functions.invoke("notify-user", {
    body: {
      event_type: "admin_broadcast",
      user_id: params.userId,
      metadata: {
        title: params.title,
        message: params.message,
        action_url: params.actionUrl ?? null,
        created_by: params.adminUserId,
        channel_override: [params.channel],
      },
    },
  });

  if (error) throw error;
}

export async function sendAdminBroadcast(form: AdminBroadcastForm): Promise<BroadcastResult> {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");

  const userIds = await getTargetUserIds(form.audience, form.timeFilter);

  const { error: broadcastError } = await supabase.from("admin_broadcasts").insert({
    title: form.title,
    message: form.message,
    channel: form.channel,
    target_group: form.audience,
    created_by: user.id,
    sent_count: userIds.length,
  });

  if (broadcastError) throw broadcastError;

  let delivered = 0;

  for (const batch of chunkArray(userIds, 10)) {
    const results = await Promise.allSettled(
      batch.map((userId) =>
        deliverAdminNotification({
          adminUserId: user.id,
          userId,
          title: form.title,
          message: form.message,
          channel: form.channel,
        })
      )
    );

    delivered += results.filter((result) => result.status === "fulfilled").length;
  }

  return { attempted: userIds.length, delivered };
}

export async function resendAdminNotification(notification: {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  channel: string;
  action_url?: string | null;
  link?: string | null;
}) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("Not authenticated");
  if (!notification.user_id) throw new Error("This notification is not tied to a user");

  await deliverAdminNotification({
    adminUserId: user.id,
    userId: notification.user_id,
    title: notification.title,
    message: notification.message,
    channel: notification.channel,
    actionUrl: notification.action_url || notification.link,
  });
}

export async function archiveAdminNotification(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ sent_status: "archived" })
    .eq("id", notificationId);

  if (error) throw error;
}

export async function deleteAdminNotification(notificationId: string) {
  const { error } = await supabase.from("notifications").delete().eq("id", notificationId);
  if (error) throw error;
}