import Link from "next/link";

import { getAuthState, routeForRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/", label: "Главная" },
  { href: "/operators", label: "Операторы" },
  { href: "/verify/QR-HJ-ERLAN-2026", label: "Проверка QR" },
  { href: "/cabinet/dashboard", label: "Кабинет" },
  { href: "/crm/dashboard", label: "CRM" },
]

export async function SiteHeader() {
  const auth = await getAuthState();
  const dashboardHref = auth.role ? routeForRole(auth.role) : "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 font-display text-lg text-primary">
            HC
          </div>
          <div>
            <p className="text-lg font-semibold">HajjCRM</p>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Kazakhstan Operator Suite</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-muted-foreground lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/operators">
            <Button variant="outline" size="sm">
              Найти оператора
            </Button>
          </Link>
          <Link href={dashboardHref} className="hidden sm:block">
            <Button size="sm">{auth.isAuthenticated ? "Открыть кабинет" : "Войти"}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
