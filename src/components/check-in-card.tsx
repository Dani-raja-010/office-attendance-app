"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { LoaderCircle, LogIn, LogOut, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { checkIn, checkOut, type GeoInput } from "@/app/actions/attendance";

type Props = {
  state: "none" | "checked_in" | "checked_out";
  officeName: string;
  shiftStart: string;
  summary: { checkIn: string; checkOut: string; worked: string } | null;
  children?: React.ReactNode;
};

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Your browser does not support location services."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20_000,
      maximumAge: 0,
    });
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
    <div className="font-mono text-4xl font-semibold tabular-nums tracking-tight">
      {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
    </div>
  );
}

export function CheckInCard({ state, officeName, shiftStart, summary, children }: Props) {
  const [pending, startTransition] = useTransition();
  const [phase, setPhase] = useState<"idle" | "locating" | "saving">("idle");

  function handle(kind: "in" | "out") {
    startTransition(async () => {
      try {
        setPhase("locating");
        const pos = await getPosition();
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

  const busyLabel = phase === "locating" ? "Getting your location…" : "Saving…";

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
          <dl className="grid grid-cols-3 gap-3 rounded-lg bg-muted/60 p-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Check in</dt>
              <dd className="font-medium">{summary.checkIn}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Check out</dt>
              <dd className="font-medium">{summary.checkOut}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Worked</dt>
              <dd className="font-medium">{summary.worked}</dd>
            </div>
          </dl>
        )}

        {children}

        {state === "none" && (
          <Button size="lg" className="w-full" disabled={pending} onClick={() => handle("in")}>
            {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />}
            {pending ? busyLabel : "Check in"}
          </Button>
        )}
        {state === "checked_in" && (
          <Button size="lg" variant="destructive" className="w-full" disabled={pending} onClick={() => handle("out")}>
            {pending ? <LoaderCircle className="animate-spin" /> : <LogOut />}
            {pending ? busyLabel : "Check out"}
          </Button>
        )}
        {state === "checked_out" && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-success/30 bg-success/10 p-3 text-sm font-medium text-success">
            <CheckCircle2 className="size-4" /> Attendance completed for today
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Your GPS location is captured only when you check in or out, and is verified on the server.
        </p>
      </CardContent>
    </Card>
  );
}
