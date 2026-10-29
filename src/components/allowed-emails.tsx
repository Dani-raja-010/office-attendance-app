"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";
import { LoaderCircle, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { addAllowedEmail, removeAllowedEmail } from "@/app/actions/admin";

export function AddAllowedEmailForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addAllowedEmail, null);

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      formRef.current?.reset();
    } else toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-2 sm:flex-row">
      <Input name="email" type="email" required placeholder="employee@gmail.com" aria-label="Employee email" />
      <Button type="submit" disabled={pending} className="shrink-0">
        {pending ? <LoaderCircle className="animate-spin" /> : <UserPlus />} Add employee
      </Button>
    </form>
  );
}

export function AllowedEmailRow({
  email,
  employeeId,
  name,
}: {
  email: string;
  employeeId: string | null;
  name: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{email}</p>
        <p className="text-xs text-muted-foreground">{name ?? "Hasn't signed in yet"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {employeeId ? (
          <Badge variant="secondary" className="font-mono">
            {employeeId}
          </Badge>
        ) : (
          <Badge variant="outline">Invited</Badge>
        )}
        <Button
          size="sm"
          variant="ghost"
          aria-label={`Remove ${email}`}
          disabled={pending}
          onClick={() => {
            if (!confirm(`Remove ${email}? They will no longer be able to sign in.`)) return;
            startTransition(async () => {
              const res = await removeAllowedEmail(email);
              if (res.ok) toast.success(res.message);
              else toast.error(res.error);
            });
          }}
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}
