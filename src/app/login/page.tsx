import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { AuthShell } from "@/components/auth-shell";
import { PasswordLoginForm } from "@/components/auth-forms";
import { devSignIn, signInWithGoogle } from "@/app/actions/auth";
import { devLoginEnabled } from "@/auth";
import { googleEnabled } from "@/auth.config";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  AccessDenied: "Access denied. Your account isn't approved yet, or it has been deactivated. Contact your admin.",
  CredentialsSignin: "Sign-in failed. Check your email and password.",
  Configuration: "Sign-in is not configured correctly. Please contact your administrator.",
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;

  return (
    <AuthShell title="Welcome back" subtitle="Sign in with the email your admin approved.">
      {message && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {message}
        </p>
      )}
      <PasswordLoginForm />
      <p className="text-center text-sm text-muted-foreground">
        First time here, or have a new setup code?{" "}
        <Link href="/setup" className="font-medium text-primary underline-offset-4 hover:underline">
          Set up your account
        </Link>
      </p>
      {googleEnabled && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <form action={signInWithGoogle}>
            <Button type="submit" variant="outline" size="lg" className="w-full">
              <GoogleIcon /> Continue with Google
            </Button>
          </form>
        </>
      )}
      {devLoginEnabled && (
        <form action={devSignIn} className="space-y-3 rounded-lg border border-dashed border-warning p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Development login (DEV_LOGIN=true)
          </p>
          <Input name="email" type="email" required placeholder="you@demo.local" defaultValue="admin@demo.local" />
          <Input name="name" placeholder="Display name (optional)" />
          <Button type="submit" variant="secondary" className="w-full">
            Sign in without a password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
