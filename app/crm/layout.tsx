import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { CrmShell } from "@/components/shell/crm-shell";

export default async function CrmLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["operator"]);

  return <CrmShell>{children}</CrmShell>;
}
