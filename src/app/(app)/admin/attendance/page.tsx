import type { Metadata } from "next";
import { PageHeader, EmptyState } from "@/components/page-header";
import { AttendanceTable } from "@/components/attendance-table";
import { ExportButtons } from "@/components/export-buttons";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { listAttendanceRange } from "@/lib/attendance";
import { isDateStr, officeDate, shiftDate } from "@/lib/time";

export const metadata: Metadata = { title: "Attendance Records" };

export default async function AdminAttendancePage({ searchParams }: PageProps<"/admin/attendance">) {
  const today = officeDate();
  const params = await searchParams;
  const to = isDateStr(params.to) ? params.to : today;
  let from = isDateStr(params.from) ? params.from : shiftDate(to, -6);
  if (from > to) from = to;
  if (from < shiftDate(to, -92)) from = shiftDate(to, -92); // cap at ~3 months per view
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : "";

  const records = await listAttendanceRange(from, to, q);

  return (
    <>
      <PageHeader title="Attendance records" description={`${records.length} records from ${from} to ${to}`}>
        <ExportButtons dataset="attendance" from={from} to={to} />
      </PageHeader>

      <Card className="py-4">
        <CardContent>
          <form className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" name="from" defaultValue={from} max={today} className="w-40" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" name="to" defaultValue={to} max={today} className="w-40" />
            </div>
            <div className="min-w-48 flex-1 space-y-1.5">
              <Label htmlFor="q">Employee</Label>
              <Input id="q" name="q" defaultValue={q} placeholder="Name, email or EMP-ID" />
            </div>
            <Button type="submit">Apply</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="px-0">
          {records.length === 0 ? (
            <div className="p-5">
              <EmptyState>No records match these filters.</EmptyState>
            </div>
          ) : (
            <AttendanceTable records={records} showDate />
          )}
        </CardContent>
      </Card>
    </>
  );
}
