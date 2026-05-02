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
  // TODO: Replace with actual API call
  return [];
}

async function deliverAdminNotification(params: {
  adminUserId: string;
  userId: string;
  title: string;
  message: string;
  channel: string;
  actionUrl?: string | null;
}) {
  // TODO: Replace with actual notification delivery
  console.log("Delivering notification:", params);
}

export async function sendAdminBroadcast(form: AdminBroadcastForm): Promise<BroadcastResult> {
  // TODO: Replace with actual authentication
  const user = { id: "admin-user" };
  if (!user) throw new Error("Not authenticated");

  const userIds = await getTargetUserIds(form.audience, form.timeFilter);

  // TODO: Replace with actual database call
  console.log("Creating broadcast:", { form, userIds });

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
  // TODO: Replace with actual authentication
  const user = { id: "admin-user" };
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
  // TODO: Replace with actual database call
  console.log("Archiving notification:", notificationId);
}

export async function deleteAdminNotification(notificationId: string) {
  // TODO: Replace with actual database call
  console.log("Deleting notification:", notificationId);
}