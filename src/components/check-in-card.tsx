"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { LoaderCircle, LogIn, LogOut, MapPin, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkIn, checkOut, type GeoInput } from "@/app/actions/attendance";

type Props = {
  state: "none" | "checked_in" | "checked_out";
  officeName: string;
  shiftStart: string;
  summary: { checkIn: string; checkOut: string; worked: string } | null;
  children?: React.ReactNode;
};

/** Stop sampling as soon as a fix is at least this precise (metres). */
const TARGET_ACCURACY_M = 20;
/** Longest time to keep sampling for a better fix. */
const MAX_SAMPLING_MS = 15_000;

/**
 * Watches the position for a few seconds and resolves with the most precise fix.
 * The first fix a device reports is often a coarse Wi-Fi/IP estimate; GPS
 * usually tightens it within seconds. onFix reports each improvement.
 */
function getBestPosition(onFix: (accuracy: number) => void): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser does not support location services."));
      return;
    }
    let best: GeolocationPosition | null = null;
    let lastError: GeolocationPositionError | null = null;
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timer);
      if (best) resolve(best);
      else reject(lastError ?? new Error("Timed out getting your location. Please try again."));
    };

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (!best || pos.coords.accuracy < best.coords.accuracy) {
          best = pos;
          onFix(pos.coords.accuracy);
        }
        if (pos.coords.accuracy <= TARGET_ACCURACY_M) finish();
      },
      (err) => {
        lastError = err;
        if (err.code === err.PERMISSION_DENIED) finish();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: MAX_SAMPLING_MS },
    );
    const timer = setTimeout(finish, MAX_SAMPLING_MS);
  });
}

function geoErrorMessage(err: unknown): string {
  if (typeof GeolocationPositionError !== "undefined" && err instanceof GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) return "Location permission denied. Allow location access to mark attendance.";
    if (err.code === err.TIMEOUT) return "Timed out getting your location. Please try again.";
    return "Your location is unavailable. Check your device's location settings.";
  }
  return err instanceof Error ? err.message : "Unable to read your location.";
}

function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="text-center">
      <div className="text-4xl font-bold tabular-nums tracking-tight">
        {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        {now ? now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" }) : " "}
      </div>
    </div>
  );
}

/** Large round action button with a pulsing halo, and a spinning scanner ring while busy. */
function OrbButton({
  tone,
  busy,
  disabled,
  onClick,
  icon: Icon,
  label,
  busyLabel,
}: {
  tone: "in" | "out";
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: typeof LogIn;
  label: string;
  busyLabel: string;
}) {
  const color = tone === "in" ? "var(--primary)" : "var(--destructive)";
  return (
    <div className="flex justify-center py-2">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-busy={busy}
        className="group relative size-44 rounded-full outline-none disabled:cursor-wait"
        style={{ "--orb": color } as React.CSSProperties}
      >
        {!busy && (
          <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full bg-[var(--orb)]/25" />
        )}
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 rounded-full p-[2px]",
            "bg-[conic-gradient(from_0deg,var(--orb),var(--accent-2),color-mix(in_oklch,var(--orb)_20%,transparent)_70%,var(--orb))]",
            busy ? "animate-spin-slow" : "opacity-80",
          )}
        >
          <span className="block size-full rounded-full bg-white" />
        </span>
        <span
          className={cn(
            "absolute inset-3 flex flex-col items-center justify-center gap-1.5 rounded-full transition-all duration-300",
            "bg-[radial-gradient(circle_at_50%_25%,color-mix(in_oklch,var(--orb)_12%,white),white_75%)]",
            "shadow-[0_14px_34px_-14px_color-mix(in_oklch,var(--orb)_70%,transparent),inset_0_-6px_14px_-8px_color-mix(in_oklch,var(--orb)_30%,transparent)]",
            "group-hover:scale-[1.03] group-focus-visible:ring-4 group-focus-visible:ring-[var(--orb)]/30",
          )}
        >
          {busy ? (
            <LoaderCircle className="size-7 animate-spin text-[var(--orb)]" />
          ) : (
            <Icon className="size-7 text-[var(--orb)]" />
          )}
          <span className="text-base font-bold">{busy ? "Locating" : label}</span>
          {busy && <span className="max-w-28 text-center text-[10px] leading-tight text-muted-foreground">{busyLabel}</span>}
        </span>
      </button>
    </div>
  );
}

export function CheckInCard({ state, officeName, shiftStart, summary, children }: Props) {
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "locating" | "saving">("idle");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  function handle(kind: "in" | "out") {
    startTransition(async () => {
      try {
        setPhase("locating");
        setAccuracy(null);
        const pos = await getBestPosition(setAccuracy);
        setPhase("saving");
        const input: GeoInput = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null,
          positionTimestamp: pos.timestamp,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
        };
        const result = kind === "in" ? await checkIn(input) : await checkOut(input);
        if (result.ok) toast.success(result.message);
        else toast.error(result.error);
      } catch (err) {
        toast.error(geoErrorMessage(err));
      } finally {
        setPhase("idle");
      }
    });
  }

  const busyLabel =
    phase === "locating"
      ? accuracy == null
        ? "Finding your location…"
        : `Refining… ±${Math.round(accuracy)} m`
      : "Saving…";

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-4 text-primary" /> Attendance
        </CardTitle>
        <CardDescription>
          {officeName} · Shift starts {shiftStart}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <LiveClock />

        {summary && (
          <dl className="grid grid-cols-3 divide-x divide-border rounded-2xl bg-muted/70 py-3 text-center text-sm ring-1 ring-border/60">
            {[
              ["Check in", summary.checkIn],
              ["Check out", summary.checkOut],
              ["Worked", summary.worked],
            ].map(([label, value]) => (
              <div key={label} className="px-2">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {children}

        {state === "none" && (
          <OrbButton
            tone="in"
            icon={LogIn}
            label="Check in"
            busy={pending}
            busyLabel={busyLabel}
            disabled={pending}
            onClick={() => handle("in")}
          />
        )}
        {state === "checked_in" && (
          <OrbButton
            tone="out"
            icon={LogOut}
            label="Check out"
            busy={pending}
            busyLabel={busyLabel}
            disabled={pending}
            onClick={() => handle("out")}
          />
        )}
        {state === "checked_out" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 p-3 text-sm font-medium text-[color-mix(in_oklch,var(--success),black_15%)]">
            <CheckCircle2 className="size-4" /> Attendance completed for today
          </div>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Your location is captured only when you check in or out, and verified on the server. For best precision,
          use your phone with location set to <em>Precise</em>.
        </p>
      </CardContent>
    </Card>
  );
}
