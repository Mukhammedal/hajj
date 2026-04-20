import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { AppShell } from "@/components/shell/app-shell";

const navItems = [
  { href: "/admin/operators", label: "Операторы" },
  { href: "/admin/analytics", label: "Аналитика" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["admin"]);

  return (
    <AppShell
      roleLabel="admin"
      title="Админ-панель"
      subtitle="Платформенный контроль операторов, выручки и пользовательских сигналов качества."
      navItems={navItems}
    >
      {children}
    </AppShell>
  );
}
