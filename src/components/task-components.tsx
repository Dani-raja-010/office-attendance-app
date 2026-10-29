"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { LoaderCircle, Plus, Save, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { createTask, deleteTask, updateTask } from "@/app/actions/work";
import { TASK_STATUSES, TASK_STATUS_LABELS, type ActionResult, type TaskStatus } from "@/lib/utils";

export type TaskView = {
  id: string;
  description: string;
  status: TaskStatus;
  hours_spent: number;
  progress_percentage: number;
};

const statusVariant = {
  todo: "outline",
  in_progress: "default",
  completed: "success",
  blocked: "destructive",
} as const;

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge variant={statusVariant[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}

function useResultToast(state: ActionResult | null, onSuccess?: () => void) {
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (state.message) toast.success(state.message);
      onSuccess?.();
    } else toast.error(state.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}

export function NewTaskForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(createTask, null);
  const [status, setStatus] = useState<TaskStatus>("in_progress");
  const [progress, setProgress] = useState(0);

  useResultToast(state, () => {
    formRef.current?.reset();
    setStatus("in_progress");
    setProgress(0);
  });

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Task description</Label>
        <Textarea
          id="description"
          name="description"
          required
          minLength={3}
          maxLength={2000}
          placeholder="e.g. Implemented the payroll CSV export endpoint"
          className="min-h-20"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            value={status}
            onChange={(e) => {
              const s = e.target.value as TaskStatus;
              setStatus(s);
              if (s === "completed") setProgress(100);
            }}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours_spent">Hours spent</Label>
          <Input id="hours_spent" name="hours_spent" type="number" min={0} max={24} step={0.25} defaultValue={1} required />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="progress_percentage">Progress</Label>
          <span className="text-sm font-medium tabular-nums">{progress}%</span>
        </div>
        <input
          id="progress_percentage"
          name="progress_percentage"
          type="range"
          min={0}
          max={100}
          step={5}
          value={progress}
          disabled={status === "completed"}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        {status === "completed" && <input type="hidden" name="progress_percentage" value={100} />}
        <Progress value={progress} />
      </div>
      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <LoaderCircle className="animate-spin" /> : <Plus />} Add task
      </Button>
    </form>
  );
}

export function TaskItem({ task, editable }: { task: TaskView; editable: boolean }) {
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [progress, setProgress] = useState(task.progress_percentage);
  const [hours, setHours] = useState(String(task.hours_spent));
  const [pending, startTransition] = useTransition();

  const dirty =
    status !== task.status || progress !== task.progress_percentage || Number(hours) !== Number(task.hours_spent);

  function save() {
    startTransition(async () => {
      const res = await updateTask(task.id, {
        description: task.description,
        status,
        hours_spent: hours,
        progress_percentage: status === "completed" ? 100 : progress,
      });
      if (res.ok) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  function remove() {
    if (!confirm("Delete this task?")) return;
    startTransition(async () => {
      const res = await deleteTask(task.id);
      if (res.ok) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  const shown = status === "completed" ? 100 : progress;

  return (
    <li className="space-y-3 rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{task.description}</p>
        <TaskStatusBadge status={status} />
      </div>
      <div className="flex items-center gap-3">
        <Progress value={shown} className="flex-1" />
        <span className="w-10 text-right text-sm font-medium tabular-nums">{shown}%</span>
      </div>
      {editable ? (
        <div className="flex flex-wrap items-end gap-3">
          <Select
            aria-label="Status"
            value={status}
            onChange={(e) => {
              const s = e.target.value as TaskStatus;
              setStatus(s);
              if (s === "completed") setProgress(100);
            }}
            className="w-36"
          >
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <input
            aria-label="Progress"
            type="range"
            min={0}
            max={100}
            step={5}
            value={shown}
            disabled={status === "completed"}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="min-w-32 flex-1 accent-[var(--primary)]"
          />
          <div className="flex items-center gap-1.5">
            <Clock className="size-4 text-muted-foreground" />
            <Input
              aria-label="Hours spent"
              type="number"
              min={0}
              max={24}
              step={0.25}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">h</span>
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="ghost" onClick={remove} disabled={pending} aria-label="Delete task">
              <Trash2 />
            </Button>
            <Button size="sm" onClick={save} disabled={pending || !dirty}>
              {pending ? <LoaderCircle className="animate-spin" /> : <Save />} Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3.5" /> {Number(task.hours_spent)} h spent
        </p>
      )}
    </li>
  );
}
