import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { NewTaskForm, TaskItem } from "@/components/task-components";
import { requireUser } from "@/lib/session";
import { listTasks, summarizeTasks } from "@/lib/work";
import { formatDate, isDateStr, officeDate } from "@/lib/time";

export const metadata: Metadata = { title: "My Tasks" };

export default async function TasksPage({ searchParams }: PageProps<"/tasks">) {
  const user = await requireUser();
  const today = officeDate();
  const { date: rawDate } = await searchParams;
  const date = isDateStr(rawDate) && rawDate <= today ? rawDate : today;
  const editable = date === today;

  const tasks = await listTasks(user.id, date);
  const stats = summarizeTasks(tasks);

  return (
    <>
      <PageHeader title="My Tasks" description={`${formatDate(date, "long")}${editable ? "" : " · read only"}`}>
        <form className="flex items-center gap-2">
          <Input type="date" name="date" defaultValue={date} max={today} className="w-40" aria-label="Date" />
          <Button type="submit" variant="outline">
            View
          </Button>
        </form>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        {editable ? (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Add a task</CardTitle>
              <CardDescription>Log what you worked on, time spent, and how far along it is.</CardDescription>
            </CardHeader>
            <CardContent>
              <NewTaskForm />
            </CardContent>
          </Card>
        ) : (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Past day</CardTitle>
              <CardDescription>Tasks from previous days can no longer be edited.</CardDescription>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>
              {stats.count} task{stats.count === 1 ? "" : "s"} · {stats.totalHours.toFixed(2)} h
            </CardTitle>
            <CardDescription>
              {stats.completed} completed · {stats.blocked} blocked · average progress {stats.avgProgress}%
            </CardDescription>
            <Progress value={stats.avgProgress} className="mt-2" />
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <EmptyState>No tasks for this day.</EmptyState>
            ) : (
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <TaskItem
                    key={`${t.id}-${t.updated_at.valueOf()}`}
                    editable={editable}
                    task={{
                      id: t.id,
                      description: t.description,
                      status: t.status,
                      hours_spent: Number(t.hours_spent),
                      progress_percentage: t.progress_percentage,
                    }}
                  />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
