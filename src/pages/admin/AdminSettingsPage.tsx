import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Settings, Shield, AlertTriangle, Tag, Plus } from "lucide-react";
import { useState } from "react";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["admin-system-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("system_settings").select("*");
      const map: Record<string, any> = {};
      data?.forEach(s => { map[s.key] = s.value; });
      return map;
    },
  });

  const upsertSetting = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: any; description?: string }) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data: existing } = await supabase.from("system_settings").select("id").eq("key", key).single();
      if (existing) {
        const { error } = await supabase.from("system_settings").update({ value, updated_by: userId }).eq("key", key);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("system_settings").insert({ key, value, description, updated_by: userId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
      toast({ title: "Setting updated" });
    },
  });

  const maintenance = settings?.maintenance_mode?.enabled ?? false;
  const featureToggles = settings?.feature_toggles ?? {
    phase1_enabled: true, phase2_enabled: true, phase3_enabled: true,
    pdf_export_enabled: true, kyc_required: false,
  };

  const toggleFeature = (key: string) => {
    const updated = { ...featureToggles, [key]: !featureToggles[key] };
    upsertSetting.mutate({ key: "feature_toggles", value: updated, description: "Feature toggle flags" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Platform configuration, feature flags, and system controls</p>
      </div>

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="security">Security Info</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-primary" /> Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "phase1_enabled", label: "Phase 1 — Validation Engine", desc: "Enable/disable the Venture Pressure Engine" },
                { key: "phase2_enabled", label: "Phase 2 — Execution Engine", desc: "Enable/disable the Venture Construction Engine" },
                { key: "phase3_enabled", label: "Phase 3 — Growth Engine", desc: "Enable/disable the Venture Acceleration Engine" },
                { key: "pdf_export_enabled", label: "PDF Export", desc: "Allow users to export venture blueprints" },
                { key: "kyc_required", label: "KYC Required", desc: "Require KYC verification before project creation" },
              ].map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{toggle.label}</p>
                    <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                  </div>
                  <Switch
                    checked={featureToggles[toggle.key] ?? true}
                    onCheckedChange={() => toggleFeature(toggle.key)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="mt-4">
          <Card className={maintenance ? "border-destructive" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className={`h-4 w-4 ${maintenance ? "text-destructive" : "text-muted-foreground"}`} />
                Maintenance Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {maintenance ? "Platform is in maintenance mode." : "Platform is operational."}
              </p>
              <Switch
                checked={maintenance}
                onCheckedChange={v => upsertSetting.mutate({ key: "maintenance_mode", value: { enabled: v }, description: "Maintenance mode toggle" })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Role-based admin access control: <span className="text-foreground font-medium">Active</span></p>
              <p>• RLS enforcement: <span className="text-foreground font-medium">Active</span></p>
              <p>• Tenant isolation (workspace-level): <span className="text-foreground font-medium">Active</span></p>
              <p>• Audit logging: <span className="text-foreground font-medium">Active</span></p>
              <p>• Encrypted document storage: <span className="text-foreground font-medium">Active</span></p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
