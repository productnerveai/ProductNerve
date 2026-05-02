import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, ScrollText, Ban, AlertTriangle, Eye } from "lucide-react";
import { useState } from "react";

export default function SecurityAuditPage() {
  const [logPage, setLogPage] = useState(0);
  const PAGE_SIZE = 30;

  const { data: unauthorizedAttempts = [] } = useQuery({
    queryKey: ["admin-security-unauthorized"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const { data: adminActions = [] } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const { data: suspendedUsers = [] } = useQuery({
    queryKey: ["admin-suspended-users"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const { data: rejectedKYC = [] } = useQuery({
    queryKey: ["admin-security-kyc-rejected"],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return [];
    },
  });

  const paginatedLogs = adminActions.slice(logPage * PAGE_SIZE, (logPage + 1) * PAGE_SIZE);
  const totalLogPages = Math.ceil(adminActions.length / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security & Audit</h1>
        <p className="text-muted-foreground text-sm">Monitor security events and admin activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Unauthorized Attempts", value: unauthorizedAttempts.length, icon: ShieldAlert, color: "text-destructive" },
          { title: "Suspended Users", value: suspendedUsers.length, icon: Ban, color: "text-accent" },
          { title: "KYC Rejections", value: rejectedKYC.length, icon: AlertTriangle, color: "text-accent" },
          { title: "Admin Actions", value: adminActions.length, icon: Eye, color: "text-primary" },
        ].map(card => (
          <Card key={card.title}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                </div>
                <card.icon className={`h-6 w-6 ${card.color} opacity-40`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="audit">
        <TabsList>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="unauthorized">Unauthorized Attempts</TabsTrigger>
          <TabsTrigger value="suspended">Suspended Users</TabsTrigger>
          <TabsTrigger value="kyc">KYC Rejections</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>Details</TableHead><TableHead>Time</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {paginatedLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell><Badge variant="outline">{log.action}</Badge></TableCell>
                      <TableCell className="text-sm">{log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{JSON.stringify(log.details)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(log.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalLogPages > 1 && (
                <div className="flex justify-end gap-2 mt-3">
                  <button className="text-sm text-primary disabled:text-muted-foreground" disabled={logPage === 0} onClick={() => setLogPage(p => p - 1)}>← Prev</button>
                  <span className="text-sm text-muted-foreground">{logPage + 1}/{totalLogPages}</span>
                  <button className="text-sm text-primary disabled:text-muted-foreground" disabled={logPage >= totalLogPages - 1} onClick={() => setLogPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unauthorized" className="mt-4">
          <Card><CardContent className="pt-4">
            {unauthorizedAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No unauthorized attempts</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>User Email</TableHead><TableHead>Route</TableHead><TableHead>Time</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {unauthorizedAttempts.map(a => {
                    const details = a.details as any;
                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-sm">{details?.user_email || "Unknown"}</TableCell>
                        <TableCell>{a.entity_id}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(a.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="suspended" className="mt-4">
          <Card><CardContent className="pt-4">
            {suspendedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No suspended users</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {suspendedUsers.map((u: any) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.name || "—"}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell><Badge variant="destructive">Suspended</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="kyc" className="mt-4">
          <Card><CardContent className="pt-4">
            {rejectedKYC.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No rejected KYC records</p>
            ) : (
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Company</TableHead><TableHead>Reason</TableHead><TableHead>Date</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rejectedKYC.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>{r.official_company_name || "N/A"}</TableCell>
                      <TableCell className="text-sm">{r.rejection_reason || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
