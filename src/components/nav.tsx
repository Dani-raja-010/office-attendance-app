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
        "relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_oklch,var(--primary)_25%,transparent)]"
          : "text-sidebar-muted hover:bg-white/[0.05] hover:text-sidebar-foreground",
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute -left-3 top-1/2 hidden h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_12px_var(--primary)] lg:block"
        />
      )}
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

function SectionLabel({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return (
    <p
      className={cn(
        "hidden px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-muted/80 lg:block",
        first ? "pt-1" : "pt-6",
      )}
    >
      {children}
    </p>
  );
}

export function Nav({ isAdmin }: { isAdmin: boolean }) {
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      <SectionLabel first>{"// Workspace"}</SectionLabel>
      {employeeLinks.map((l) => (
        <NavLink key={l.href} {...l} />
      ))}
      {isAdmin && (
        <>
          <SectionLabel>{"// Command"}</SectionLabel>
          {adminLinks.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
        </>
      )}
    </nav>
  );
}
