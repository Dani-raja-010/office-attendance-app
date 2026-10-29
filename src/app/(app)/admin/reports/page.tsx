import type { Metadata } from "next";
import { AlertOctagon, Clock } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { ExportButtons } from "@/components/export-buttons";
import { TaskStatusBadge } from "@/components/task-components";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listUsers } from "@/lib/users";
import { listReportsRange, listTasksRange, summarizeTasks } from "@/lib/work";
import { formatDate, formatTime, isDateStr, officeDate } from "@/lib/time";

export const metadata: Metadata = { title: "Reports & Tasks" };

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const today = officeDate();
  const { date: rawDate } = await searchParams;
  const date = isDateStr(rawDate) ? rawDate : today;

  const [users, reports, tasks] = await Promise.all([
    listUsers(),
    listReportsRange(date, date),
    listTasksRange(date, date),
  ]);

  const employees = users
    .filter((u) => u.is_active)
    .map((u) => {
      const userTasks = tasks.filter((t) => t.user_id === u.id);
      return { user: u, report: reports.find((r) => r.user_id === u.id) ?? null, tasks: userTasks, stats: summarizeTasks(userTasks) };
    })
    // Submitted first, then by name
    .sort((a, b) => Number(Boolean(b.report)) - Number(Boolean(a.report)) || a.user.name.localeCompare(b.user.name));

  const submitted = employees.filter((e) => e.report).length;

  return (
    <>
      <PageHeader
        title="Reports & tasks"
        description={`${formatDate(date, "long")} · ${submitted} of ${employees.length} EOD reports submitted · ${tasks.length} tasks logged`}
      >
        <form className="flex items-center gap-2">
          <Input type="date" name="date" defaultValue={date} max={today} className="w-40" aria-label="Date" />
          <Button type="submit" variant="outline">
            View
          </Button>
        </form>
        <ExportButtons dataset="reports" from={date} to={date} label="Reports" />
        <ExportButtons dataset="tasks" from={date} to={date} label="Tasks" />
      </PageHeader>

      {employees.length === 0 ? (
        <EmptyState>No active employees yet.</EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {employees.map(({ user, report, tasks: userTasks, stats }) => (
            <Card key={user.id}>
              <CardHeader className="flex-row items-center gap-3">
                <Avatar name={user.name} image={user.image} className="size-10" />
                <div className="min-w-0 flex-1 space-y-1">
                  <CardTitle className="truncate">{user.name}</CardTitle>
                  <CardDescription className="font-mono text-xs">{user.employee_id}</CardDescription>
                </div>
                {report ? (
                  <Badge variant="success">Submitted {formatTime(report.updated_at)}</Badge>
                ) : (
                  <Badge variant="warning">No report</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {stats.count} tasks · {stats.totalHours.toFixed(2)} h
                    </span>
                    <span>Overall {report?.progress_percentage ?? stats.avgProgress}%</span>
                  </div>
                  <Progress value={report?.progress_percentage ?? stats.avgProgress} />
                </div>

                {report && (
                  <div className="space-y-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Achievements</p>
                      <p className="mt-1 whitespace-pre-wrap">{report.tasks_summary}</p>
                    </div>
                    {report.blockers && (
                      <div>
                        <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-destructive">
                          <AlertOctagon className="size-3.5" /> Blockers
                        </p>
                        <p className="mt-1 whitespace-pre-wrap">{report.blockers}</p>
                      </div>
                    )}
                    {report.next_day_plan && (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next day plan</p>
                        <p className="mt-1 whitespace-pre-wrap">{report.next_day_plan}</p>
                      </div>
                    )}
                  </div>
                )}

                {userTasks.length > 0 && (
                  <ul className="divide-y">
                    {userTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2 text-sm">
                        <p className="min-w-0 flex-1 truncate" title={t.description}>
                          {t.description}
                        </p>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="size-3" /> {Number(t.hours_spent)}h
                        </span>
                        <span className="w-9 text-right text-xs tabular-nums">{t.progress_percentage}%</span>
                        <TaskStatusBadge status={t.status} />
                      </li>
                    ))}
                  </ul>
                )}
                {!report && userTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nothing logged for this day.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
