import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { notifyAdminsNewFeedback } from "@/lib/support-notifications";

export default function BetaFeedbackWidget() {
  // const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    // if (!title.trim() || !user) return;
    setSubmitting(true);
    // const { error } = await supabase.from("beta_feedback").insert({
    //   user_id: user.id,
    //   feedback_type: type,
    //   title: title.trim(),
    //   description: description.trim(),
    // });
    setSubmitting(false);
    // if (error) { toast.error("Failed to submit feedback"); return; }
    toast.success("Thank you for your feedback!");
    notifyAdminsNewFeedback({ feedback_type: type, title: title.trim(), description: description.trim() });
    setTitle("");
    setDescription("");
    setType("bug");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Beta Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Feedback</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="tool">Tool Feedback</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          <Textarea placeholder="Describe in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          <Button onClick={submit} disabled={!title.trim() || submitting} className="w-full">
            {submitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
