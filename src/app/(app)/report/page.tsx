import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ReportForm } from "@/components/report-form";
import { TaskStatusBadge } from "@/components/task-components";
import { requireUser } from "@/lib/session";
import { getReport, listTasks, listUserReports, summarizeTasks } from "@/lib/work";
import { formatDate, formatTime, officeDate } from "@/lib/time";

export const metadata: Metadata = { title: "EOD Report" };

export default async function ReportPage() {
  const user = await requireUser();
  const today = officeDate();
  const [report, tasks, history] = await Promise.all([
    getReport(user.id, today),
    listTasks(user.id, today),
    listUserReports(user.id, 10),
  ]);
  const stats = summarizeTasks(tasks);

  const draftSummary =
    tasks.length > 0
      ? tasks.map((t) => `• ${t.description} (${t.progress_percentage}%)`).join("\n")
      : "";

  return (
    <>
      <PageHeader title="End-of-day report" description={formatDate(today, "long")}>
        {report && (
          <Badge variant="success">
            <CheckCircle2 /> Submitted at {formatTime(report.updated_at)}
          </Badge>
        )}
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
        <Card>
          <CardHeader>
            <CardTitle>{report ? "Update today's report" : "Submit today's report"}</CardTitle>
            <CardDescription>Summarize achievements, blockers, and your plan for tomorrow.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportForm
              isUpdate={Boolean(report)}
              suggestedProgress={stats.avgProgress}
              initial={{
                tasks_summary: report?.tasks_summary ?? draftSummary,
                blockers: report?.blockers ?? "",
                next_day_plan: report?.next_day_plan ?? "",
                progress_percentage: report?.progress_percentage ?? stats.avgProgress,
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Today&apos;s tasks</CardTitle>
              <CardDescription>
                {stats.count} tasks · {stats.totalHours.toFixed(2)} h · {stats.avgProgress}% avg
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <EmptyState>No tasks logged today.</EmptyState>
              ) : (
                <ul className="space-y-3">
                  {tasks.map((t) => (
                    <li key={t.id} className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm">{t.description}</p>
                        <TaskStatusBadge status={t.status} />
                      </div>
                      <Progress value={t.progress_percentage} />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Previous reports</CardTitle>
            </CardHeader>
            <CardContent>
              {history.filter((r) => r.report_date !== today).length === 0 ? (
                <EmptyState>No previous reports.</EmptyState>
              ) : (
                <ul className="space-y-4">
                  {history
                    .filter((r) => r.report_date !== today)
                    .map((r) => (
                      <li key={r.id} className="space-y-1 border-l-2 border-primary/40 pl-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{formatDate(r.report_date)}</span>
                          <span>{r.progress_percentage}%</span>
                        </div>
                        <p className="line-clamp-3 whitespace-pre-wrap text-sm">{r.tasks_summary}</p>
                        {r.blockers && <p className="text-xs text-destructive">Blockers: {r.blockers}</p>}
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
