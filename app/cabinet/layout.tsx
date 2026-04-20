import type { ReactNode } from "react";

import { requireAnyRole } from "@/lib/auth";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";
import { CabinetShell } from "@/components/shell/cabinet-shell";

export default async function CabinetLayout({ children }: { children: ReactNode }) {
  await requireAnyRole(["pilgrim"]);
  const cabinet = await loadCabinetBundle();
  const docsCount = new Set(cabinet?.documents.map((document) => document.type) ?? []).size;
  const paymentPercent = cabinet?.payment?.totalAmount
    ? Math.round((cabinet.payment.paidAmount / cabinet.payment.totalAmount) * 100)
    : 0;
  const checklistTotal = cabinet?.checklist.length ?? 0;
  const checklistChecked = cabinet?.checklist.filter((item) => item.isChecked).length ?? 0;
  const supportCount = cabinet?.notifications.length ? Math.min(cabinet.notifications.length, 2) : 0;

  return (
    <CabinetShell
      avatar={{
        initials: cabinet?.pilgrim.fullName
          .split(" ")
          .filter(Boolean)
          .map((part) => part[0]?.toUpperCase())
          .slice(0, 2)
          .join("") || "ЕМ",
        subtitle: cabinet?.group?.name ?? "Рамазан-2026",
        title: cabinet?.pilgrim.fullName ?? "Ерлан М.",
      }}
      stats={{
        checklistChecked,
        checklistTotal,
        docsCount,
        paymentPercent,
        supportCount,
      }}
    >
      {children}
    </CabinetShell>
  );
}
