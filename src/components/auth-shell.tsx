import { Building2, CheckCircle2, ListChecks, MapPin, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  { icon: MapPin, title: "Location-verified check-in", text: "Every check-in is matched against the office location." },
  { icon: ListChecks, title: "Daily task tracking", text: "Log tasks, hours and progress, then send your end-of-day report." },
  { icon: ShieldCheck, title: "Live team overview", text: "See who's in at a glance and export payroll in one click." },
];

/** Soft floating colour orbs behind the sign-in pages. */
function Orbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-24 top-10 size-96 animate-float rounded-full bg-[oklch(0.86_0.09_290)] opacity-50 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 size-80 animate-float rounded-full bg-[oklch(0.9_0.08_45)] opacity-60 blur-3xl [animation-delay:-5s]" />
      <div className="absolute right-0 top-1/3 size-72 animate-float rounded-full bg-[oklch(0.9_0.07_350)] opacity-45 blur-3xl [animation-delay:-9s]" />
    </div>
  );
}

/** A small, static preview of what a check-in looks like. */
function PreviewCard() {
  return (
    <div className="glass w-72 rotate-[-2deg] rounded-2xl p-4 shadow-lift ring-1 ring-white/80">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">Checked in · 08:52 AM</p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <Building2 className="size-3" /> Head Office · 12 m away
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Today&apos;s progress</span>
          <span className="font-semibold text-foreground">72%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[72%] rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

/** Two-column frame shared by the sign-in and account-setup pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      <Orbs />
      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <Brand size="lg" />
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="max-w-lg text-5xl font-bold leading-[1.08] tracking-tight">
              Your team&apos;s day, <span className="text-brand">beautifully organised.</span>
            </h2>
            <p className="max-w-md text-lg text-muted-foreground">
              Attendance, tasks and daily reports in one calm, simple place.
            </p>
          </div>
          <div className="flex items-end gap-8">
            <ul className="max-w-sm flex-1 space-y-4">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-0.5 h-fit rounded-xl bg-white/80 p-2 text-primary shadow-soft ring-1 ring-border/60">
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden xl:block">
              <PreviewCard />
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} WorkTrack</p>
      </section>

      <section className="relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand size="lg" />
          </div>
          <div className="glass space-y-6 rounded-3xl p-6 shadow-lift ring-1 ring-white/80 sm:p-8">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
