"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Re-fetches server data on an interval so admin counts stay live. */
export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [updatedAt, setUpdatedAt] = useState<string>("");

  useEffect(() => {
    const stamp = () => setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    stamp();
    const id = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      startTransition(() => router.refresh());
      stamp();
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      Live · updated {updatedAt}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        aria-label="Refresh now"
        onClick={() => {
          startTransition(() => router.refresh());
          setUpdatedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        }}
      >
        <RefreshCw className={pending ? "animate-spin" : ""} />
      </Button>
    </div>
  );
}
