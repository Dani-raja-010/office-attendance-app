import { LogOut } from "lucide-react";
import { Nav } from "@/components/nav";
import { Brand } from "@/components/brand";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/session";
import { signOutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 z-20 border-b border-border/70 bg-sidebar p-3 text-sidebar-foreground backdrop-blur-xl lg:h-screen lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="flex h-full flex-col gap-3 lg:glass lg:gap-6 lg:rounded-3xl lg:p-4 lg:shadow-soft lg:ring-1 lg:ring-border/60">
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <Brand />
            <form action={signOutAction} className="lg:hidden">
              <Button size="sm" variant="ghost">
                <LogOut /> Sign out
              </Button>
            </form>
          </div>
          <div className="lg:flex-1">
            <Nav isAdmin={user.role === "admin"} />
          </div>
          <div className="hidden items-center gap-3 rounded-2xl bg-white/70 p-3 shadow-soft ring-1 ring-border/60 lg:flex">
            <Avatar name={user.name} image={user.image} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="truncate">{user.name}</span>
                {user.role === "admin" && (
                  <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-semibold text-primary">
                    Admin
                  </span>
                )}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">{user.employee_id}</p>
            </div>
            <form action={signOutAction}>
              <Button size="icon" variant="ghost" aria-label="Sign out" className="size-8">
                <LogOut />
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
