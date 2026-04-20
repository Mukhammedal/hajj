import Link from "next/link";

import { getAuthState, routeForRole } from "@/lib/auth";
import { HijriPill, RuKzToggle } from "@/components/shell/primitives";
import { cn } from "@/lib/utils";

export interface PublicTopbarLink {
  href: string;
  label: string;
}

interface PublicTopbarProps {
  activeHref?: string | null;
  cta?:
    | {
        href: string;
        label: string;
        variant?: "dark" | "ghost";
      }
    | null;
  links?: PublicTopbarLink[];
}

const defaultLinks: PublicTopbarLink[] = [
  { href: "/operators", label: "Операторы" },
  { href: "/#how-it-works", label: "Как это работает" },
  { href: "/verify/QR-HJ-2026-ERLAN-A4", label: "Проверить договор" },
  { href: "/register", label: "Для компаний" },
];

export async function PublicTopbar({ activeHref, cta, links = defaultLinks }: PublicTopbarProps) {
  const auth = await getAuthState();
  const defaultCta = auth.isAuthenticated && auth.role
    ? { href: routeForRole(auth.role), label: "Кабинет", variant: "dark" as const }
    : { href: "/login", label: "Войти", variant: "dark" as const };
  const resolvedCta = cta === undefined ? defaultCta : cta;

  return (
    <header className="topbar">
      <Link className="logo" href="/">
        <span className="logo-mark em">h</span>HajjCRM
      </Link>
      {links.length ? (
        <nav className="nav-links">
          {links.map((link) => (
            <Link key={link.href} className={cn(activeHref === link.href && "on")} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      ) : null}
      <div className="topbar-right">
        <HijriPill />
        <RuKzToggle active="RU" />
        {resolvedCta ? (
          <Link className={cn("btn btn-sm", resolvedCta.variant === "ghost" ? "btn-ghost" : "btn-dark")} href={resolvedCta.href}>
            {resolvedCta.label}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
