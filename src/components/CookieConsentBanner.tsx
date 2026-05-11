import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { getConsent, setConsent } from "@/lib/consent";

export default function CookieConsentBanner() {
  const [show, setShow] = useState(false);
  const [managing, setManaging] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!getConsent()) setShow(true);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const accept = () => {
    setConsent(true);
    setShow(false);
  };
  const reject = () => {
    setConsent(false);
    setShow(false);
  };
  const savePrefs = () => {
    setConsent(analytics);
    setManaging(false);
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div className="mx-auto max-w-5xl rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg p-4 sm:p-5 flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 text-sm text-muted-foreground">
            We use cookies and analytics tools to improve your experience and understand how Product Nerve AI is used.
            See our{" "}
            <Link to="/privacy" className="text-primary underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </div>
          <div className="flex flex-wrap gap-2 md:justify-end">
            <Button variant="outline" size="sm" onClick={reject}>
              Reject Non-Essential
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setManaging(true)}>
              Manage Preferences
            </Button>
            <Button size="sm" onClick={accept}>
              Accept All
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={managing} onOpenChange={setManaging}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cookie Preferences</DialogTitle>
            <DialogDescription>
              Choose which cookies you allow. Essential cookies are always active.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base font-medium">Essential cookies</Label>
                <p className="text-xs text-muted-foreground">Required for the site to function. Always on.</p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base font-medium">Analytics cookies</Label>
                <p className="text-xs text-muted-foreground">Help us understand product usage (GA4, PostHog, Meta Pixel).</p>
              </div>
              <Switch checked={analytics} onCheckedChange={setAnalytics} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setManaging(false)}>Cancel</Button>
            <Button onClick={savePrefs}>Save Preferences</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
