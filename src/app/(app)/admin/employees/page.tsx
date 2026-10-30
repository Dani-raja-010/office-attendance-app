import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/page-header";
import { EmployeeActions } from "@/components/employee-actions";
import { AddAllowedEmailForm, AllowedEmailRow } from "@/components/allowed-emails";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/lib/session";
import { listAllowedEmails, listUsers } from "@/lib/users";

export const metadata: Metadata = { title: "Employees" };

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default async function EmployeesPage() {
  const me = await requireAdmin();
  const [users, allowed] = await Promise.all([listUsers(), listAllowedEmails()]);
  const admins = users.filter((u) => u.role === "admin").length;

  return (
    <>
      <PageHeader
        title="Employees"
        description={`${users.length} accounts · ${admins} admin${admins === 1 ? "" : "s"}. Approved people get an account and employee ID when they first set up their account.`}
      />
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Approved emails</CardTitle>
          <CardDescription>
            Add an employee&apos;s email to get a setup code for them. Only these emails (plus admins) can sign in.
            Removing someone also deactivates their account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <AddAllowedEmailForm />
          {allowed.length === 0 ? (
            <EmptyState>No approved emails yet. Add an employee&apos;s Gmail address to let them sign in.</EmptyState>
          ) : (
            <ul className="divide-y">
              {allowed.map((a) => (
                <AllowedEmailRow key={a.email} email={a.email} employeeId={a.employee_id} name={a.name} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="py-0">
        <CardContent className="px-0">
          {users.length === 0 ? (
            <div className="p-5">
              <EmptyState>No employees yet.</EmptyState>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} image={u.image} />
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.employee_id}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                        {u.role === "admin" ? "Admin" : "Employee"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.is_active ? "success" : "destructive"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{dateFmt.format(u.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.last_login_at ? dateFmt.format(u.last_login_at) : "—"}
                    </TableCell>
                    <TableCell>
                      <EmployeeActions userId={u.id} email={u.email} role={u.role} isActive={u.is_active} isSelf={u.id === me.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
