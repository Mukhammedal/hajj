"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { RoleShell, type ShellNavGroup } from "@/components/shell/role-shell";

interface CabinetShellProps {
  avatar?: {
    initials: string;
    subtitle: string;
    title: string;
  };
  children: ReactNode;
  stats?: {
    checklistChecked: number;
    checklistTotal: number;
    docsCount: number;
    paymentPercent: number;
    supportCount: number;
  };
}

function buildDefaultNav(stats: NonNullable<CabinetShellProps["stats"]>): ShellNavGroup[] {
  return [
    {
      items: [
        { href: "/cabinet/dashboard", icon: "chev", label: "Обзор" },
        { count: `${stats.docsCount}/5`, href: "/cabinet/documents", icon: "doc", label: "Документы" },
        { count: `${stats.paymentPercent}%`, href: "/cabinet/payment", label: "Оплата", prefix: "◎" },
        { count: `${stats.checklistChecked}/${stats.checklistTotal}`, href: "/cabinet/checklist", label: "Чек-лист", prefix: "☑" },
        { href: "/cabinet/group", label: "Моя группа", prefix: "◊" },
        { href: "/cabinet/contract", label: "Договор и QR", prefix: "▣" },
      ],
    },
    {
      label: "Поддержка",
      items: [
        { count: stats.supportCount ? String(stats.supportCount) : undefined, href: "/cabinet/chat", icon: "wa", label: "Чат с куратором" },
        { href: "/cabinet/faq", label: "FAQ", prefix: "?" },
        { href: "/cabinet/profile", label: "Настройки", prefix: "◈" },
      ],
    },
  ];
}

function buildProfileNav(stats: NonNullable<CabinetShellProps["stats"]>): ShellNavGroup[] {
  return [
    {
      items: [
        { href: "/cabinet/dashboard", label: "Обзор" },
        { count: `${stats.docsCount}/5`, href: "/cabinet/documents", label: "Документы" },
        { count: `${stats.paymentPercent}%`, href: "/cabinet/payment", label: "Оплата" },
        { count: `${stats.checklistChecked}/${stats.checklistTotal}`, href: "/cabinet/checklist", label: "Чек-лист" },
        { href: "/cabinet/group", label: "Моя группа" },
        { href: "/cabinet/contract", label: "Договор и QR" },
      ],
    },
    {
      label: "Поддержка",
      items: [
        { count: stats.supportCount ? String(stats.supportCount) : undefined, href: "/cabinet/chat", label: "Чат с куратором" },
        { href: "/cabinet/faq", label: "FAQ" },
      ],
    },
    {
      label: "Аккаунт",
      items: [
        { href: "/cabinet/profile", label: "Мой профиль" },
        { href: "/cabinet/profile#settings", label: "Настройки" },
      ],
    },
  ];
}

export function CabinetShell({ avatar, children, stats }: CabinetShellProps) {
  const pathname = usePathname();
  const resolvedStats = stats ?? {
    checklistChecked: 18,
    checklistTotal: 34,
    docsCount: 4,
    paymentPercent: 70,
    supportCount: 2,
  };
  const navGroups = pathname.startsWith("/cabinet/profile") ? buildProfileNav(resolvedStats) : buildDefaultNav(resolvedStats);

  return (
    <RoleShell
      avatar={avatar ?? { initials: "ЕМ", subtitle: "Рамазан-2026", title: "Ерлан М." }}
      navGroups={navGroups}
      roleClassName="pill-pilgrim"
      roleLabel="● PILGRIM"
    >
      {children}
    </RoleShell>
  );
}
