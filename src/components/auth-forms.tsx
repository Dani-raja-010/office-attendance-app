"use client";

import { useActionState } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { passwordSignIn, setupAccount } from "@/app/actions/auth";

function FormError({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </p>
  );
}

export function PasswordLoginForm() {
  const [state, action, pending] = useActionState(passwordSignIn, null);

  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@gmail.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />} Sign in
      </Button>
    </form>
  );
}

export function SetupAccountForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, action, pending] = useActionState(setupAccount, null);

  return (
    <form action={action} className="space-y-4">
      <FormError error={state?.error} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
          placeholder="you@gmail.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="code">Setup code from your admin</Label>
        <Input
          id="code"
          name="code"
          required
          autoComplete="one-time-code"
          placeholder="ABCD-EFGH"
          className="font-mono uppercase tracking-widest"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder="e.g. Ali Raza" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Repeat password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <LoaderCircle className="animate-spin" />} Set password and sign in
      </Button>
    </form>
  );
}
