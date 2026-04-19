// // import { supabase } from "@/integrations/supabase/client";

/**
 * Notify all platform admins about a new support ticket or feedback submission.
 * Sends email via send-email edge function to each admin.
 */
async function getAdminEmails(): Promise<string[]> {
  const { data } = await supabase
    .from("platform_admins" as any)
    .select("user_id")
    .eq("is_active", true);

  if (!data?.length) return [];

  const adminIds = data.map((a: any) => a.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("email")
    .in("id", adminIds);

  return (profiles || []).map((p) => p.email).filter(Boolean) as string[];
}

export async function notifyAdminsNewTicket(ticket: {
  name: string;
  email: string;
  inquiry_type: string;
  message: string;
}) {
  try {
    const adminEmails = await getAdminEmails();
    if (!adminEmails.length) {
      console.warn("No admin emails found for ticket notification");
      return;
    }

    // Send to each admin
    await Promise.allSettled(
      adminEmails.map((adminEmail) =>
        supabase.functions.invoke("send-email", {
          body: {
            type: "admin_new_ticket",
            to: adminEmail,
            metadata: {
              name: ticket.name,
              email: ticket.email,
              inquiry_type: ticket.inquiry_type,
              message: ticket.message,
            },
          },
        })
      )
    );
  } catch (e) {
    console.error("Failed to notify admins about new ticket:", e);
  }
}

export async function notifyAdminsNewFeedback(feedback: {
  feedback_type: string;
  title: string;
  description: string;
}) {
  try {
    const adminEmails = await getAdminEmails();
    if (!adminEmails.length) return;

    await Promise.allSettled(
      adminEmails.map((adminEmail) =>
        supabase.functions.invoke("send-email", {
          body: {
            type: "admin_new_feedback",
            to: adminEmail,
            metadata: {
              feedback_type: feedback.feedback_type,
              title: feedback.title,
              description: feedback.description,
            },
          },
        })
      )
    );
  } catch (e) {
    console.error("Failed to notify admins about new feedback:", e);
  }
}

export async function sendTicketConfirmationToUser(ticket: {
  email: string;
  name: string;
  message: string;
}) {
  try {
    await supabase.functions.invoke("send-email", {
      body: {
        type: "ticket_confirmation",
        to: ticket.email,
        metadata: {
          name: ticket.name,
          message: ticket.message,
        },
      },
    });
  } catch (e) {
    console.error("Failed to send ticket confirmation to user:", e);
  }
}
