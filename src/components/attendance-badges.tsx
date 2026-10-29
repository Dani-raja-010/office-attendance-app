import { AlertTriangle, Building2, Home, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FLAG_LABELS } from "@/lib/utils";

export function StatusBadge({ status }: { status: "present" | "late" | "absent" }) {
  if (status === "late") return <Badge variant="warning">Late</Badge>;
  if (status === "absent") return <Badge variant="destructive">Absent</Badge>;
  return <Badge variant="success">On time</Badge>;
}

export function LocationBadge({ type }: { type: "office" | "remote" | "unverified" | null }) {
  if (type === "office")
    return (
      <Badge variant="default">
        <Building2 /> Office
      </Badge>
    );
  if (type === "remote")
    return (
      <Badge variant="secondary">
        <Home /> Remote
      </Badge>
    );
  return (
    <Badge variant="outline">
      <HelpCircle /> Unverified
    </Badge>
  );
}

export function FlagBadges({ flags }: { flags: string[] }) {
  if (flags.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((f) => (
        <Badge key={f} variant="destructive" title={FLAG_LABELS[f] ?? f}>
          <AlertTriangle /> {FLAG_LABELS[f] ?? f}
        </Badge>
      ))}
    </div>
  );
}
