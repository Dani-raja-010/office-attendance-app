import { MapPin, ListChecks, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";

const features = [
  { icon: MapPin, title: "GPS-verified check-in", text: "Every check-in is validated on the server against the office geofence." },
  { icon: ListChecks, title: "Daily task tracking", text: "Log tasks, hours and progress, then file your end-of-day report." },
  { icon: ShieldCheck, title: "Live command view", text: "Real-time presence counts and one-click payroll exports." },
];

/** Decorative radar: concentric rings with a rotating sweep. */
function Radar() {
  return (
    <div aria-hidden className="pointer-events-none absolute -right-72 top-1/2 size-[640px] -translate-y-1/2 opacity-60">
      {[1, 0.78, 0.56, 0.34].map((s) => (
        <div
          key={s}
          className="absolute inset-0 m-auto rounded-full border border-primary/15"
          style={{ width: `${s * 100}%`, height: `${s * 100}%` }}
        />
      ))}
      <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,color-mix(in_oklch,var(--primary)_28%,transparent)_40deg,transparent_70deg)]" />
      <div className="absolute left-[38%] top-[30%] size-2 animate-blink rounded-full bg-primary shadow-[0_0_14px_var(--primary)]" />
      <div className="absolute left-[62%] top-[58%] size-1.5 animate-blink rounded-full bg-glow-2 shadow-[0_0_14px_var(--glow-2)] [animation-delay:0.8s]" />
      <div className="absolute left-[46%] top-[70%] size-1.5 animate-blink rounded-full bg-success shadow-[0_0_14px_var(--success)] [animation-delay:1.4s]" />
    </div>
  );
}

/** Two-column frame shared by the sign-in and account-setup pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <Radar />
        <Brand size="lg" className="relative" />
        <div className="relative space-y-10">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">{"// Attendance OS"}</p>
            <h2 className="max-w-md text-5xl font-semibold leading-[1.05] tracking-tight">
              Presence, progress, <span className="text-brand">in real time.</span>
            </h2>
          </div>
          <ul className="max-w-md space-y-3">
            {features.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="glass flex gap-3 rounded-xl border border-white/[0.08] p-3.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.05)]"
              >
                <span className="mt-0.5 h-fit rounded-lg bg-primary/10 p-2 text-primary ring-1 ring-primary/25">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} WorkTrack · Secure session
        </p>
      </section>

      <section className="relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Brand size="lg" />
          </div>
          <div className="glass relative space-y-6 rounded-3xl border border-white/[0.09] p-6 shadow-[inset_0_1px_0_0_oklch(1_0_0/0.07),0_40px_80px_-40px_oklch(0_0_0/0.9)] sm:p-8">
            <span
              aria-hidden
              className="absolute inset-x-10 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
