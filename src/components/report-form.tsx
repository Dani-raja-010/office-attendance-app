"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { submitReport } from "@/app/actions/work";

type Props = {
  initial: { tasks_summary: string; blockers: string; next_day_plan: string; progress_percentage: number };
  suggestedProgress: number;
  isUpdate: boolean;
};

export function ReportForm({ initial, suggestedProgress, isUpdate }: Props) {
  const [state, action, pending] = useActionState(submitReport, null);
  const [progress, setProgress] = useState(initial.progress_percentage);

  useEffect(() => {
    if (!state) return;
    if (state.ok) toast.success(state.message);
    else toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="tasks_summary">Achievements today</Label>
        <Textarea
          id="tasks_summary"
          name="tasks_summary"
          required
          minLength={10}
          maxLength={5000}
          defaultValue={initial.tasks_summary}
          placeholder="What did you accomplish today?"
          className="min-h-32"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="blockers">Blockers</Label>
        <Textarea
          id="blockers"
          name="blockers"
          maxLength={3000}
          defaultValue={initial.blockers}
          placeholder="Anything slowing you down? Leave empty if none."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="next_day_plan">Plan for tomorrow</Label>
        <Textarea
          id="next_day_plan"
          name="next_day_plan"
          maxLength={3000}
          defaultValue={initial.next_day_plan}
          placeholder="What will you work on next?"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="progress_percentage">Overall progress</Label>
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
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full accent-[var(--primary)]"
        />
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground">
          Average of today&apos;s tasks: {suggestedProgress}%.{" "}
          <button type="button" className="text-primary hover:underline" onClick={() => setProgress(suggestedProgress)}>
            Use this value
          </button>
        </p>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Send />}
        {isUpdate ? "Update report" : "Submit report"}
      </Button>
    </form>
  );
}
