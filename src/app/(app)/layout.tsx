import { CalendarCheck, LogOut } from "lucide-react";
import { Nav } from "@/components/nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { signOutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="sticky top-0 z-20 flex flex-col gap-3 bg-sidebar p-3 text-sidebar-foreground lg:h-screen lg:gap-6 lg:p-4">
        <div className="flex items-center justify-between gap-2 px-2 pt-1">
          <div className="flex items-center gap-2 text-base font-semibold text-white">
            <CalendarCheck className="size-5" /> WorkTrack
          </div>
          <form action={signOutAction} className="lg:hidden">
            <Button size="sm" variant="ghost" className="text-sidebar-muted hover:bg-sidebar-accent hover:text-white">
              <LogOut /> Sign out
            </Button>
          </form>
        </div>
        <div className="lg:flex-1">
          <Nav isAdmin={user.role === "admin"} />
        </div>
        <div className="hidden items-center gap-3 rounded-lg bg-sidebar-accent/60 p-3 lg:flex">
          <Avatar name={user.name} image={user.image} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate font-mono text-xs text-sidebar-muted">{user.employee_id}</p>
          </div>
          <form action={signOutAction}>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Sign out"
              className="size-8 text-sidebar-muted hover:bg-sidebar-accent hover:text-white"
            >
              <LogOut />
            </Button>
          </form>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
