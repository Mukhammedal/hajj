import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { AdminShell } from "@/components/shell/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["admin"]);

  return <AdminShell>{children}</AdminShell>;
}
