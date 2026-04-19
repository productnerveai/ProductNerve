import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { notifyAdminsNewTicket, sendTicketConfirmationToUser } from "@/lib/support-notifications";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [inquiryType, setInquiryType] = useState("general");
  const [message, setMessage] = useState("");

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!name.trim() || !email.trim() || !message.trim()) {
  //     toast.error("Please fill in all required fields");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const { error } = await supabase.from("support_tickets" as any).insert({
  //       name: name.trim(),
  //       email: email.trim().toLowerCase(),
  //       company: company.trim() || null,
  //       inquiry_type: inquiryType,
  //       message: message.trim(),
  //     } as any);
  //     if (error) throw error;
  //     toast.success("Message sent! We'll get back to you soon.");
  //     // Fire-and-forget: notify admins + send user confirmation
  //     notifyAdminsNewTicket({ name: name.trim(), email: email.trim().toLowerCase(), inquiry_type: inquiryType, message: message.trim() });
  //     sendTicketConfirmationToUser({ email: email.trim().toLowerCase(), name: name.trim(), message: message.trim() });
  //     setName("");
  //     setEmail("");
  //     setCompany("");
  //     setRole("");
  //     setInquiryType("general");
  //     setMessage("");
  //   } catch (err: any) {
  //     console.error("Contact form error:", err);
  //     toast.error("Failed to send message. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div>
      <section className="hero-gradient text-primary-foreground py-24">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-up">Let's Talk.</h1>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-xl">
          <form className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Company</label>
              <Input placeholder="Company name" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={100} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Role</label>
              <Input placeholder="Your role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={100} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Inquiry Type</label>
              <Select value={inquiryType} onValueChange={setInquiryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Message</label>
              <Textarea placeholder="How can we help?" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={1000} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Sending..." : "Send Message"}
              </Button>
              <Button type="button" variant="outline" className="flex-1">Book a Demo</Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}