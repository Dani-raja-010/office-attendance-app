import type { Metadata } from "next";
import { AlarmClock, AlertTriangle, FileText, Home, UserCheck, UserX } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AutoRefresh } from "@/components/auto-refresh";
import { AttendanceTable } from "@/components/attendance-table";
import { ExportButtons } from "@/components/export-buttons";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDailyOverview } from "@/lib/attendance";
import { reportCompliance } from "@/lib/work";
import { formatDate, isDateStr, isWorkDay, officeDate, shiftStartLabel } from "@/lib/time";
import { config } from "@/lib/config";

export const metadata: Metadata = { title: "Live Overview" };

export default async function AdminOverviewPage({ searchParams }: PageProps<"/admin">) {
  const today = officeDate();
  const { date: rawDate } = await searchParams;
  const date = isDateStr(rawDate) ? rawDate : today;
  const isToday = date === today;

  const [overview, compliance] = await Promise.all([getDailyOverview(date), reportCompliance(date)]);
  const pct = (n: number) => (overview.totalEmployees ? `${Math.round((n / overview.totalEmployees) * 100)}% of team` : "");
  const compliancePct = compliance.total ? Math.round((compliance.submitted / compliance.total) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Live overview"
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {formatDate(date, "long")} · {config.office.name} · shift {shiftStartLabel()} (+{config.shift.graceMinutes} min grace)
            {!isWorkDay(date) && <Badge variant="secondary">Non-working day</Badge>}
          </span>
        }
      >
        {isToday && <AutoRefresh />}
        <form className="flex items-center gap-2">
          <Input type="date" name="date" defaultValue={date} max={today} className="w-40" aria-label="Date" />
          <Button type="submit" variant="outline">
            View
          </Button>
        </form>
        <ExportButtons dataset="attendance" from={date} to={date} />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Present" value={overview.present} hint={pct(overview.present)} icon={UserCheck} tone="success" />
        <StatCard label="Late" value={overview.late} hint={pct(overview.late)} icon={AlarmClock} tone="warning" />
        <StatCard label="Absent" value={overview.absent} hint={pct(overview.absent)} icon={UserX} tone="destructive" />
        <StatCard label="Remote" value={overview.remote} hint="Outside geofence" icon={Home} tone="muted" />
        <StatCard label="Flagged" value={overview.flagged} hint="Needs review" icon={AlertTriangle} tone="destructive" />
        <StatCard
          label="EOD reports"
          value={`${compliancePct}%`}
          hint={`${compliance.submitted}/${compliance.total} submitted`}
          icon={FileText}
          tone={compliancePct >= 95 ? "success" : "primary"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="min-w-0 pb-0">
          <CardHeader>
            <CardTitle>Check-ins</CardTitle>
            <CardDescription>
              {overview.present} checked in · {overview.checkedOut} checked out
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {overview.records.length === 0 ? (
              <div className="px-5 pb-5">
                <EmptyState>No one has checked in{isToday ? " yet" : " on this day"}.</EmptyState>
              </div>
            ) : (
              <AttendanceTable records={overview.records} />
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Absent ({overview.absentees.length})</CardTitle>
            <CardDescription>Active employees without a check-in</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.absentees.length === 0 ? (
              <EmptyState>Everyone is in. 🎉</EmptyState>
            ) : (
              <ul className="space-y-3">
                {overview.absentees.map((u) => (
                  <li key={u.id} className="flex items-center gap-2.5">
                    <Avatar name={u.name} image={u.image} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{u.name}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{u.employee_id}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
