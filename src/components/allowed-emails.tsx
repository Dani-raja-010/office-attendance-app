"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, KeyRound, LoaderCircle, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { addAllowedEmail, createSetupCode, removeAllowedEmail } from "@/app/actions/admin";

type IssuedCode = { email: string; code: string };

function shareMessage({ email, code }: IssuedCode) {
  const link = `${window.location.origin}/setup?email=${encodeURIComponent(email)}`;
  return `Your WorkTrack setup code is ${code}. Open ${link}, enter the code and choose a password. The code works once and expires in 7 days.`;
}

/** Shows a freshly issued setup code with a ready-to-send message for the employee. */
function SetupCodeNotice({ issued, onClose }: { issued: IssuedCode; onClose: () => void }) {
  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <p>
          Setup code for <span className="font-medium">{issued.email}</span>:
        </p>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
      <p className="font-mono text-2xl font-semibold tracking-widest">{issued.code}</p>
      <p className="text-xs text-muted-foreground">
        Send this to them (WhatsApp, SMS…). They open the site, click <em>Set up your account</em>, and enter it with a
        new password. It works once and expires in 7 days. It won&apos;t be shown again.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(shareMessage(issued));
            toast.success("Message copied. Paste it into WhatsApp or SMS.");
          } catch {
            toast.error("Couldn't copy. Please copy the code by hand.");
          }
        }}
      >
        <Copy /> Copy message to send
      </Button>
    </div>
  );
}

export function AddAllowedEmailForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(addAllowedEmail, null);
  // The latest result is shown until dismissed; a new submission yields a new state object.
  const [dismissed, setDismissed] = useState<typeof state>(null);
  const issued = state?.ok && state !== dismissed ? state : null;

  useEffect(() => {
    if (!state) return;
    if (state.ok) formRef.current?.reset();
    else toast.error(state.error);
  }, [state]);

  return (
    <div className="space-y-3">
      <form ref={formRef} action={action} className="flex flex-col gap-2 sm:flex-row">
        <Input name="email" type="email" required placeholder="employee@gmail.com" aria-label="Employee email" />
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? <LoaderCircle className="animate-spin" /> : <UserPlus />} Add employee
        </Button>
      </form>
      {issued && <SetupCodeNotice issued={issued} onClose={() => setDismissed(state)} />}
    </div>
  );
}

/** Issues a new setup code for someone who lost theirs or forgot their password. */
export function SetupCodeButton({ email, label }: { email: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [issued, setIssued] = useState<IssuedCode | null>(null);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          if (!confirm(`Create a new setup code for ${email}? Any earlier code stops working.`)) return;
          startTransition(async () => {
            const res = await createSetupCode(email);
            if (res.ok) setIssued({ email: res.email, code: res.code });
            else toast.error(res.error);
          });
        }}
      >
        {pending ? <LoaderCircle className="animate-spin" /> : <KeyRound />} {label}
      </Button>
      {issued && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-lg bg-background shadow-lg">
          <SetupCodeNotice issued={issued} onClose={() => setIssued(null)} />
        </div>
      )}
    </>
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
    <li className="flex flex-wrap items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{email}</p>
        <p className="text-xs text-muted-foreground">{name ?? "Hasn't set up their account yet"}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {employeeId ? (
          <Badge variant="secondary" className="font-mono">
            {employeeId}
          </Badge>
        ) : (
          <>
            <Badge variant="outline">Invited</Badge>
            <SetupCodeButton email={email} label="New code" />
          </>
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
