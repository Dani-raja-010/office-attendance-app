import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, FileText, ListChecks, Timer, CheckCircle2 } from "lucide-react";
import { CheckInCard } from "@/components/check-in-card";
import { LocationBadge, StatusBadge } from "@/components/attendance-badges";
import { StatCard } from "@/components/stat-card";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge } from "@/components/task-components";
import { requireUser } from "@/lib/session";
import { getAttendanceForDate, getOpenAttendance, listUserAttendance } from "@/lib/attendance";
import { getReport, listTasks, summarizeTasks } from "@/lib/work";
import { config } from "@/lib/config";
import { durationHours, formatDate, formatHours, formatTime, officeDate, shiftStartLabel } from "@/lib/time";
import { formatDistance } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const today = officeDate();

  const [todayRecord, open, tasks, report, recent] = await Promise.all([
    getAttendanceForDate(user.id, today),
    getOpenAttendance(user.id),
    listTasks(user.id, today),
    getReport(user.id, today),
    listUserAttendance(user.id, 7),
  ]);

  // An open record from yesterday (overnight shift) still needs a check-out.
  const active = open ?? todayRecord;
  const state = open ? "checked_in" : todayRecord ? "checked_out" : "none";
  const worked = active ? durationHours(active.check_in_time, active.check_out_time ?? new Date()) : null;
  const stats = summarizeTasks(tasks);
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        title={`Hello, ${firstName}`}
        description={
          <>
            {formatDate(today, "long")} · Employee ID <span className="font-mono">{user.employee_id}</span>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <CheckInCard
          state={state}
          officeName={config.office.name}
          shiftStart={shiftStartLabel()}
          summary={
            active
              ? {
                  checkIn: formatTime(active.check_in_time),
                  checkOut: formatTime(active.check_out_time),
                  worked: formatHours(worked),
                }
              : null
          }
        >
          {active && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <StatusBadge status={active.status} />
              <LocationBadge type={active.check_in_location_type} />
              {active.check_in_distance_m != null && (
                <span className="text-xs text-muted-foreground">
                  {formatDistance(active.check_in_distance_m)} from office
                </span>
              )}
            </div>
          )}
        </CheckInCard>

        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Tasks today" value={stats.count} hint={`${stats.completed} completed`} icon={ListChecks} />
            <StatCard label="Hours logged" value={stats.totalHours.toFixed(1)} hint="Across all tasks" icon={Timer} tone="success" />
            <StatCard
              label="EOD report"
              value={report ? "Sent" : "Pending"}
              hint={report ? `Updated ${formatTime(report.updated_at)}` : "Submit before leaving"}
              icon={FileText}
              tone={report ? "success" : "warning"}
            />
          </div>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Today&apos;s progress</CardTitle>
                <CardDescription>Average across {stats.count} task{stats.count === 1 ? "" : "s"}</CardDescription>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/tasks">
                  Manage tasks <ArrowRight />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Progress value={stats.avgProgress} className="h-3 flex-1" />
                <span className="text-sm font-semibold tabular-nums">{stats.avgProgress}%</span>
              </div>
              {tasks.length === 0 ? (
                <EmptyState>No tasks logged yet today.</EmptyState>
              ) : (
                <ul className="divide-y">
                  {tasks.slice(0, 5).map((t) => (
                    <li key={t.id} className="flex items-center gap-3 py-2.5">
                      <p className="min-w-0 flex-1 truncate text-sm">{t.description}</p>
                      <span className="text-xs tabular-nums text-muted-foreground">{t.progress_percentage}%</span>
                      <TaskStatusBadge status={t.status} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Recent attendance</CardTitle>
            <CardDescription>Your last 7 records</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">
              View all <ArrowRight />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <EmptyState>No attendance records yet.</EmptyState>
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 text-sm">
                  <span className="w-32 font-medium">{formatDate(r.date)}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" /> {formatTime(r.check_in_time)} – {formatTime(r.check_out_time)}
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <CheckCircle2 className="size-3.5" /> {formatHours(durationHours(r.check_in_time, r.check_out_time))}
                  </span>
                  <span className="ml-auto flex gap-2">
                    <StatusBadge status={r.status} />
                    <LocationBadge type={r.check_in_location_type} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  );
}
