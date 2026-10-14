"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Building2, CircleDollarSign, Command, Compass, LogOut, MapPinned, Menu, Percent, Settings2, Upload, X } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, Drawer, IconButton, ThemeToggle, useToast } from "@/components/ui";
import { ChatWidget } from "@/components/features/ChatWidget";

const navigation = [
  { href: "/dashboard", label: "Overview", short: "Dashboard", icon: BarChart3 },
  { href: "/gccs", label: "GCC directory", short: "GCCs", icon: Building2 },
  { href: "/cities", label: "Cities", short: "Cities", icon: MapPinned },
  { href: "/recommend", label: "Compare & recommend", short: "Recommend", icon: Compass },
  { href: "/providers", label: "Providers", short: "Providers", icon: CircleDollarSign },
  { href: "/incentives", label: "State incentives", short: "Incentives", icon: Percent },
  { href: "/upload", label: "Upload", short: "Upload", icon: Upload },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    apiFetch<User>("auth/me").then((current) => { if (!cancelled) setUser(current); }).catch(() => { if (!cancelled) setUser(null); });
    return () => { cancelled = true; };
  }, [pathname]);

  async function signOut() {
    try {
      await apiFetch<void>("auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not sign out", "error");
    }
  }

  const currentPage = navigation.find((item) => pathname.startsWith(item.href))?.label ?? "Workspace";
  return <div className="app-grain flex min-h-dvh bg-paper text-ink">
    <aside className={cn("hidden shrink-0 flex-col border-r border-line bg-paper/75 transition-[width] lg:flex", collapsed ? "w-[76px]" : "w-[248px]")}>
      <div className={cn("flex h-[76px] items-center border-b border-line", collapsed ? "justify-center" : "justify-between px-5")}>
        <Link href="/dashboard" aria-label="GCC Intelligence India home" className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-panel bg-accent text-white"><Command size={20} /></span>{!collapsed && <span><span className="block font-display text-lg leading-5">GCC Intel</span><span className="text-[10px] uppercase tracking-[0.12em] text-muted">India / intelligence</span></span>}</Link>
        <IconButton label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("size-9", collapsed && "absolute left-[60px] top-5 z-10 border border-line bg-paper")} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <Menu size={17} /> : <X size={17} />}</IconButton>
      </div>
      <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-5">{!collapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Workspace</p>}{navigation.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return <Link key={href} href={href} aria-label={collapsed ? label : undefined} aria-current={active ? "page" : undefined} className={cn("flex min-h-11 items-center gap-3 rounded-panel px-3 text-sm transition-colors", active ? "bg-accent-soft font-semibold text-accent-deep" : "text-muted hover:bg-accent-soft/70 hover:text-ink", collapsed && "justify-center px-0")}><Icon size={18} />{!collapsed && label}</Link>;
      })}</nav>
      {user && <Link href="/settings" className={cn("flex min-h-14 items-center gap-3 border-t border-line p-3 hover:bg-accent-soft", collapsed && "justify-center")}><Avatar name={user.name} size="sm" />{!collapsed && <span className="min-w-0"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="block truncate text-xs text-muted">{user.role.replaceAll("_", " ")}</span></span>}</Link>}
    </aside>
    <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
      <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-line bg-paper/90 px-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="flex items-center gap-2"><IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu size={20} /></IconButton><div className="hidden sm:block"><p className="text-xs uppercase tracking-[0.12em] text-muted">India capability map</p><p className="text-sm font-semibold">{currentPage}</p></div><span className="font-display text-lg sm:hidden">GCC Intel</span></div>
        <div className="flex items-center gap-1 sm:gap-2"><ThemeToggle /><IconButton label="Sign out" onClick={() => void signOut()}><LogOut size={18} /></IconButton></div>
      </header>
      <main id="main-content" className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:px-9 lg:pb-10">{children}</main>
      <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-paper/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">{navigation.filter((item) => item.href !== "/providers" && item.href !== "/incentives").map(({ href, short, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[10px]", active ? "text-accent-deep" : "text-muted")}><Icon size={18} /><span>{short}</span></Link>;
      })}</nav>
    </div>
    <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} title="Navigation" side="left"><nav className="grid gap-1">{navigation.map(({ href, label, icon: Icon }) => <Link onClick={() => setMobileOpen(false)} key={href} href={href} className="flex min-h-12 items-center gap-3 px-3 hover:bg-accent-soft"><Icon size={18} />{label}</Link>)}<Link href="/settings" onClick={() => setMobileOpen(false)} className="flex min-h-12 items-center gap-3 px-3 hover:bg-accent-soft"><Settings2 size={18} />Settings</Link></nav></Drawer>
    <ChatWidget />
  </div>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}