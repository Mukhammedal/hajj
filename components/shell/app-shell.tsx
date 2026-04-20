"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, ShieldCheck } from "lucide-react";

import { SignOutButton } from "@/components/shell/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  roleLabel: string;
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: ReactNode;
}

const roleIcons = {
  pilgrim: LayoutDashboard,
  operator: Building2,
  admin: ShieldCheck,
};

export function AppShell({ roleLabel, title, subtitle, navItems, children }: AppShellProps) {
  const pathname = usePathname();
  const RoleIcon = roleIcons[roleLabel as keyof typeof roleIcons] ?? LayoutDashboard;

  return (
    <div className="page-wrap">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="shell-panel flex flex-col gap-6 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-primary/20 bg-primary/10 text-primary">
              <RoleIcon className="h-7 w-7" />
            </div>
            <div>
              <Badge variant="muted" className="mb-2">
                {roleLabel === "pilgrim" ? "Кабинет паломника" : roleLabel === "operator" ? "CRM оператора" : "Админ"}
              </Badge>
              <h1 className="text-3xl">{title}</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{subtitle}</p>
            </div>
          </div>

          <nav className="grid gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm transition-colors",
                    isActive
                      ? "border-primary/35 bg-primary/10 text-foreground"
                      : "border-white/8 bg-white/5 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto subtle-panel p-4">
            <p className="text-sm font-semibold text-foreground">Mobile-first workflow</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Все разделы собраны так, чтобы оператор мог вести паломников с телефона: быстро открывать карточки, фильтры и
              квоты без лишних переходов.
            </p>
            <div className="mt-4">
              <SignOutButton />
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-col gap-6">{children}</main>
      </div>
    </div>
  );
}
