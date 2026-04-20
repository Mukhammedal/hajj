"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { RoleShell, type ShellNavGroup } from "@/components/shell/role-shell";

const compactNav: ShellNavGroup[] = [
  {
    items: [
      { count: "8", href: "/admin/operators", label: "Операторы" },
      { href: "/admin/analytics", label: "Аналитика" },
      { href: "/admin/export", label: "Экспорт данных" },
    ],
  },
  {
    label: "Каталог",
    items: [
      { href: "/admin/hotels/new", label: "+ Добавить отель" },
    ],
  },
  {
    label: "Аккаунт",
    items: [
      { href: "/admin/profile", label: "Мой профиль" },
      { href: "/admin/profile#security", label: "Безопасность" },
    ],
  },
];

const extendedNav: ShellNavGroup[] = [
  {
    items: [
      { count: "47", href: "/admin/operators", label: "Операторы" },
      { href: "/admin/analytics", label: "Аналитика" },
      { href: "/admin/export", label: "Экспорт данных" },
    ],
  },
  {
    label: "Каталог",
    items: [
      { href: "/admin/hotels/new", label: "+ Добавить отель" },
      { href: "/hotels/hilton-suites-makkah", label: "Публичный отель" },
    ],
  },
  {
    label: "Аккаунт",
    items: [
      { href: "/admin/profile", label: "Мой профиль" },
      { href: "/admin/profile#security", label: "Безопасность" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useExtendedNav =
    pathname.startsWith("/admin/export") || pathname.startsWith("/admin/hotels") || pathname.startsWith("/admin/profile");
  const avatar =
    pathname.startsWith("/admin/profile") || pathname.startsWith("/admin/export")
      ? { background: "var(--gold-deep)", initials: "АД", subtitle: "Super Admin", title: "Алихан Д." }
      : pathname.startsWith("/admin/hotels")
        ? { background: "var(--gold-deep)", initials: "А", subtitle: "hello@hajjcrm.kz", title: "Админ платформы" }
        : { background: "var(--gold-deep)", initials: "АД", subtitle: "Админ", title: "Платформа" };

  return (
    <RoleShell
      avatar={avatar}
      navGroups={useExtendedNav ? extendedNav : compactNav}
      roleClassName="pill-admin"
      roleLabel="● ADMIN"
    >
      {children}
    </RoleShell>
  );
}
