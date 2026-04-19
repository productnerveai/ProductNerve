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

// Generate dummy data
const generateDummyKycRecords = () => [
  {
    id: "kyc1",
    user_id: "user1",
    company_name: "Tech Corp",
    registration_number: "REG-2023-001",
    status: "approved",
    documents: ["passport.pdf", "certificate.pdf"],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: "admin",
    rejection_reason: null
  },
  {
    id: "kyc2",
    user_id: "user2",
    company_name: "Startup Inc",
    registration_number: "REG-2023-002",
    status: "pending",
    documents: ["id_card.pdf", "proof_of_address.pdf"],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: null,
    reviewed_by: null,
    rejection_reason: null
  },
  {
    id: "kyc3",
    user_id: "user4",
    company_name: "Design Co",
    registration_number: "REG-2023-003",
    status: "rejected",
    documents: ["passport.pdf"],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_by: "admin",
    rejection_reason: "Incomplete documentation"
  },
];

const generateDummyProfiles = () => [
  { id: "user1", name: "John Doe", email: "john@example.com" },
  { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  { id: "user4", name: "Alice Johnson", email: "alice@example.com" },
];

export default function KYCManagementPage() {
  const [selected, setSelected] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("all");
  const [records, setRecords] = useState(generateDummyKycRecords());
  const [profiles, setProfiles] = useState(generateDummyProfiles());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate initial loading
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const updateKyc = async ({ id, updates }: { id: string; updates: any }) => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords(prev => prev.map(r => r.id === id ? {
        ...r,
        ...updates,
        reviewed_by: "admin",
        reviewed_at: new Date().toISOString(),
      } : r));
      
      toast.success("KYC record updated");
      setSelected(null);
      setRejectionReason("");
      setIsLoading(false);
    }, 1000);
  };

  const getUser = (userId: string) => profiles?.find(p => p.id === userId);
  const total = records?.length || 0;
  const pending = records?.filter(r => r.status === "pending").length || 0;
  const approved = records?.filter(r => r.status === "approved").length || 0;
  const rejected = records?.filter(r => r.status === "rejected").length || 0;
  const filtered = filter === "all" ? records : records?.filter(r => r.status === filter);

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
              const user = getUser(r.user_id);
              return (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.company_name || "—"}</TableCell>
                  <TableCell className="text-sm">{user?.email || "—"}</TableCell>
                  <TableCell className="text-sm">{r.registration_number || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "destructive" : "outline"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</TableCell>
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
                <div><span className="text-muted-foreground">User:</span> {getUser(selected.user_id)?.email}</div>
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

              {selected.status === "pending" && (
                <div className="border-t pt-3 space-y-3">
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => updateKyc({ id: selected.id, updates: { status: "approved" } })}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                  </div>
                  <Textarea placeholder="Rejection reason (required)..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} rows={3} />
                  <Button variant="destructive" className="w-full" disabled={!rejectionReason} onClick={() => updateKyc({ id: selected.id, updates: { status: "rejected", rejection_reason: rejectionReason } })}>
                    <XCircle className="h-4 w-4 mr-1" /> Reject
                  </Button>
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
