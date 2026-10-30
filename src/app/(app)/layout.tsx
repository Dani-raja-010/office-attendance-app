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
      <aside className="sticky top-0 z-20 border-b border-white/[0.08] bg-sidebar p-3 text-sidebar-foreground backdrop-blur-xl lg:h-screen lg:border-b-0 lg:bg-transparent lg:p-3 lg:backdrop-blur-none">
        <div className="flex h-full flex-col gap-3 lg:glass lg:gap-6 lg:rounded-2xl lg:border lg:border-white/[0.08] lg:p-4 lg:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.06)]">
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
          <div className="hidden items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 lg:flex">
            <Avatar name={user.name} image={user.image} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{user.name}</span>
                {user.role === "admin" && (
                  <span className="shrink-0 rounded border border-glow-2/40 px-1 font-mono text-[9px] tracking-wider text-glow-2">
                    ADMIN
                  </span>
                )}
              </p>
              <p className="truncate font-mono text-[11px] tracking-wider text-primary/80">{user.employee_id}</p>
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
