"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/form";
import { updateEmployee } from "@/app/actions/admin";
import { SetupCodeButton } from "@/components/allowed-emails";

export function EmployeeActions({
  userId,
  email,
  role,
  isActive,
  isSelf,
}: {
  userId: string;
  email: string;
  role: "employee" | "admin";
  isActive: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run(input: { role?: "employee" | "admin"; is_active?: boolean }) {
    startTransition(async () => {
      const res = await updateEmployee(userId, input);
      if (res.ok) toast.success(res.message);
      else toast.error(res.error);
    });
  }

  if (isSelf) return <span className="text-xs text-muted-foreground">You</span>;

  return (
    <div className="flex items-center justify-end gap-2">
      <SetupCodeButton email={email} label="Reset password" />
      <Select
        aria-label="Role"
        value={role}
        disabled={pending}
        onChange={(e) => run({ role: e.target.value as "employee" | "admin" })}
        className="h-8 w-36"
      >
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </Select>
      <Button
        size="sm"
        variant={isActive ? "outline" : "success"}
        disabled={pending}
        onClick={() => {
          if (isActive && !confirm("Deactivate this employee? They will no longer be able to sign in.")) return;
          run({ is_active: !isActive });
        }}
      >
        {isActive ? "Deactivate" : "Activate"}
      </Button>
    </div>
  );
}
