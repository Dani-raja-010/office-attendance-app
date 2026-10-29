import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportButtons({
  dataset,
  from,
  to,
  label,
}: {
  dataset: "attendance" | "reports" | "tasks";
  from: string;
  to: string;
  label?: string;
}) {
  const prefix = label ? `${label} ` : "";
  const base = `/api/admin/export?dataset=${dataset}&from=${from}&to=${to}`;
  return (
    <>
      <Button asChild variant="outline">
        <a href={`${base}&format=csv`} download>
          <Download /> {prefix}CSV
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={`${base}&format=xlsx`} download>
          <FileSpreadsheet /> {prefix}Excel
        </a>
      </Button>
    </>
  );
}
