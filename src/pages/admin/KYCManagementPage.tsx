import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShieldCheck, Clock, XCircle, Eye, CheckCircle } from "lucide-react";
import AdminApiService from "@/services/adminApi";

export default function KYCManagementPage() {
  const [selected, setSelected] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [filter, setFilter] = useState("all");
  const [records, setRecords] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadKycRecords();
  }, []);

  const loadKycRecords = async () => {
    setIsLoading(true);
    try {
      console.log('Loading KYC records...');
      const response = await AdminApiService.getAllKycSubmissions();
      console.log('KYC API response:', response);
      if (response.success) {
        console.log('Setting KYC records from response.data.submissions:', response.data.submissions);
        setRecords(response.data.submissions);
      } else {
        console.error("Failed to load KYC records:", response.error);
        toast.error("Failed to load KYC records");
      }
    } catch (error) {
      console.error("Error loading KYC records:", error);
      toast.error("Error loading KYC records");
    } finally {
      setIsLoading(false);
    }
  };

  const updateKyc = async ({ id, updates }: { id: string; updates: any }) => {
    setIsLoading(true);
    try {
      let response;
      if (updates.status === "approved") {
        response = await AdminApiService.approveKyc(id, "");
      } else if (updates.status === "rejected") {
        response = await AdminApiService.rejectKyc(id, rejectionReason);
      }
      
      if (response.success) {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, ...response.data } : r));
        toast.success(`KYC record ${updates.status}`);
        setSelected(null);
        setRejectionReason("");
      } else {
        toast.error(response.error || "Failed to update KYC record");
      }
    } catch (error) {
      toast.error("Error updating KYC record");
    } finally {
      setIsLoading(false);
    }
  };

  const getUser = (userId: string) => profiles?.find(p => p.id === userId);
  const total = records?.length || 0;
  const pending = records?.filter(r => r.profile_completion_status === "pending").length || 0;
  const approved = records?.filter(r => r.profile_completion_status === "approved").length || 0;
  const rejected = records?.filter(r => r.profile_completion_status === "rejected").length || 0;
  const filtered = filter === "all" ? records : records?.filter(r => r.profile_completion_status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">KYC Management</h1>
        <p className="text-muted-foreground text-sm">Review and manage KYC verification records</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-primary">{total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><Clock className="h-4 w-4 mx-auto text-accent mb-1" /><p className="text-2xl font-bold text-accent">{pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><CheckCircle className="h-4 w-4 mx-auto text-primary mb-1" /><p className="text-2xl font-bold text-primary">{approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="pt-4 text-center"><XCircle className="h-4 w-4 mx-auto text-destructive mb-1" /><p className="text-2xl font-bold text-destructive">{rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      <Tabs defaultValue="all" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({total})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead><TableHead>User</TableHead><TableHead>Reg #</TableHead>
              <TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered?.map(r => {
              console.log('KYC Record:', r); // Debug log to see data structure
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.company_name || "—"}</TableCell>
                  <TableCell className="text-sm">{r.email || "—"}</TableCell>
                  <TableCell className="text-sm">{r.registration_number || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.profile_completion_status === "approved" ? "default" : r.profile_completion_status === "rejected" ? "destructive" : "outline"}>
                      {r.profile_completion_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : "Invalid Date"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => { setSelected(r); setRejectionReason(""); }}>
                      <Eye className="h-4 w-4 mr-1" /> Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {(!filtered || filtered.length === 0) && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No records</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>KYC Review — {selected?.official_company_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">User:</span> {selected.email || "—"}</div>
                <div><span className="text-muted-foreground">Company:</span> {selected.company_name || "—"}</div>
                <div><span className="text-muted-foreground">Reg #:</span> {selected.registration_number || "—"}</div>
                <div><span className="text-muted-foreground">Phone:</span> {selected.phone || "—"}</div>
                <div><span className="text-muted-foreground">Website:</span> {selected.website || "—"}</div>
                <div><span className="text-muted-foreground">Email:</span> {selected.custom_email || "—"}</div>
              </div>

              {selected.document_url && (
                <div>
                  <p className="text-sm font-medium mb-1">Document</p>
                  <a href={selected.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">View Document</a>
                </div>
              )}

              {selected.profile_completion_status === "pending" && (
                <div className="border-t pt-3 space-y-3">
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => updateKyc({ id: selected.id, updates: { status: "approved" } })}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => setShowRejectionInput(!showRejectionInput)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                  
                  {showRejectionInput && (
                    <div className="space-y-3">
                      <Textarea 
                        placeholder="Rejection reason (required)..." 
                        value={rejectionReason} 
                        onChange={e => setRejectionReason(e.target.value)} 
                        rows={3} 
                      />
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        disabled={!rejectionReason} 
                        onClick={() => updateKyc({ id: selected.id, updates: { status: "rejected", rejection_reason: rejectionReason } })}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Confirm Rejection
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {selected.rejection_reason && (
                <div className="p-3 rounded-lg bg-destructive/10 text-sm">
                  <p className="text-xs font-medium text-destructive mb-1">Rejection Reason</p>
                  {selected.rejection_reason}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
