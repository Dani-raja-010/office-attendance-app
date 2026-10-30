import type { Metadata } from "next";
import { CalendarCheck, MapPin, ListChecks, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { devSignIn, signInWithGoogle } from "@/app/actions/auth";
import { devLoginEnabled } from "@/auth";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  AccessDenied: "Access denied. Sign in with your company Google Workspace account, or ask an admin to activate your account.",
  CredentialsSignin: "Development login failed. Use an email on an allowed domain.",
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

const features = [
  { icon: MapPin, title: "GPS-verified check-in", text: "Location is validated on the server against the office geofence." },
  { icon: ListChecks, title: "Daily task tracking", text: "Log tasks, hours and progress, then submit your end-of-day report." },
  { icon: ShieldCheck, title: "Live admin oversight", text: "Real-time presence counts and one-click payroll exports." },
];

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const message = typeof error === "string" ? (ERRORS[error] ?? "Sign-in failed. Please try again.") : null;
  const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold text-white">
          <CalendarCheck className="size-6" /> WorkTrack
        </div>
        <div className="space-y-8">
          <h2 className="max-w-md text-3xl font-semibold leading-tight text-white">
            Attendance and daily progress, in one place.
          </h2>
          <ul className="space-y-5">
            {features.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="mt-0.5 rounded-lg bg-sidebar-accent p-2">
                  <Icon className="size-4 text-white" />
                </span>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="text-sm text-sidebar-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sidebar-muted">© {new Date().getFullYear()} WorkTrack</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground lg:hidden">
              <CalendarCheck className="size-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in with your company Google account to continue.</p>
          </div>
          {message && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {message}
            </p>
          )}
          {googleConfigured ? (
            <form action={signInWithGoogle}>
              <Button type="submit" variant="outline" size="lg" className="w-full">
                <GoogleIcon /> Continue with Google
              </Button>
            </form>
          ) : (
            <p role="status" className="rounded-md border border-warning/40 bg-warning/10 p-3 text-sm">
              Google sign-in isn&apos;t set up yet. The administrator needs to add <code>AUTH_GOOGLE_ID</code> and{" "}
              <code>AUTH_GOOGLE_SECRET</code> to the server settings.
            </p>
          )}
          {devLoginEnabled && (
            <form action={devSignIn} className="space-y-3 rounded-lg border border-dashed border-warning p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Development login (DEV_LOGIN=true)
              </p>
              <Input name="email" type="email" required placeholder="you@demo.local" defaultValue="admin@demo.local" />
              <Input name="name" placeholder="Display name (optional)" />
              <Button type="submit" variant="secondary" className="w-full">
                Sign in without Google
              </Button>
            </form>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Only company domain accounts are permitted. Your employee ID is assigned automatically on first sign-in.
          </p>
        </div>
      </section>
    </main>
  );
}
