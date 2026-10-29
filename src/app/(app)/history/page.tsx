import type { Metadata } from "next";
import { CalendarCheck, Clock, AlarmClock, Home } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { FlagBadges, LocationBadge, StatusBadge } from "@/components/attendance-badges";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/session";
import { listUserAttendance } from "@/lib/attendance";
import { durationHours, formatDate, formatHours, formatTime } from "@/lib/time";
import { formatDistance, mapsUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Attendance History" };

export default async function HistoryPage() {
  const user = await requireUser();
  const records = await listUserAttendance(user.id, 60);

  const totalHours = records.reduce((s, r) => s + (durationHours(r.check_in_time, r.check_out_time) ?? 0), 0);
  const late = records.filter((r) => r.status === "late").length;
  const remote = records.filter((r) => r.check_in_location_type === "remote").length;

  return (
    <>
      <PageHeader title="Attendance history" description="Your last 60 attendance records" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Days present" value={records.length} icon={CalendarCheck} />
        <StatCard label="Hours worked" value={formatHours(totalHours)} icon={Clock} tone="success" />
        <StatCard label="Late arrivals" value={late} icon={AlarmClock} tone="warning" />
        <StatCard label="Remote days" value={remote} icon={Home} tone="muted" />
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          {records.length === 0 ? (
            <div className="p-5">
              <EmptyState>No attendance records yet.</EmptyState>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check in</TableHead>
                  <TableHead>Check out</TableHead>
                  <TableHead>Worked</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((r) => {
                  const inMap = mapsUrl(r.check_in_lat, r.check_in_lng);
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{formatDate(r.date)}</TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell>{formatTime(r.check_in_time)}</TableCell>
                      <TableCell>{formatTime(r.check_out_time)}</TableCell>
                      <TableCell>{formatHours(durationHours(r.check_in_time, r.check_out_time))}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LocationBadge type={r.check_in_location_type} />
                          {inMap && (
                            <a href={inMap} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                              {formatDistance(r.check_in_distance_m)}
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <FlagBadges flags={r.flags} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
