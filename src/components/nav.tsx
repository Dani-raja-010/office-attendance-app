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
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-white text-primary shadow-soft ring-1 ring-border/70"
          : "text-sidebar-muted hover:bg-white/60 hover:text-sidebar-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-lg transition-colors",
          active ? "bg-brand text-primary-foreground" : "bg-transparent",
        )}
      >
        <Icon className="size-4" />
      </span>
      {label}
    </Link>
  );
}

function SectionLabel({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <p className={cn("hidden px-3 pb-1.5 text-xs font-semibold text-sidebar-muted/80 lg:block", first ? "pt-1" : "pt-6")}>
      {children}
    </p>
  );
}

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      <SectionLabel first>Workspace</SectionLabel>
      {employeeLinks.map((l) => (
        <NavLink key={l.href} {...l} />
      ))}
      {isAdmin && (
        <>
          <SectionLabel>Administration</SectionLabel>
          {adminLinks.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </>
      )}
    </nav>
  );
}
