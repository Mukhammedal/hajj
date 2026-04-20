import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

const navItems = [
  { href: "/crm/dashboard", label: "Дашборд" },
  { href: "/crm/pilgrims", label: "Паломники" },
  { href: "/crm/groups", label: "Группы" },
  { href: "/crm/payments", label: "Платежи" },
  { href: "/crm/notifications", label: "Уведомления" },
  { href: "/crm/analytics", label: "Аналитика" },
];

export default async function CrmLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["operator"]);

  return (
    <AppShell
      roleLabel="operator"
      title="CRM оператора"
      subtitle="Паломники, группы, квоты, платежи и уведомления на одном канале управления."
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
