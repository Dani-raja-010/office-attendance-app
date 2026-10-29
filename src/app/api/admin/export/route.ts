import type { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { buildDataset, toCsv, toXlsx, type Dataset } from "@/lib/export";
import { isDateStr, officeDate, shiftDate } from "@/lib/time";

const DATASETS: Dataset[] = ["attendance", "reports", "tasks"];

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const params = request.nextUrl.searchParams;
  const dataset = params.get("dataset") as Dataset;
  const format = params.get("format") === "xlsx" ? "xlsx" : "csv";
  if (!DATASETS.includes(dataset)) return Response.json({ error: "Unknown dataset" }, { status: 400 });

  const today = officeDate();
  const to = isDateStr(params.get("to")) ? params.get("to")! : today;
  const from = isDateStr(params.get("from")) ? params.get("from")! : to;
  if (from > to) return Response.json({ error: "'from' must be before 'to'" }, { status: 400 });
  if (from < shiftDate(to, -366)) return Response.json({ error: "Range cannot exceed one year" }, { status: 400 });

  const sheet = await buildDataset(dataset, from, to);
  const filename = `${dataset}_${from}${from === to ? "" : `_to_${to}`}.${format}`;
  const headers = {
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  };

  if (format === "xlsx") {
    const buffer = await toXlsx(sheet);
    return new Response(buffer, {
      headers: { ...headers, "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    });
  }
  return new Response(toCsv(sheet), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
}
