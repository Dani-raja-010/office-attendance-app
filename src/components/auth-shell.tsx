import { CalendarCheck, MapPin, ListChecks, ShieldCheck } from "lucide-react";

const features = [
  { icon: MapPin, title: "GPS-verified check-in", text: "Location is validated on the server against the office geofence." },
  { icon: ListChecks, title: "Daily task tracking", text: "Log tasks, hours and progress, then submit your end-of-day report." },
  { icon: ShieldCheck, title: "Live admin oversight", text: "Real-time presence counts and one-click payroll exports." },
];

/** Two-column frame shared by the sign-in and account-setup pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
