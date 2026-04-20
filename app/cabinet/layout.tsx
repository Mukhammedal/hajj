import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

const navItems = [
  { href: "/cabinet/dashboard", label: "Дашборд" },
  { href: "/cabinet/documents", label: "Документы" },
  { href: "/cabinet/payment", label: "Оплата" },
  { href: "/cabinet/checklist", label: "Чек-лист" },
];

export default async function CabinetLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["pilgrim"]);

  return (
    <AppShell
      roleLabel="pilgrim"
      title="Кабинет паломника"
      subtitle="Готовность, документы, платежи и напоминания в одном потоке."
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
