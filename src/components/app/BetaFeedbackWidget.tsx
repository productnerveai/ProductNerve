import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function BetaFeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("bug");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title for your feedback");
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/support/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          feedback_type: type
        })
      });

      if (response.ok) {
        toast.success("Thank you for your feedback! We'll get back to you soon.");
        setTitle("");
        setDescription("");
        setType("bug");
        setOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Feedback & Support
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feedback & Support</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bug">Bug Report</SelectItem>
              <SelectItem value="feature">Feature Request</SelectItem>
              <SelectItem value="tool">Tool Feedback</SelectItem>
              <SelectItem value="improvement">Improvement</SelectItem>
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
