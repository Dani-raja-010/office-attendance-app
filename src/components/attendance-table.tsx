import { ExternalLink } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FlagBadges, LocationBadge, StatusBadge } from "@/components/attendance-badges";
import type { AttendanceWithUser } from "@/lib/attendance";
import { durationHours, formatDate, formatHours, formatTime } from "@/lib/time";
import { formatDistance, mapsUrl } from "@/lib/utils";

function MapLink({ lat, lng, distance }: { lat: number | null; lng: number | null; distance: number | null }) {
  const url = mapsUrl(lat, lng);
  if (!url) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      title={`${lat}, ${lng}`}
    >
      {formatDistance(distance)} <ExternalLink className="size-3" />
    </a>
  );
}

export function AttendanceTable({ records, showDate = false }: { records: AttendanceWithUser[]; showDate?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Employee</TableHead>
          {showDate && <TableHead>Date</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Check in</TableHead>
          <TableHead>In location</TableHead>
          <TableHead>Check out</TableHead>
          <TableHead>Out location</TableHead>
          <TableHead>Worked</TableHead>
          <TableHead>Verification</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((r) => (
          <TableRow key={r.id}>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar name={r.name} image={r.image} />
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{r.employee_id}</p>
                </div>
              </div>
            </TableCell>
            {showDate && <TableCell>{formatDate(r.date)}</TableCell>}
            <TableCell>
              <StatusBadge status={r.status} />
            </TableCell>
            <TableCell className="tabular-nums">{formatTime(r.check_in_time)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <LocationBadge type={r.check_in_location_type} />
                <MapLink lat={r.check_in_lat} lng={r.check_in_lng} distance={r.check_in_distance_m} />
              </div>
            </TableCell>
            <TableCell className="tabular-nums">{formatTime(r.check_out_time)}</TableCell>
            <TableCell>
              {r.check_out_time ? (
                <div className="flex items-center gap-2">
                  <LocationBadge type={r.check_out_location_type} />
                  <MapLink lat={r.check_out_lat} lng={r.check_out_lng} distance={r.check_out_distance_m} />
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="tabular-nums">
              {r.check_out_time ? formatHours(durationHours(r.check_in_time, r.check_out_time)) : "In progress"}
            </TableCell>
            <TableCell className="whitespace-normal">
              <FlagBadges flags={r.flags} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
