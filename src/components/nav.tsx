"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  ShieldCheck,
  Users,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";

const employeeLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "My Tasks", icon: ListChecks },
  { href: "/report", label: "EOD Report", icon: FileText },
  { href: "/history", label: "Attendance History", icon: History },
];

const adminLinks = [
  { href: "/admin", label: "Live Overview", icon: ShieldCheck },
  { href: "/admin/attendance", label: "Attendance Records", icon: CalendarCheck },
  { href: "/admin/reports", label: "Reports & Tasks", icon: ClipboardList },
  { href: "/admin/employees", label: "Employees", icon: Users },
];

function NavLink({ href, label, icon: Icon }: (typeof employeeLinks)[number]) {
  const pathname = usePathname();
  const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-white"
          : "text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
      )}
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      <p className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted lg:block">
        Workspace
      </p>
      {employeeLinks.map((l) => (
        <NavLink key={l.href} {...l} />
      ))}
      {isAdmin && (
        <>
          <p className="hidden px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-muted lg:block">
            Administration
          </p>
          {adminLinks.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </>
      )}
    </nav>
  );
}
