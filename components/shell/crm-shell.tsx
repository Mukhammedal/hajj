"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { RoleShell, type ShellNavGroup } from "@/components/shell/role-shell";

const defaultNav: ShellNavGroup[] = [
  {
    items: [
      { href: "/crm/dashboard", label: "Обзор" },
      { count: "47", href: "/crm/pilgrims", label: "Паломники" },
      { count: "3", href: "/crm/groups", label: "Группы" },
      { href: "/crm/payments", label: "Платежи" },
      { href: "/crm/contracts", label: "Договоры и QR" },
    ],
  },
  {
    label: "Коммуникация",
    items: [
      { href: "/crm/notifications", label: "Уведомления" },
      { href: "/crm/whatsapp", label: "WhatsApp-бот" },
    ],
  },
  {
    label: "Аналитика",
    items: [
      { href: "/crm/analytics", label: "Дашборд" },
      { href: "/crm/reports", label: "Отчёты" },
    ],
  },
  {
    label: "Компания",
    items: [
      { href: "/crm/company", label: "Профиль" },
      { href: "/crm/settings", label: "Настройки" },
    ],
  },
];

const extendedNav: ShellNavGroup[] = [
  {
    items: [
      { href: "/crm/dashboard", label: "Обзор" },
      { href: "/crm/pilgrims", label: "Паломники" },
      { href: "/crm/groups", label: "Группы" },
      { href: "/crm/payments", label: "Платежи" },
      { href: "/crm/contracts", label: "Договоры и QR" },
    ],
  },
  {
    label: "Коммуникация",
    items: [
      { href: "/crm/notifications", label: "Уведомления" },
      { href: "/crm/sheets", label: "Google Sheets" },
      { href: "/crm/whatsapp", label: "WhatsApp-бот" },
      { href: "/crm/import/excel", label: "Импорт Excel" },
    ],
  },
  {
    label: "Аналитика",
    items: [
      { href: "/crm/analytics", label: "Дашборд" },
      { href: "/crm/reports", label: "Отчёты" },
    ],
  },
  {
    label: "Компания",
    items: [
      { href: "/crm/company", label: "Профиль" },
      { href: "/crm/team/bauyrzhan", label: "Команда" },
      { href: "/crm/settings", label: "Настройки" },
    ],
  },
];

export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const useExtendedNav =
    pathname.startsWith("/crm/company") ||
    pathname.startsWith("/crm/contracts") ||
    pathname.startsWith("/crm/import") ||
    pathname.startsWith("/crm/reports") ||
    pathname.startsWith("/crm/settings") ||
    pathname.startsWith("/crm/sheets") ||
    pathname.startsWith("/crm/team") ||
    pathname.startsWith("/crm/whatsapp");

  return (
    <RoleShell
      avatar={{ background: "var(--ink)", initials: "БТ", subtitle: "Бауыржан Т. · админ", title: "Al-Safa Hajj Travel" }}
      navGroups={useExtendedNav ? extendedNav : defaultNav}
      roleClassName="pill-operator"
      roleLabel="● OPERATOR"
    >
      {children}
    </RoleShell>
  );
}
